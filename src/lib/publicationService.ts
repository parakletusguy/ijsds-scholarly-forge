import { api } from './apiClient';
import type { Article } from './articleService';

const normalizeArticle = (a: any): Article => ({
  ...a,
  crossrefDoi: a.crossrefDoi ?? a.crossref_doi ?? null,
});

export const getProcessedArticles = async (): Promise<Article[]> => {
  const res = await api.get<{ success: true; data: Article[] }>('/api/articles?status=processed');
  return res.data.map(normalizeArticle);
};

export const getPublishedArticles = async (): Promise<Article[]> => {
  const res = await api.get<{ success: true; data: Article[] }>('/api/articles?status=published');
  return res.data.map(normalizeArticle);
};

export const updateArticleStatus = async (
  articleId: string,
  newStatus: string
): Promise<Article> => {
  const res = await api.patch<{ success: true; data: Article }>(
    `/api/articles/${articleId}`,
    { status: newStatus, publication_date: new Date().toISOString() }
  );
  return res.data;
};
