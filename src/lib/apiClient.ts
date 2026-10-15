const API_URL = import.meta.env.VITE_API_URL || "https://ijsdsbackend-429660256945.europe-southwest1.run.app";

const TOKEN_KEY = "ijsds_token";
const ROLE_KEY = "ijsds_acting_role";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) =>
  localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};

export const getActingRole = (): string | null =>
  localStorage.getItem(ROLE_KEY);
export const setActingRole = (role: string) =>
  localStorage.setItem(ROLE_KEY, role);

const buildHeaders = (isMultipart = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isMultipart) headers["Content-Type"] = "application/json";
  return headers;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res
    .json()
    .catch(() => ({ success: false, message: "Invalid server response" }));
  if (!res.ok || json.success === false) {
    throw new ApiError(
      res.status,
      json.message || `Request failed with status ${res.status}`,
    );
  }
  return json as T;
}

export const api = {
  get: <T>(path: string): Promise<T> =>
    fetch(`${API_URL}${path}`, { headers: buildHeaders() }).then((r) =>
      handleResponse<T>(r),
    ),

  post: <T>(path: string, body?: unknown): Promise<T> => {
    // Never add the caller's role to request bodies: the server derives permissions from the
    // token, and an injected "role" field once turned every approved/declined user into an admin.
    const finalBody = body;
    return fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(),
      body: finalBody !== undefined ? JSON.stringify(finalBody) : undefined,
    }).then((r) => handleResponse<T>(r));
  },

  patch: <T>(path: string, body?: unknown): Promise<T> => {
    // Never add the caller's role to request bodies: the server derives permissions from the
    // token, and an injected "role" field once turned every approved/declined user into an admin.
    const finalBody = body;
    return fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: buildHeaders(),
      body: finalBody !== undefined ? JSON.stringify(finalBody) : undefined,
    }).then((r) => handleResponse<T>(r));
  },

  put: <T>(path: string, body?: unknown): Promise<T> =>
    fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => handleResponse<T>(r)),

  delete: <T>(path: string): Promise<T> =>
    fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: buildHeaders(),
    }).then((r) => handleResponse<T>(r)),

  upload: <T>(path: string, formData: FormData): Promise<T> => {
    const actingRole = getActingRole();
    // For FormData, we can't easily inject into the body without modifying the form
    // But most uploads might not need the role field directly in the body as much as the decision endpoints
    return fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(true),
      body: formData,
    }).then((r) => handleResponse<T>(r));
  },

  /** Build a full URL with token for SSE / EventSource */
  sseUrl: (path: string): string => `${API_URL}${path}`,

  baseUrl: API_URL,
};
