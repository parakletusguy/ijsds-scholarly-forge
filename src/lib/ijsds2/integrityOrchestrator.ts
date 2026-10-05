import { supabase } from "@/integrations/supabase/client";
import { getPlagiarismAdapter } from "./adapters/plagiarismAdapter";
import { getAiDetectionAdapter } from "./adapters/aiDetectionAdapter";
import {
  extractCitationsAndContexts,
  resolveReferenceAgainstCrossref,
  scoreCitationRelevance,
  discoverRelatedArticles,
} from "./citationEngine";
import type {
  Manuscript,
  ManuscriptIntegrityAudit,
  AuthorAuditReport,
  ManuscriptState,
  CitationResolutionStatus,
} from "@/types/ijsds2";

export interface RunIntegrityAuditOptions {
  manuscriptId: string;
  revisionNo?: number;
  plagiarismProvider?: string;
  aiProvider?: string;
}

/**
 * Runs the full Stage 2 Research Integrity & Citation Intelligence Stack.
 * Implements Section 4.B and Section 7 of PRD v2.4.0-PROD.
 */
export async function executeIntegrityAudit({
  manuscriptId,
  revisionNo = 1,
  plagiarismProvider = "benchmark",
  aiProvider = "standard",
}: RunIntegrityAuditOptions): Promise<AuthorAuditReport> {
  const startedAt = new Date().toISOString();

  // 1. Fetch manuscript
  const { data: manuscriptRecord, error: msError } = await supabase
    .from("manuscripts" as any)
    .select("*")
    .eq("id", manuscriptId)
    .single();

  if (msError || !manuscriptRecord) {
    throw new Error(`Manuscript not found: ${msError?.message || manuscriptId}`);
  }

  const manuscript = manuscriptRecord as unknown as Manuscript;
  const fullText = (manuscript.parsed_payload?.full_text as string) ||
    `${manuscript.title}\n\nAbstract:\n${manuscript.abstract}\n\n` +
    (manuscript.parsed_payload?.sections?.map((s) => `${s.heading}\n${s.body}`).join("\n\n") || "");

  // 2. Initialize Audit Ledger Entry (status = RUNNING)
  const { data: auditRecord } = await supabase
    .from("manuscript_integrity_audits" as any)
    .upsert(
      {
        manuscript_id: manuscriptId,
        revision_no: revisionNo,
        status: "RUNNING",
        started_at: startedAt,
      },
      { onConflict: "manuscript_id,revision_no" }
    )
    .select("id")
    .single();

  const auditId = (auditRecord as any)?.id;

  // 3. 2A: Structural, Scope & Ethics Pre-screen
  const words = fullText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const hasAbstract = manuscript.abstract.length > 50;
  const hasEthicsStatement = /ethics|ethical approval|informed consent|declaration of interest|conflict of interest/i.test(fullText);
  const hasReferences = /(?:references|bibliography|works cited)/i.test(fullText);
  const wordCountValid = wordCount >= 300; // minimum scholarly word count

  const structuralNotes: string[] = [];
  if (!hasAbstract) structuralNotes.push("Abstract is missing or too brief.");
  if (!hasEthicsStatement) structuralNotes.push("Missing explicit ethics or conflict of interest declaration.");
  if (!hasReferences) structuralNotes.push("No distinct References/Bibliography section detected.");
  if (!wordCountValid) structuralNotes.push("Manuscript length is below the minimum threshold.");

  // 4. 2B: Plagiarism & Similarity Detection
  const plagiarismAdapter = getPlagiarismAdapter(plagiarismProvider);
  const plagiarism = await plagiarismAdapter.check({
    fullText,
    title: manuscript.title,
    excludeBibliography: true,
  });

  // 5. 2C: AI Authorship Risk Detection
  const aiAdapter = getAiDetectionAdapter(aiProvider);
  const aiAuthorship = await aiAdapter.score({
    fullText,
    title: manuscript.title,
  });

  // 6. 2D & 2E: Citation Extraction, Crossref/OpenAlex Resolution & ML Relevance
  const extractedCitations = extractCitationsAndContexts(fullText);
  const citationLedger: AuthorAuditReport["citationLedger"] = [];
  const citationRecordsToInsert: any[] = [];
  let unresolvedCount = 0;
  let warningCount = 0;

  for (const ref of extractedCitations.references) {
    const resolution = await resolveReferenceAgainstCrossref(ref);
    const relevance = scoreCitationRelevance(ref, resolution);

    if (resolution.resolutionStatus === "UNRESOLVED") {
      unresolvedCount++;
    }
    if (relevance.warningCodes.length > 0) {
      warningCount++;
    }

    citationLedger.push({
      bibliographyIndex: ref.index,
      rawReference: ref.raw,
      resolutionStatus: resolution.resolutionStatus,
      resolvedDoi: resolution.resolvedDoi,
      normalizedTitle: ref.normalizedTitle,
      warnings: relevance.warningCodes,
      semanticRelevanceScore: relevance.relevanceScore,
    });

    citationRecordsToInsert.push({
      manuscript_id: manuscriptId,
      audit_id: auditId,
      bibliography_index: ref.index,
      raw_reference: ref.raw,
      in_text_contexts: ref.inTextContexts,
      normalized_title: ref.normalizedTitle || null,
      normalized_authors: ref.authors,
      publication_year: ref.year || null,
      supplied_doi: ref.doi || null,
      resolved_doi: resolution.resolvedDoi || null,
      crossref_work_id: resolution.crossrefId || null,
      openalex_work_id: resolution.openalexId || null,
      resolution_status: resolution.resolutionStatus,
      metadata_match_score: resolution.metadataMatchScore,
      semantic_relevance_score: relevance.relevanceScore,
      warning_codes: relevance.warningCodes,
    });
  }

  // Insert citation records in database
  if (citationRecordsToInsert.length > 0 && auditId) {
    await supabase.from("manuscript_citations" as any).insert(citationRecordsToInsert);
  }

  // 7. Discover Related Literature Recommendations
  const relatedRecommendations = await discoverRelatedArticles(
    manuscript.abstract,
    manuscript.parsed_payload?.keywords || []
  );

  if (relatedRecommendations.length > 0 && auditId) {
    const recsToInsert = relatedRecommendations.map((r, idx) => ({
      manuscript_id: manuscriptId,
      audit_id: auditId,
      source: r.source,
      external_work_id: r.external_work_id || null,
      doi: r.doi || null,
      title: r.title,
      publication_year: r.publication_year || null,
      relevance_score: r.relevance_score,
      graph_proximity_score: r.graph_proximity_score || null,
      recommendation_reason: r.recommendation_reason || null,
      rank_position: idx + 1,
      selected_by_author: false,
    }));
    await supabase.from("citation_recommendations" as any).insert(recsToInsert);
  }

  // 8. 2F: Policy Evaluator & Decision
  const policyRulesHit: string[] = [];
  const requiredActions: string[] = [];
  let decision: AuthorAuditReport["decision"] = "AUDIT_PASSED_PENDING_APC";

  // Critical checks -> AUDIT_REJECTED
  if (plagiarism.risk === "CRITICAL" || plagiarism.score > 0.28) {
    policyRulesHit.push("RULE_PLAGIARISM_CRITICAL_OVERLAP");
    requiredActions.push("Manuscript contains unacceptable textual similarity exceeding the scholarly threshold.");
    decision = "AUDIT_REJECTED";
  }

  if (!hasReferences || !wordCountValid) {
    policyRulesHit.push("RULE_STRUCTURAL_DEFICIT");
    requiredActions.push("Core structural sections (abstract/body/references) are insufficient.");
    decision = "AUDIT_REJECTED";
  }

  // Revision checks -> AUDIT_REVISION_REQUESTED
  if (decision !== "AUDIT_REJECTED") {
    if (!hasEthicsStatement) {
      policyRulesHit.push("RULE_MISSING_ETHICS_DECLARATION");
      requiredActions.push("Add an explicit Ethics and Conflicts of Interest statement to your manuscript.");
      decision = "AUDIT_REVISION_REQUESTED";
    }

    if (plagiarism.risk === "HIGH" || plagiarism.risk === "MODERATE") {
      policyRulesHit.push("RULE_MODERATE_SIMILARITY");
      requiredActions.push("Paraphrase identified overlapping passages and ensure all quoted sources are cited.");
      decision = "AUDIT_REVISION_REQUESTED";
    }

    if (extractedCitations.orphanedInTextMarkers.length > 0) {
      policyRulesHit.push("RULE_ORPHANED_CITATIONS");
      requiredActions.push(
        `Resolve orphaned in-text citation markers missing in bibliography: ${extractedCitations.orphanedInTextMarkers.slice(0, 5).join(", ")}`
      );
      decision = "AUDIT_REVISION_REQUESTED";
    }

    if (extractedCitations.uncitedBibliographyIndices.length > 3) {
      policyRulesHit.push("RULE_UNCITED_BIBLIOGRAPHY");
      requiredActions.push("Link uncited references in your bibliography to appropriate in-text discussion.");
      decision = "AUDIT_REVISION_REQUESTED";
    }

    // AI SIGNAL GOVERNANCE: High AI risk requires clarification or human review, NEVER outright auto-rejection!
    if (aiAuthorship.riskBand === "HIGH") {
      policyRulesHit.push("RULE_AI_RISK_FLAG");
      requiredActions.push(
        "Please provide an AI Use & Disclosure statement detailing any assistive generative tools utilized in draft preparation."
      );
      // AI signal alone triggers revision or editorial review, never rejection
      decision = "AUDIT_REVISION_REQUESTED";
    }
  }

  const completedAt = new Date().toISOString();
  const nextManuscriptState: ManuscriptState = decision;

  // 9. Persist finalized Audit Ledger
  if (auditId) {
    await supabase
      .from("manuscript_integrity_audits" as any)
      .update({
        status: "COMPLETED",
        plagiarism_score: plagiarism.score,
        plagiarism_risk: plagiarism.risk,
        plagiarism_provider: plagiarism.provider,
        ai_risk_score: aiAuthorship.score,
        ai_risk_band: aiAuthorship.riskBand,
        ai_detector_provider: aiAuthorship.provider,
        ai_detector_model_version: aiAuthorship.modelVersion,
        citation_validation_score: Number((1 - unresolvedCount / Math.max(extractedCitations.references.length, 1)).toFixed(4)),
        unresolved_citation_count: unresolvedCount,
        citation_warning_count: warningCount,
        requires_human_review: aiAuthorship.requiresHumanReview || plagiarism.risk === "HIGH",
        policy_rules_hit: policyRulesHit,
        evidence_payload: {
          structural_check: {
            has_abstract: hasAbstract,
            has_keywords: (manuscript.parsed_payload?.keywords?.length || 0) > 0,
            has_ethics_statement: hasEthicsStatement,
            has_references: hasReferences,
            word_count_valid: wordCountValid,
            notes: structuralNotes,
          },
          plagiarism_matches: plagiarism.matches,
          ai_flagged_segments: aiAuthorship.flaggedSegments,
          orphaned_markers: extractedCitations.orphanedInTextMarkers,
          uncited_references: extractedCitations.uncitedBibliographyIndices,
        },
        completed_at: completedAt,
      })
      .eq("id", auditId);
  }

  // 10. Update Manuscript State
  await supabase
    .from("manuscripts" as any)
    .update({
      current_state: nextManuscriptState,
      audit_completed_at: completedAt,
    })
    .eq("id", manuscriptId);

  // 11. Build and return Author-Facing Integrity Report
  const summary = decision === "AUDIT_PASSED_PENDING_APC"
    ? "Integrity audit passed successfully. Your manuscript has cleared all plagiarism, AI-risk, and citation validation checks. You may now complete Gate 2 (₦25,500 APC) to advance to peer review."
    : decision === "AUDIT_REVISION_REQUESTED"
    ? "Integrity audit completed with revisions required. Please address the actionable items below and re-upload your revised manuscript. Resubmission under Stage 2 revision does not incur an additional evaluation fee."
    : "Integrity audit failed due to significant policy violations. Resubmission requires a substantial revision and a new Gate 1 evaluation.";

  return {
    manuscriptId,
    revisionNo,
    decision,
    reasonCodes: policyRulesHit,
    summary,
    plagiarism,
    aiAuthorship,
    citationLedger,
    relatedRecommendations: relatedRecommendations.map((r) => ({
      title: r.title,
      year: r.publication_year,
      doi: r.doi,
      relevanceScore: r.relevance_score,
      reason: r.recommendation_reason,
    })),
    requiredActions,
    generatedAt: completedAt,
  };
}
