import { api } from './apiClient';

export interface DiscussionThread {
  id: string;
  submission_id: string;
  title: string;
  created_by: string;
  created_at: string;
  _count?: { messages: number };
}

export interface DiscussionMessage {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

interface ThreadListResponse { success: true; data: DiscussionThread[] }
interface ThreadCreateResponse { success: true; data: DiscussionThread }
interface MessageListResponse { success: true; data: DiscussionMessage[] }
interface MessageCreateResponse { success: true; data: DiscussionMessage }

export const getDiscussions = async (submissionId: string): Promise<DiscussionThread[]> => {
  const res = await api.get<ThreadListResponse>(`/api/discussions/${submissionId}`);
  return res.data;
};

export const createDiscussion = async (body: {
  submission_id: string;
  title: string;
}): Promise<DiscussionThread> => {
  const res = await api.post<ThreadCreateResponse>('/api/discussions', body);
  return res.data;
};

export const getDiscussionMessages = async (threadId: string): Promise<DiscussionMessage[]> => {
  const res = await api.get<MessageListResponse>(`/api/discussions/${threadId}/messages`);
  return res.data;
};

export const postDiscussionMessage = async (threadId: string, content: string): Promise<DiscussionMessage> => {
  const res = await api.post<MessageCreateResponse>(`/api/discussions/${threadId}/messages`, { content });
  return res.data;
};
