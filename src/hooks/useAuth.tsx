import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { getCurrentUser, type AuthProfile } from '@/lib/auth';
import { getToken, clearToken } from '@/lib/apiClient';

/** Minimal user object — keeps backward-compat for code that uses user.id / user.email */
export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: AuthProfile | null;
  loading: boolean;
  /** Call this after a successful login/register to refresh auth state */
  refreshAuth: (profile: AuthProfile) => void;
  /** Call this after logout to clear auth state */
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshAuth: () => {},
  clearAuth: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyProfile = (p: AuthProfile | null) => {
    setProfile(p);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then(p => applyProfile(p))
      .finally(() => setLoading(false));
  }, []);

  const refreshAuth = (p: AuthProfile) => applyProfile(p);

  const clearAuth = () => {
    clearToken();
    setProfile(null);
  };

  const user: AuthUser | null = profile ? { id: profile.id, email: profile.email } : null;

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
