// IJSDS 2.0 (PRD v2.4.0-PROD) — client-side types for the /api/ijsds2 endpoints.
// All IJSDS 2.0 business logic (payments, audits, reviewer matching, batch release) runs on
// the backend; the browser only displays state and calls the API.

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

export type AuditOutcome =
  | 'AUDIT_PASSED_PENDING_APC'
  | 'AUDIT_REVISION_REQUESTED'
  | 'AUDIT_REJECTED';

export type AuditRunStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW';

export type CitationResolutionStatus =
  | 'VALIDATED'
  | 'PARTIAL_MATCH'
  | 'UNRESOLVED'
  | 'METADATA_MISMATCH';

// Display copy only. The fees are enforced server-side (ijsds2.constants.js); the amounts
// actually charged at checkout also include the Paystack processing-fee gross-up.
export const IJSDS2_FINANCIALS = {
  GATE_1_EVALUATION_FEE_NAIRA: 5000,
  GATE_2_APC_NAIRA: 25500,
  TOTAL_APC_NAIRA: 30500,
  REFERRAL_COMMISSION_NAIRA: 1000,
} as const;

export interface ManuscriptStatus {
  id: string;
  current_state: ManuscriptState;
  audit_scheduled_for: string | null;
  audit_completed_at: string | null;
  audit_revision_count: number;
  target_publication_year: number | null;
  target_publication_month: number | null;
  published_at: string | null;
  doi: string | null;
  /** False while the fee/audit gates are switched off on the server. */
  payment_gates_enforced?: boolean;
  audits: Array<{
    id: string;
    revision_no: number;
    status: AuditRunStatus;
    decision: ManuscriptState | null;
    completed_at: string | null;
  }>;
}

export interface AuthorAuditReport {
  auditId: string;
  manuscriptId: string;
  revisionNo: number;
  status: AuditRunStatus;
  decision: AuditOutcome | null;
  reasonCodes: string[];
  requiredActions: string[];
  plagiarism: {
    risk: string | null;
    provider: string | null;
    matches: Array<{ source_title: string; source_url?: string; similarity_pct: number; matched_snippet: string }>;
    exclusions: string;
  };
  aiAuthorship: {
    riskBand: string | null;
    provider: string | null;
    modelVersion: string | null;
    mode?: 'declaration' | 'detector' | null; // 'declaration' = no detector; an AI-use disclosure is required instead
    hasDisclosure?: boolean | null;
    score?: number | null; // only when a detector ran and the journal exposes raw scores (or for staff)
    flaggedSegments: Array<{ segment_index: number; text_snippet: string; confidence: number; label: string }>;
    disclaimer: string;
  };
  citationLedger: Array<{
    id: string;
    bibliographyIndex: number | null;
    rawReference: string;
    resolutionStatus: CitationResolutionStatus;
    resolvedDoi: string | null;
    openalexId: string | null;
    warnings: string[];
    relevanceScore: number | null;
  }>;
  orphanedMarkers: string[];
  relatedRecommendations: Array<{
    id: string;
    title: string;
    year: number | null;
    doi: string | null;
    externalWorkId: string | null;
    source: string;
    relevanceScore: number;
    reason: string | null;
    selected: boolean | null;
  }>;
  disclaimer: string;
  generatedAt: string | null;
  internal?: {
    requiresHumanReview: boolean;
    componentErrors: Record<string, string>;
    incompleteComponents: string[];
    configRevisionId: string | null;
    resolvedBy: string | null;
    resolvedReason: string | null;
  };
}

export interface BatchCycle {
  targetYear: number;
  targetMonth: number;
  cutoffAt: string;
  releaseAt: string;
  isCutoffPassed: boolean;
  daysUntilRelease: number;
}

export interface BatchStatus extends BatchCycle {
  readyCount: number;
  inProgressCount: number;
}

export interface MonthlyBatchReleaseResult {
  executedAt: string;
  targetYear: number;
  targetMonth: number;
  publishedCount: number;
  rolledOverCount: number;
  publishedManuscriptIds: string[];
  skipped: Array<{ manuscriptId: string; reason: string }>;
}

export interface ReviewerMatchCandidate {
  reviewerId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  affiliation: string | null;
  similarity: number;
  expertiseKeywords: string[];
  activeLoad: number;
}

export interface ReviewerReferralProfile {
  referral_code: string;
  wallet_balance_naira: number;
  active_load: number;
  is_available: boolean;
  expertise_keywords: string[];
}
