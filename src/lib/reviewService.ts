import { api } from "./apiClient";

export interface Review {
  id: string;
  submission_id: string;
  reviewer_id: string;
  recommendation?: string | null;
  comments_to_author?: string | null;
  comments_to_editor?: string | null;
  review_file_url?: string | null;
  conflict_of_interest_declared?: boolean;
  conflict_of_interest_details?: string | null;
  review_round?: number;
  invitation_status: string;
  deadline_date?: string | null;
  submitted_at?: string | null;
  reviewer?: Record<string, any>;
}

interface ListResponse {
  success: true;
  data: Review[];
}
interface SingleResponse {
  success: true;
  data: Review;
}
interface CreateResponse {
  success: true;
  data: Review;
}

export const getReviews = async (params?: {
  submission_id?: string;
  reviewer_id?: string;
  invitation_status?: string;
}): Promise<Review[]> => {
  const qs = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  const res = await api.get<ListResponse>(`/api/reviews${qs}`);
  return res.data;
};

export const getReview = async (id: string): Promise<Review> => {
  const res = await api.get<SingleResponse>(`/api/reviews/${id}`);
  return res.data;
};

export const createReview = async (body: {
  submission_id: string;
  reviewer_id: string;
  deadline_date: string;
  review_round?: number;
}): Promise<Review> => {
  const res = await api.post<CreateResponse>("/api/reviews", body);
  return res.data;
};

export const uploadReviewFile = async (id: string, file: File): Promise<{ id: string; review_file_url: string }> => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.upload<{ success: true; data: { id: string; review_file_url: string } }>(`/api/reviews/${id}/file`, form);
  return res.data;
};

export const removeReviewFile = async (id: string): Promise<void> => {
  await api.delete(`/api/reviews/${id}/file`);
};

export const updateReview = async (
  id: string,
  updates: Partial<{
    invitation_status: string;
    recommendation: string;
    comments_to_author: string;
    comments_to_editor: string;
    conflict_of_interest_declared: boolean;
    conflict_of_interest_details: string;
    submit: boolean;
  }>,
): Promise<Review> => {
  const res = await api.patch<SingleResponse>(`/api/reviews/${id}`, updates);
  return res.data;
};
