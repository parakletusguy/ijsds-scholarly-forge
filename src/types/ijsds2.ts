// ==============================================================================
// IJSDS 2.0 Types & Interfaces (v2.4.0-PROD Specification)
// ==============================================================================

export type ManuscriptState =
  | 'DRAFT_PENDING_FEE1'
  | 'SUBMITTED'
  | 'IN_AUDIT'
  | 'AUDIT_REJECTED'
  | 'AUDIT_REVISION_REQUESTED'
  | 'AUDIT_PASSED_PENDING_APC'
  | 'APC_PAID'
  | 'REVIEWER_MATCHED'
  | 'IN_PEER_REVIEW'
  | 'AUTHOR_REVISION_REQUESTED'
  | 'ACCEPTED'
  | 'IN_PRODUCTION'
  | 'READY_FOR_RELEASE'
  | 'PUBLISHED';

export type AuditRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'MANUAL_REVIEW';

export type CitationResolutionStatus =
  | 'VALIDATED'
  | 'PARTIAL_MATCH'
  | 'UNRESOLVED'
  | 'METADATA_MISMATCH';

export interface ReviewerProfile {
  id: string;
  user_id: string;
  referral_code: string;
  wallet_balance_naira: number;
  expertise_keywords: string[];
  expertise_vector?: number[] | null;
  is_available: boolean;
  active_load: number;
  created_at: string;
  updated_at: string;
}

export interface Manuscript {
  id: string;
  title: string;
  abstract: string;
  author_id: string;
  referred_by_reviewer_id?: string | null;
  current_state: ManuscriptState;
  raw_file_r2_key: string;
  parsed_payload: {
    sections?: Array<{ heading: string; body: string }>;
    raw_references?: string[];
    word_count?: number;
    char_count?: number;
    [key: string]: any;
  };
  abstract_vector?: number[] | null;
  doi?: string | null;
  audit_scheduled_for?: string | null;
  audit_completed_at?: string | null;
  target_publication_year?: number | null;
  target_publication_month?: number | null;
  published_at?: string | null;
  audit_revision_count: number;
  created_at: string;
  updated_at: string;
}

