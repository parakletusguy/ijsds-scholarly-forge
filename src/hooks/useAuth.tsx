import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { getCurrentUser } from "@/lib/auth";
import { Profile } from "@/types/profile";
import { getToken, clearToken, setActingRole } from "@/lib/apiClient";
import { getActingRoleFromProfile } from "@/lib/roleUtils";

/** Minimal user object — keeps backward-compat for code that uses user.id / user.email */
export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null; // Keep profile for backward-compat
  loading: boolean;
  refreshAuth: (profile: Profile) => void;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyProfile = (p: Profile | null) => {
    setProfile(p);
    if (p) {
      const actingRole = getActingRoleFromProfile(p);
      console.log(
        "[useAuth] Computed actingRole:",
        actingRole,
        "from profile:",
        p,
      );
      if (actingRole) setActingRole(actingRole);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then((p) => applyProfile(p))
      .finally(() => setLoading(false));
  }, []);

  const refreshAuth = (p: Profile) => applyProfile(p);

  const clearAuth = () => {
    clearToken();
    setProfile(null);
  };

  const user = profile;

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, refreshAuth, clearAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
