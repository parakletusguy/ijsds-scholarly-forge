import { api } from './apiClient';

export interface OverviewData {
  submissions_by_status: Record<string, number>;
  acceptance_rate: number;
  rejection_rate: number;
  published_articles: number;
  active_reviewers: number;
  avg_turnaround_days: number;
  monthly_trend: { month: string; count: number }[];
}

export interface ReviewerPerformance {
  reviewer_id: string;
  full_name: string;
  email: string;
  total_invitations: number;
  accepted: number;
  declined: number;
  pending: number;
  acceptance_rate: number;
  completed_reviews: number;
  avg_turnaround_days: number;
  on_time_rate: number;
  recommendations: Record<string, number>;
}

export interface EditorialAnalytics {
  decision_breakdown: Record<string, number>;
  avg_days_to_first_decision: number;
  revision_to_acceptance_rate: number;
  per_editor: {
    editor_id: string;
    full_name: string;
    total_decisions: number;
    desk_rejects: number;
    accepts: number;
    rejects: number;
  }[];
}

interface OverviewResponse { success: true; data: OverviewData }
interface ReviewerResponse { success: true; data: ReviewerPerformance[] }
interface EditorialResponse { success: true; data: EditorialAnalytics }

const buildDateParams = (dateFrom?: string, dateTo?: string) => {
  const p: Record<string, string> = {};
  if (dateFrom) p['date_from'] = dateFrom;
  if (dateTo) p['date_to'] = dateTo;
  const qs = Object.keys(p).length ? '?' + new URLSearchParams(p).toString() : '';
  return qs;
};

export const getAnalyticsOverview = async (dateFrom?: string, dateTo?: string): Promise<OverviewData> => {
  const res = await api.get<OverviewResponse>(`/api/analytics/overview${buildDateParams(dateFrom, dateTo)}`);
  return res.data;
};

export const getReviewerPerformance = async (dateFrom?: string, dateTo?: string): Promise<ReviewerPerformance[]> => {
  const res = await api.get<ReviewerResponse>(`/api/analytics/reviewer-performance${buildDateParams(dateFrom, dateTo)}`);
  return res.data;
};

export const getEditorialAnalytics = async (dateFrom?: string, dateTo?: string): Promise<EditorialAnalytics> => {
  const res = await api.get<EditorialResponse>(`/api/analytics/editorial${buildDateParams(dateFrom, dateTo)}`);
  return res.data;
};
