export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_editor: boolean;
  is_reviewer: boolean;
  is_admin: boolean;
  affiliation?: string | null;
  orcid_id?: string | null;
  bio?: string | null;
  email_notifications_enabled?: boolean;
  deadline_reminder_days?: number;
  request_reviewer?: boolean;
  request_editor?: boolean;
  request_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}
