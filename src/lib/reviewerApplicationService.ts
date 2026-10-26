import { api } from './apiClient';

export interface ReviewerApplicationInput {
  full_name: string;
  institutional_email: string;
  orcid_id: string;
  researchgate_url: string;
  google_scholar_url: string;
}

export interface ReviewerApplication extends ReviewerApplicationInput {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  decision_reason: string | null;
  created_at: string;
  decided_at: string | null;
  applicant?: { id: string; email: string | null; affiliation: string | null };
}

type Envelope<T> = { success: true; data: T };

export const submitReviewerApplication = async (body: ReviewerApplicationInput) =>
  (await api.post<Envelope<ReviewerApplication>>('/api/reviewer-applications', body)).data;

export const getMyReviewerApplications = async () =>
  (await api.get<Envelope<ReviewerApplication[]>>('/api/reviewer-applications/me')).data;

export const getReviewerApplications = async (status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ALL' = 'PENDING') =>
  (await api.get<Envelope<ReviewerApplication[]>>(`/api/reviewer-applications?status=${status}`)).data;

export const decideReviewerApplication = async (id: string, approve: boolean, reason?: string) =>
  (await api.post<Envelope<{ id: string; status: string }>>(`/api/reviewer-applications/${id}/decision`, { approve, reason })).data;

/** ORCID iD format + ISO 7064 MOD 11-2 check digit (mirrors the server). */
export const isValidOrcid = (raw: string) => {
  const m = raw.trim().match(/^(\d{4})-?(\d{4})-?(\d{4})-?(\d{3}[\dXx])$/);
  if (!m) return false;
  const d = (m[1] + m[2] + m[3] + m[4]).toUpperCase();
  let total = 0;
  for (const ch of d.slice(0, 15)) total = (total + Number(ch)) * 2;
  const check = (12 - (total % 11)) % 11;
  return d[15] === (check === 10 ? 'X' : String(check));
};
