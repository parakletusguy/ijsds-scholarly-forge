import { api, getToken } from "./apiClient";

export type CrossRefJobState =
  | "waiting"
  | "active"
  | "completed"
  | "failed"
  | "delayed"
  | "unknown";

export interface CrossRefJobStatus {
  jobId: string;
  state: CrossRefJobState;
  progress?: number;
  result?: { doi?: string; message?: string };
  failedReason?: string;
}

interface JobResponse {
  success: boolean;
  jobId: string;
  message?: string;
}

interface StatusResponse {
  success: boolean;
  data: CrossRefJobStatus;
}

interface PreviewResponse {
  success: boolean;
  xml: string;
}

/** Queue a new DOI registration. Article must have no DOI yet. */
export const crossrefRegister = (articleId: string) =>
  api.post<JobResponse>("/api/crossref/register", { articleId });

/** Re-submit metadata for an article that already has a DOI. */
export const crossrefRedeposit = (articleId: string) =>
  api.post<JobResponse>("/api/crossref/redeposit", { articleId });

/** Poll the BullMQ job status. */
export const crossrefStatus = (jobId: string) =>
  api.get<StatusResponse>(`/api/crossref/status/${jobId}`);

/** Returns compiled XML without depositing — useful for inspection. */
export const crossrefPreview = async (articleId: string): Promise<PreviewResponse> => {
  const token = getToken();
  const res = await fetch(`${api.baseUrl}/api/crossref/preview/${articleId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `Request failed with status ${res.status}` }));
    throw new Error(body.message || `Request failed with status ${res.status}`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await res.json();
    return json as PreviewResponse;
  }
  const xml = await res.text();
  return { success: true, xml };
};

/** Poll job status until terminal state, firing onUpdate each tick. */
export const pollCrossRefJob = (
  jobId: string,
  onUpdate: (status: CrossRefJobStatus) => void,
  intervalMs = 2500,
): (() => void) => {
  let active = true;

  const tick = async () => {
    try {
      const res = await crossrefStatus(jobId);
      if (active) onUpdate(res.data);
      const terminal =
        res.data.state === "completed" || res.data.state === "failed";
      if (active && !terminal) setTimeout(tick, intervalMs);
    } catch {
      // silently stop polling on network error
    }
  };

  setTimeout(tick, 500);
  return () => { active = false; };
};