export interface ManuscriptIntegrityAudit {
  id: string;
  manuscript_id: string;
  revision_no: number;
  status: AuditRunStatus;
  plagiarism_score?: number | null; // 0.00000 - 1.00000
  plagiarism_risk?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | null;
  plagiarism_provider?: string | null;
  ai_risk_score?: number | null; // 0.00000 - 1.00000
  ai_risk_band?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  ai_detector_provider?: string | null;
  ai_detector_model_version?: string | null;
  citation_validation_score?: number | null;
  unresolved_citation_count: number;
  citation_warning_count: number;
  requires_human_review: boolean;
  policy_rules_hit: string[];
  evidence_payload: {
    plagiarism_matches?: Array<{
      source_title: string;
      source_url?: string;
      similarity_pct: number;
      matched_snippet: string;
    }>;
    ai_flagged_segments?: Array<{
      segment_index: number;
      text_snippet: string;
      confidence: number;
      label: string;
    }>;
    structural_check?: {
      has_abstract: boolean;
      has_keywords: boolean;
      has_ethics_statement: boolean;
      has_references: boolean;
      word_count_valid: boolean;
      notes: string[];
    };
    [key: string]: any;
  };
  author_report_r2_key?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface ManuscriptCitation {
  id: string;
  manuscript_id: string;
  audit_id: string;
  bibliography_index: number;
  raw_reference: string;
  in_text_contexts: string[];
  normalized_title?: string | null;
  normalized_authors: Array<{ first_name?: string; last_name: string }>;
  publication_year?: number | null;
  supplied_doi?: string | null;
  resolved_doi?: string | null;
  crossref_work_id?: string | null;
  openalex_work_id?: string | null;
  resolution_status: CitationResolutionStatus;
  metadata_match_score?: number | null;
  semantic_relevance_score?: number | null;
  citation_context_vector?: number[] | null;
  warning_codes: string[];
  created_at: string;
}

export interface CitationRecommendation {
  id: string;
  manuscript_id: string;
  audit_id: string;
  source: 'CROSSREF' | 'OPENALEX' | 'LOCAL_INDEX';
  external_work_id?: string | null;
  doi?: string | null;
  title: string;
  publication_year?: number | null;
  relevance_score: number;
  graph_proximity_score?: number | null;
  recommendation_reason?: string | null;
  rank_position: number;
  selected_by_author: boolean;
  created_at: string;
}

export interface PaymentLedger {
  id: string;
  manuscript_id: string;
  gateway_reference: string;
  payment_type: 'EVALUATION_FEE' | 'APC';
  amount_naira: number;
  status: 'pending' | 'success' | 'failed';
  raw_webhook_payload?: any;
  created_at: string;
}

export interface ReferralPayoutLedger {
  id: string;
  reviewer_id: string;
  manuscript_id: string;
  amount_naira: number;
  status: 'PENDING' | 'CREDITED' | 'WITHDRAWN';
  created_at: string;
}

export interface Gate2DistributionLedger {
  id: string;
  manuscript_id: string;
  payment_ledger_id: string;
  tech_support_naira: number; // 3000.00
  designer_naira: number; // 1000.00
  journal_account_naira: number; // 12000.00
  journal_manager_naira: number; // 9500.00
  created_at: string;
}

// Financial constants per PRD v2.4.0-PROD
export const IJSDS2_FINANCIALS = {
  GATE_1_EVALUATION_FEE_NAIRA: 5000,
  GATE_2_APC_NAIRA: 25500,
  TOTAL_APC_NAIRA: 30500,
  REFERRAL_COMMISSION_NAIRA: 1000,
  GATE_2_SPLIT: {
    TECH_SUPPORT_NAIRA: 3000,
    DESIGNER_NAIRA: 1000,
    JOURNAL_ACCOUNT_NAIRA: 12000,
    JOURNAL_MANAGER_NAIRA: 9500,
  },
} as const;

// Pluggable Integrity Adapters Interfaces
export interface PlagiarismCheckRequest {
  fullText: string;
  title: string;
  excludeBibliography?: boolean;
}

export interface PlagiarismCheckResult {
  provider: string;
  score: number; // 0.0 to 1.0 (overlap ratio)
  risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  matches: Array<{
    source_title: string;
    source_url?: string;
    similarity_pct: number;
    matched_snippet: string;
  }>;
}

export interface AiDetectionCheckRequest {
  fullText: string;
  title: string;
}

export interface AiDetectionCheckResult {
  provider: string;
  modelVersion: string;
  score: number; // 0.0 to 1.0
  riskBand: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresHumanReview: boolean;
  flaggedSegments: Array<{
    segment_index: number;
    text_snippet: string;
    confidence: number;
    label: string;
  }>;
  disclaimer: string;
}

export interface AuthorAuditReport {
  manuscriptId: string;
  revisionNo: number;
  decision: 'AUDIT_PASSED_PENDING_APC' | 'AUDIT_REVISION_REQUESTED' | 'AUDIT_REJECTED';
  reasonCodes: string[];
  summary: string;
  plagiarism: PlagiarismCheckResult;
  aiAuthorship: AiDetectionCheckResult;
  citationLedger: Array<{
    bibliographyIndex: number;
    rawReference: string;
    resolutionStatus: CitationResolutionStatus;
    resolvedDoi?: string | null;
    normalizedTitle?: string | null;
    warnings: string[];
    semanticRelevanceScore?: number | null;
  }>;
  relatedRecommendations: Array<{
    title: string;
    year?: number | null;
    doi?: string | null;
    relevanceScore: number;
    reason?: string | null;
  }>;
  requiredActions: string[];
  generatedAt: string;
}
