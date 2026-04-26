import { api } from './apiClient';

export interface BlogPost {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  slug: string;
  category?: string;
  tags?: string[];
  status: string;
  featured_image_url?: string | null;
  published_at?: string | null;
  created_at?: string;
  author?: { full_name: string; bio?: string } | null;
}

interface ListResponse { success: true; data: BlogPost[] }
interface SingleResponse { success: true; data: BlogPost }

export const getBlogPosts = async (params?: { category?: string; tag?: string }): Promise<BlogPost[]> => {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined) as string[][]).toString()
    : '';
  const res = await api.get<ListResponse>(`/api/blog${qs}`);
  return res.data;
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost> => {
  const res = await api.get<SingleResponse>(`/api/blog/slug/${slug}`);
  return res.data;
};

export const getAllBlogPosts = async (): Promise<BlogPost[]> => {
  const res = await api.get<ListResponse>('/api/blog/admin');
  return res.data;
};

export const getPostById = async (id: string): Promise<BlogPost> => {
  const res = await api.get<SingleResponse>(`/api/blog/${id}`);
  return res.data;
};

export const createBlogPost = async (body: Partial<BlogPost> & { tags?: string[] }): Promise<BlogPost> => {
  const res = await api.post<SingleResponse>('/api/blog', body);
  return res.data;
};

export const updateBlogPost = async (id: string, updates: Partial<BlogPost> & { tags?: string[] }): Promise<BlogPost> => {
  const res = await api.patch<SingleResponse>(`/api/blog/${id}`, updates);
  return res.data;
};

export const deleteBlogPost = async (id: string): Promise<void> => {
  await api.delete(`/api/blog/${id}`);
};
