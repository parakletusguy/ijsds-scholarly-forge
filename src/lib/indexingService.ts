import { api } from './apiClient';

export interface DoajSubmissionResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface ExportResponse {
  success: boolean;
  data?: any;
}

/**
 * Submit a single article to DOAJ via REST backend
 */
export const submitArticleToDoaj = async (articleId: string): Promise<DoajSubmissionResponse> => {
  const res = await api.post<DoajSubmissionResponse>('/api/doaj/submit', { article_id: articleId });
  return res;
};

/**
 * Submit all eligible published articles in bulk to DOAJ
 */
export const bulkSubmitToDoaj = async (): Promise<DoajSubmissionResponse> => {
  const res = await api.post<DoajSubmissionResponse>('/api/doaj/bulk', {});
  return res;
};

/**
 * Export metadata formatted for AJOL (African Journals Online)
 */
export const exportAjolMetadata = async (): Promise<any> => {
  const res = await api.get<any>('/api/export/ajol');
  return res;
};

/**
 * General data export (JSON / CSV / XML)
 */
export const exportPlatformData = async (dataType: string, format = 'json'): Promise<any> => {
  const res = await api.get<any>(`/api/export?dataType=${encodeURIComponent(dataType)}&format=${encodeURIComponent(format)}`);
  return res;
};
