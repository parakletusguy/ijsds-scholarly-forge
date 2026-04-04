import { api } from './apiClient';
import type { Article } from './articleService';

export const getProductionArticles = async (): Promise<Article[]> => {
  try {
    const res = await api.get<{ success: true; data: Article[] }>('/api/articles?status=accepted');
    return res.data || [];
  } catch (error) {
    console.error('Error fetching production articles in service:', error);
    return [];
  }
};

export const updateArticle = async (
  articleId: string, 
  updates: Partial<Article>
): Promise<Article> => {
  const res = await api.patch<{ success: true; data: Article }>(
    `/api/articles/${articleId}`, 
    updates
  );
  return res.data;
};

export const approveForProcessing = async (
  articleId: string,
  metadata: {
    volume: number;
    issue: number;
    page_start?: number;
    page_end?: number;
  }
): Promise<Article> => {
  return updateArticle(articleId, {
    ...metadata,
    status: 'processed'
  });
};
