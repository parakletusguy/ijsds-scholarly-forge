import { api } from './apiClient';
import type { Article } from './articleService';

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
  article?: Article | Record<string, any>;
  submitter?: {
    id: string;
    full_name: string;
    email: string;
  } | Record<string, any>;
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
  file?: File;
}): Promise<CreateResponse['data']> => {
  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'file') {
      formData.append('file', value as File);
    } else if (Array.isArray(value) || typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  const res = await api.upload<CreateResponse>('/api/submissions', formData);
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
