import { api } from './apiClient';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

interface ListResponse { success: true; data: AppNotification[] }
interface SingleResponse { success: true; data: AppNotification }

export const getNotifications = async (): Promise<AppNotification[]> => {
  const res = await api.get<ListResponse>('/api/notifications');
  return res.data;
};

export const markNotificationRead = async (id: string): Promise<AppNotification> => {
  const res = await api.patch<SingleResponse>(`/api/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch('/api/notifications/read-all');
};

export const sendNotification = async (body: {
  template: string;
  to: string;
  recipient_id: string;
  submission_id?: string;
  data: Record<string, string>;
  in_app?: boolean;
  in_app_title?: string;
  in_app_message?: string;
}): Promise<void> => {
  await api.post('/api/notifications/send', body);
};
