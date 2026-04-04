import { api, setToken, clearToken, ApiError } from './apiClient';

import { Profile } from '@/types/profile';
export type AuthProfile = Profile;

interface RegisterResponse {
  success: true;
  data: { token: string; profile: AuthProfile };
}

interface LoginResponse {
  success: true;
  token: string;
  profile: AuthProfile;
}

interface MeResponse {
  success: true;
  data: AuthProfile;
}

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
) => {
  try {
    const res = await api.post<RegisterResponse>('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    setToken(res.data.token);
    return { data: { token: res.data.token, profile: res.data.profile }, error: null };
  } catch (err) {
    return { data: null, error: err as ApiError };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    setToken(res.token);
    return { data: { token: res.token, profile: res.profile }, error: null };
  } catch (err) {
    return { data: null, error: err as ApiError };
  }
};

export const signOut = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore server errors on logout
  }
  clearToken();
  return { error: null };
};

export const resetPassword = async (email: string) => {
  try {
    await api.post('/auth/forgot-password', { email });
    return { data: {}, error: null };
  } catch (err) {
    return { data: null, error: err as ApiError };
  }
};

export const resetPasswordWithToken = async (token: string, password: string) => {
  try {
    await api.post('/auth/reset-password', { token, password });
    return { data: {}, error: null };
  } catch (err) {
    return { data: null, error: err as ApiError };
  }
};

export const getCurrentUser = async (): Promise<AuthProfile | null> => {
  try {
    const res = await api.get<MeResponse>('/auth/me');
    return res.data;
  } catch {
    return null;
  }
};

/** Called after ORCID redirect — reads ?token= from the URL and stores it */
export const handleOrcidCallback = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) setToken(token);
  return token;
};
