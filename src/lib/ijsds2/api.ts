import { api } from "@/lib/apiClient";
import type {
  AuthorAuditReport,
  BatchCycle,
  BatchStatus,
  ManuscriptStatus,
  MonthlyBatchReleaseResult,
  ReviewerMatchCandidate,
  ReviewerReferralProfile,
} from "@/types/ijsds2";

type Envelope<T> = { success: true; data: T };
const unwrap = async <T>(p: Promise<Envelope<T>>): Promise<T> => (await p).data;

const BASE = "/api/ijsds2";

export const getBatchCycle = () => unwrap(api.get<Envelope<BatchCycle>>(`${BASE}/cycle`));

export const validateReferralCode = (code: string) =>
  unwrap(api.post<Envelope<{ valid: boolean }>>(`${BASE}/referrals/validate`, { code }));

/**
 * Asks the server to verify a Paystack reference and settle the gate. The server checks the
 * amount, payer and gate against Paystack's own record; the browser's word is never trusted.
 */
export const settleGatePayment = (params: {
  reference: string;
  gate: "GATE_1" | "GATE_2";
  manuscriptId?: string;
  submissionId?: string;
}) => unwrap(api.post<Envelope<Record<string, unknown>>>(`${BASE}/payments/verify`, params));

export const getManuscriptStatus = (submissionId: string) =>
  unwrap(api.get<Envelope<ManuscriptStatus>>(`${BASE}/manuscripts/by-submission/${submissionId}`));

export const getLatestAuditReport = (manuscriptId: string) =>
  unwrap(api.get<Envelope<AuthorAuditReport>>(`${BASE}/manuscripts/${manuscriptId}/audit-report`));

export const uploadRevision = (manuscriptId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return unwrap(api.upload<Envelope<{ revisionNo: number; auditScheduledFor: string }>>(`${BASE}/manuscripts/${manuscriptId}/revision`, form));
};

export const setRecommendationSelected = (id: string, selected: boolean) =>
  unwrap(api.patch<Envelope<{ id: string; selected: boolean }>>(`${BASE}/recommendations/${id}`, { selected }));

export const matchReviewers = (submissionId: string, limit = 5) =>
  unwrap(api.get<Envelope<{ method: "vector" | "keyword"; candidates: ReviewerMatchCandidate[] }>>(`${BASE}/manuscripts/${submissionId}/reviewers/match?limit=${limit}`));

export const assignReviewers = (submissionId: string, reviewerUserIds: string[]) =>
  unwrap(api.post<Envelope<unknown[]>>(`${BASE}/manuscripts/${submissionId}/reviewers/assign`, { reviewerUserIds }));

export const getBatchStatus = () => unwrap(api.get<Envelope<BatchStatus>>(`${BASE}/batch/status`));

export const executeMonthlyBatch = () =>
  unwrap(api.post<Envelope<MonthlyBatchReleaseResult>>(`${BASE}/batch/execute`, {}));

export const getMyReviewerProfile = () => unwrap(api.get<Envelope<ReviewerReferralProfile>>(`${BASE}/reviewer/me`));

export const uploadAuthorRevision = (manuscriptId: string, file: File, note?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (note) form.append("note", note);
  return unwrap(api.upload<Envelope<{ round: number; reReviewers: number }>>(`${BASE}/manuscripts/${manuscriptId}/author-revision`, form));
};

// ── Editorial: audit review queue ──
export interface ReviewQueueItem {
  id: string;
  revision_no: number;
  status: "MANUAL_REVIEW" | "FAILED";
  requires_human_review: boolean;
  policy_rules_hit: string[];
  last_error: string | null;
  created_at: string;
  manuscript: { id: string; title: string; submission_id: string };
}
export const getReviewQueue = () => unwrap(api.get<Envelope<ReviewQueueItem[]>>(`${BASE}/audits/review-queue`));
export const getAuditReport = (auditId: string) => unwrap(api.get<Envelope<AuthorAuditReport>>(`${BASE}/audits/${auditId}/report`));
export const resolveAudit = (auditId: string, outcome: string, reason: string) =>
  unwrap(api.post<Envelope<unknown>>(`${BASE}/audits/${auditId}/resolve`, { outcome, reason }));
export const requeueAudit = (auditId: string) => unwrap(api.post<Envelope<unknown>>(`${BASE}/audits/${auditId}/requeue`, {}));

// ── Admin: integrity thresholds ──
export interface IntegrityConfig {
  plagiarism: { moderate: number; high: number; critical: number };
  ai: { medium: number; high: number };
  citations: { max_unresolved_ratio: number; max_uncited_references: number; min_relevance: number };
  structure: { min_word_count: number };
  auto_reject_structural: boolean;
  related_list_size: number;
  expose_raw_ai_score: boolean;
}
export const getIntegrityConfig = () =>
  unwrap(api.get<Envelope<{ active: IntegrityConfig & { id: string }; history: Array<{ id: string; created_at: string; changed_by: string | null; reason: string | null }> }>>(`${BASE}/config/integrity`));
export const saveIntegrityConfig = (config: Partial<IntegrityConfig>, reason: string) =>
  unwrap(api.put<Envelope<unknown>>(`${BASE}/config/integrity`, { config, reason }));

// ── Referral wallet payouts ──
export interface Withdrawal {
  id: string;
  amount_naira: number;
  status: "REQUESTED" | "PAID" | "REJECTED";
  note: string | null;
  created_at: string;
  processed_at: string | null;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  reviewer?: { full_name: string | null; email: string | null };
}
export const getMyWithdrawals = () => unwrap(api.get<Envelope<Withdrawal[]>>(`${BASE}/reviewer/withdrawals`));
export const requestWithdrawal = (body: { amount: number; bank_name: string; account_number: string; account_name: string }) =>
  unwrap(api.post<Envelope<Withdrawal>>(`${BASE}/reviewer/withdrawals`, body));
export const getAllWithdrawals = (status?: string) => unwrap(api.get<Envelope<Withdrawal[]>>(`${BASE}/withdrawals${status ? `?status=${status}` : ""}`));
export const processWithdrawal = (id: string, outcome: "PAID" | "REJECTED", note?: string) =>
  unwrap(api.post<Envelope<Withdrawal>>(`${BASE}/withdrawals/${id}/process`, { outcome, note }));
