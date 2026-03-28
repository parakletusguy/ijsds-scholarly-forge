import { api } from './apiClient';

export interface FileVersion {
  id: string;
  article_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  version_number: number;
  is_supplementary: boolean;
  is_archived: boolean;
  file_size?: number;
  created_at?: string;
}

interface ListResponse { success: true; data: FileVersion[] }
interface UploadResponse { success: true; data: FileVersion }
interface ConvertResponse { success: true; data: { html: string } }

export const uploadFile = async (
  file: File,
  articleId: string,
  options?: { file_description?: string; is_supplementary?: boolean }
): Promise<FileVersion> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('article_id', articleId);
  if (options?.file_description) formData.append('file_description', options.file_description);
  if (options?.is_supplementary !== undefined)
    formData.append('is_supplementary', String(options.is_supplementary));

  const res = await api.upload<UploadResponse>('/api/files/upload', formData);
  return res.data;
};

export const getArticleFiles = async (articleId: string): Promise<FileVersion[]> => {
  const res = await api.get<ListResponse>(`/api/files/${articleId}`);
  return res.data;
};

export const deleteFile = async (id: string): Promise<void> => {
  await api.delete(`/api/files/${id}`);
};

export const convertDocxToHtml = async (url: string): Promise<string> => {
  const res = await api.post<ConvertResponse>('/api/files/convert', { url });
  return res.data.html;
};

/** Build a full URL for file downloads served from the backend */
export const resolveFileUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http')) return relativeUrl;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  return `${base}${relativeUrl}`;
};
