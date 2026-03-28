import { api } from './apiClient';

export interface Partner {
  id: string;
  name: string;
  logo_url?: string | null;
  website_url?: string | null;
  description?: string | null;
  is_active?: boolean;
  display_order?: number;
}

interface ListResponse { success: true; data: Partner[] }
interface SingleResponse { success: true; data: Partner }

export const getPartners = async (): Promise<Partner[]> => {
  const res = await api.get<ListResponse>('/api/partners');
  return res.data;
};

export const createPartner = async (body: Omit<Partner, 'id'>): Promise<Partner> => {
  const res = await api.post<SingleResponse>('/api/partners', body);
  return res.data;
};

export const updatePartner = async (id: string, updates: Partial<Partner>): Promise<Partner> => {
  const res = await api.patch<SingleResponse>(`/api/partners/${id}`, updates);
  return res.data;
};

export const deletePartner = async (id: string): Promise<void> => {
  await api.delete(`/api/partners/${id}`);
};
