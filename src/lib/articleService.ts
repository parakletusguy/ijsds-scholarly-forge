import { api } from './apiClient';

export interface ArticleAuthor {
  name: string;
  email: string;
  affiliation?: string;
  orcid?: string;
}

export interface FileVersion {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  version_number: number;
  is_supplementary: boolean;
  is_archived: boolean;
  created_at?: string;
}

export interface Article {
  id: string;
  title: string;
  abstract?: string;
  keywords?: string[];
  authors?: ArticleAuthor[];
  corresponding_author_email?: string;
  doi?: string | null;
  status: string;
  volume?: number | null;
  issue?: number | null;
  page_start?: number | null;
  page_end?: number | null;
  subject_area?: string;
  publication_date?: string | null;
  submission_date?: string | null;
  vetting_fee?: boolean;
  processing_fee?: boolean;
  submissions?: { id: string; status: string; submitted_at: string; submitter_id: string }[];
  file_versions?: FileVersion[];
}

interface ListResponse { success: true; data: Article[] }
interface SingleResponse { success: true; data: Article }

export const getArticles = async (params?: {
  status?: string;
  subject_area?: string;
  volume?: number;
  issue?: number;
}): Promise<Article[]> => {
  const qs = params ? '?' + new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString() : '';
  const res = await api.get<ListResponse>(`/api/articles${qs}`);
  return res.data;
};

export const getArticle = async (id: string): Promise<Article> => {
  const res = await api.get<SingleResponse>(`/api/articles/${id}`);
  return res.data;
};

export const updateArticle = async (id: string, updates: Partial<{
  title: string;
  abstract: string;
  keywords: string[];
  doi: string;
  status: string;
  volume: number;
  issue: number;
  page_start: number;
  page_end: number;
  subject_area: string;
  publication_date: string;
  vetting_fee: boolean;
  processing_fee: boolean;
}>): Promise<Article> => {
  const res = await api.patch<SingleResponse>(`/api/articles/${id}`, updates);
  return res.data;
};
