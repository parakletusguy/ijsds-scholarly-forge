import { api } from './apiClient';

export interface Submission {
  id: string;
  article_id: string;
  submitter_id: string;
  submission_type: string;
  status: string;
  cover_letter?: string;
  reviewer_suggestions?: string | null;
  editor_notes?: string | null;
  approved_by_editor?: boolean;
  approved_at?: string | null;
  submitted_at: string;
  vetting_fee?: boolean;
  processing_fee?: boolean;
  article?: Record<string, any>;
  submitter?: Record<string, any>;
  reviews?: Record<string, any>[];
}

interface ListResponse { success: true; data: Submission[] }
interface SingleResponse { success: true; data: Submission }
interface CreateResponse {
  success: true;
  data: { submission: Submission; article: { id: string; title: string } };
}

export const getSubmissions = async (params?: {
  status?: string;
  submitter_id?: string;
}): Promise<Submission[]> => {
  const qs = params ? '?' + new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
  ).toString() : '';
  const res = await api.get<ListResponse>(`/api/submissions${qs}`);
  return res.data;
};

export const getSubmission = async (id: string): Promise<Submission> => {
  const res = await api.get<SingleResponse>(`/api/submissions/${id}`);
  return res.data;
};

export const createSubmission = async (body: {
  title: string;
  abstract: string;
  keywords: string[];
  authors: { name: string; email: string; affiliation: string; orcid?: string }[];
  corresponding_author_email: string;
  subject_area: string;
  cover_letter?: string;
  reviewer_suggestions?: string;
  submission_type?: string;
  funding_info?: string | null;
  conflicts_of_interest?: string | null;
}): Promise<CreateResponse['data']> => {
  const res = await api.post<CreateResponse>('/api/submissions', body);
  return res.data;
};

export const updateSubmission = async (id: string, updates: Partial<{
  status: string;
  editor_notes: string;
  approved_by_editor: boolean;
  vetting_fee: boolean;
  processing_fee: boolean;
}>): Promise<Submission> => {
  const res = await api.patch<SingleResponse>(`/api/submissions/${id}`, updates);
  return res.data;
};
