import { api } from "@/lib/apiClient";

export interface SupportTicketPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: string;
}

export interface SupportTicketResponse {
  success: boolean;
  message: string;
  data?: { ticketId: string };
}

/**
 * Submit a tech support ticket.
 * This endpoint is fully public — no authentication required.
 * The apiClient will attach the token if present, the backend ignores it.
 */
export const submitSupportTicket = async (
  payload: SupportTicketPayload,
): Promise<SupportTicketResponse> => {
  return api.post<SupportTicketResponse>("/api/support", payload);
};
