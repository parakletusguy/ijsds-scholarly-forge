import { api } from "./apiClient";

export interface EditorialDecision {
  id: string;
  submission_id: string;
  editor_id: string;
  decision_type: string;
  decision_rationale?: string;
  created_at: string;
}

export interface RevisionRequest {
  id: string;
  submission_id: string;
  requested_by: string;
  revision_type: string;
  request_details: string;
  deadline_date?: string;
  created_at: string;
}

export interface RejectionMessage {
  id: string;
  submission_id: string;
  message: string;
  suggested_corrections?: string;
  created_by: string;
  created_at: string;
}

interface DecisionListResponse {
  success: true;
  data: EditorialDecision[];
}
interface DecisionCreateResponse {
  success: true;
  data: EditorialDecision;
}
interface RevisionListResponse {
  success: true;
  data: RevisionRequest[];
}
interface RevisionCreateResponse {
  success: true;
  data: RevisionRequest;
}
interface RejectionListResponse {
  success: true;
  data: RejectionMessage[];
}
interface RejectionCreateResponse {
  success: true;
  data: RejectionMessage;
}

// Editorial Decisions
export const getEditorialDecisions = async (
  submissionId: string,
): Promise<EditorialDecision[]> => {
  const res = await api.get<DecisionListResponse>(
    `/api/editorial-decisions/${submissionId}`,
  );
  return res.data;
};

export const createEditorialDecision = async (body: {
  submission_id: string;
  decision_type: string;
  decision_rationale?: string;
}): Promise<EditorialDecision> => {
  const res = await api.post<DecisionCreateResponse>(
    "/api/editorial-decisions",
    body,
  );
  return res.data;
};

// Revision Requests
export const getRevisionRequests = async (
  submissionId: string,
): Promise<RevisionRequest[]> => {
  const res = await api.get<RevisionListResponse>(
    `/api/revision-requests/${submissionId}`,
  );
  return res.data;
};

export const createRevisionRequest = async (body: {
  submission_id: string;
  revision_type: string;
  request_details: string;
  deadline_date?: string;
}): Promise<RevisionRequest> => {
  const res = await api.post<RevisionCreateResponse>(
    "/api/revision-requests",
    body,
  );
  return res.data;
};

// Rejection Messages
export const getRejectionMessages = async (
  submissionId: string,
): Promise<RejectionMessage[]> => {
  const res = await api.get<RejectionListResponse>(
    `/api/rejection-messages/${submissionId}`,
  );
  return res.data;
};

export const createRejectionMessage = async (body: {
  submission_id: string;
  message: string;
  suggested_corrections?: string;
}): Promise<RejectionMessage> => {
  const res = await api.post<RejectionCreateResponse>(
    "/api/rejection-messages",
    body,
  );
  return res.data;
};
