import {
  api,
  setToken,
  clearToken,
  ApiError,
  setActingRole,
} from "./apiClient";
import { getActingRoleFromProfile } from "./roleUtils";

import { Profile } from "@/types/profile";
export type AuthProfile = Profile;

interface AuthResponse {
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
    const res = await api.post<AuthResponse>("/auth/register", {
      email,
      password,
      full_name: fullName,
    });
    const profile = res.profile;
    const actingRole = getActingRoleFromProfile(profile);
    console.log("[Auth] SignUp Computed actingRole:", actingRole);
    if (actingRole) setActingRole(actingRole);
    setToken(res.token);
    return {
      data: { token: res.token, profile: res.profile },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err as ApiError };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    const profile = res.profile;
    const actingRole = getActingRoleFromProfile(profile);
    console.log("[Auth] SignIn Computed actingRole:", actingRole);
    if (actingRole) setActingRole(actingRole);
    setToken(res.token);
    return { data: { token: res.token, profile }, error: null };
  } catch (err) {
    return { data: null, error: err as ApiError };
  }
};

export const signOut = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore server errors on logout
  }
  clearToken();
  return { error: null };
};

export const resetPassword = async (email: string) => {
  try {
    await api.post("/auth/forgot-password", { email });
    return { data: {}, error: null };
  } catch (err) {
    return { data: null, error: err as ApiError };
  }
};

export const resetPasswordWithToken = async (
  token: string,
  password: string,
) => {
  try {
    await api.post("/auth/reset-password", { token, password });
    return { data: {}, error: null };
  } catch (err) {
    return { data: null, error: err as ApiError };
  }
};

export const getCurrentUser = async (): Promise<AuthProfile | null> => {
  try {
    const res = await api.get<MeResponse>("/auth/me");
    return res.data;
  } catch {
    return null;
  }
};

/** Called after ORCID redirect — reads ?token= from the URL and stores it */
export const handleOrcidCallback = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  if (token) setToken(token);
  return token;
};
