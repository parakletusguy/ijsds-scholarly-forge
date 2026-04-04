import { api } from './apiClient';
import { Profile } from '@/types/profile';

export type { Profile };

interface ListResponse { success: true; data: Profile[] }
interface SingleResponse { success: true; data: Profile }

export const getProfiles = async (params?: {
  role?: string;
  is_reviewer?: boolean;
  is_editor?: boolean;
}): Promise<Profile[]> => {
  const qs = params ? '?' + new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString() : '';
  const res = await api.get<ListResponse>(`/api/profiles${qs}`);
  return res.data;
};

export const getProfile = async (id: string): Promise<Profile> => {
  const res = await api.get<SingleResponse>(`/api/profiles/${id}`);
  return res.data;
};

export const updateProfile = async (id: string, updates: Partial<{
  full_name: string;
  affiliation: string;
  bio: string;
  orcid_id: string;
  email_notifications_enabled: boolean;
  deadline_reminder_days: number;
  request_reviewer: boolean;
  request_editor: boolean;
  // admin-only fields
  is_editor: boolean;
  is_reviewer: boolean;
  is_admin: boolean;
  role: string;
}>): Promise<Profile> => {
  const res = await api.patch<SingleResponse>(`/api/profiles/${id}`, updates);
  return res.data;
};
