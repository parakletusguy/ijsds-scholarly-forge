import { api } from "./apiClient";

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
  crossrefDoi?: string | null;
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
  manuscript_file_url?: string | null;
  submissions?: {
    id: string;
    status: string;
    submitted_at: string;
    submitter_id: string;
  }[];
  file_versions?: FileVersion[];
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string | null;
  description?: string | null;
  is_active: boolean;
  display_order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  slug: string;
  category: string;
  tags: string[];
  status: string;
  published_at: string;
  featured_image_url?: string | null;
  author?: { id: string; full_name: string };
}

interface ListResponse<T> {
  success: true;
  data: T[];
}
interface SingleResponse<T> {
  success: true;
  data: T;
}

// Backend may return crossref_doi (snake_case) — normalize to crossrefDoi
const normalizeArticle = (a: any): Article => ({
  ...a,
  crossrefDoi: a.crossrefDoi ?? a.crossref_doi ?? null,
});

export const getArticles = async (params?: {
  status?: string;
  subject_area?: string;
  volume?: number;
  issue?: number;
  doi?: string;
}): Promise<Article[]> => {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  const res = await api.get<ListResponse<Article>>(`/api/articles${qs}`);
  return res.data.map(normalizeArticle);
};

export const getArticle = async (idOrSlug: string): Promise<Article> => {
  const res = await api.get<SingleResponse<Article>>(`/api/articles/${idOrSlug}`);
  return normalizeArticle(res.data);
};

export const getPartners = async (): Promise<Partner[]> => {
  try {
    const res = await api.get<ListResponse<Partner>>("/api/partners");
    return res.data
      .filter((p) => p.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  } catch {
    return [];
  }
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const res = await api.get<ListResponse<BlogPost>>("/api/blog");
    return res.data;
  } catch {
    return [];
  }
};

export const deleteArticle = async (id: string): Promise<void> => {
  await api.delete(`/api/articles/${id}`);
};

export const updateArticle = async (
  id: string,
  updates: Partial<{
    title: string;
    abstract: string;
    keywords: string[];
    authors: ArticleAuthor[];
    doi: string;
    status: string;
    volume: number;
    issue: number;
    page_start: number;
    page_end: number;
    subject_area: string;
    funding_info: string | null;
    conflicts_of_interest: string | null;
    publication_date: string;
    vetting_fee: boolean;
    processing_fee: boolean;
  }>,
): Promise<Article> => {
  const res = await api.patch<SingleResponse<Article>>(
    `/api/articles/${id}`,
    updates,
  );
  return res.data;
};

export const getVolumesIssues = async (): Promise<{ volumes: number[]; issues: number[] }> => {
  const articles = await getArticles({ status: 'published' });
  const volumes = Array.from(new Set(articles.map(a => a.volume).filter((v): v is number => !!v))).sort((a, b) => b - a);
  const issues = Array.from(new Set(articles.map(a => a.issue).filter((i): i is number => !!i))).sort((a, b) => b - a);
  return { volumes, issues };
};
