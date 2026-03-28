const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const TOKEN_KEY = 'ijsds_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const buildHeaders = (isMultipart = false): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isMultipart) headers['Content-Type'] = 'application/json';
  return headers;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }));
  if (!res.ok || json.success === false) {
    throw new ApiError(res.status, json.message || `Request failed with status ${res.status}`);
  }
  return json as T;
}

export const api = {
  get: <T>(path: string): Promise<T> =>
    fetch(`${API_URL}${path}`, { headers: buildHeaders() }).then(r => handleResponse<T>(r)),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(r => handleResponse<T>(r)),

  patch: <T>(path: string, body?: unknown): Promise<T> =>
    fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(r => handleResponse<T>(r)),

  delete: <T>(path: string): Promise<T> =>
    fetch(`${API_URL}${path}`, { method: 'DELETE', headers: buildHeaders() }).then(r => handleResponse<T>(r)),

  upload: <T>(path: string, formData: FormData): Promise<T> =>
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(true),
      body: formData,
    }).then(r => handleResponse<T>(r)),

  /** Build a full URL with token for SSE / EventSource */
  sseUrl: (path: string): string => `${API_URL}${path}`,

  baseUrl: API_URL,
};
