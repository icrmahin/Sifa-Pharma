import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthContextType,
  AuthSession,
  LoginForm,
  RegisterForm,
} from "../types/auth";
import type { User } from "../types/user";

const AuthContext = createContext<AuthContextType | null>(null);

// Frontend-only default user for UI development.
// No backend, no persistence - lives entirely in React state.
// Replace with real backend auth when ready.
const DEV_USER: User = {
  id: "dev-admin-001",
  name: "Dev Admin",
  email: "admin@hibbullah.app",
  phone: "+254700000000",
  role: "admin",
  createdAt: new Date().toISOString(),
};

const DEV_SESSION: AuthSession = {
  id: "dev-session-001",
  userId: DEV_USER.id,
  role: "admin",
  email: DEV_USER.email,
  phone: DEV_USER.phone,
  isAdmin: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(DEV_SESSION);
  const [user, setUser] = useState<User | null>(DEV_USER);
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [loading] = useState<boolean>(false);

  const signOut = useCallback(async () => {
    // Frontend-only: reset to unauthenticated state.
    // In production this will call the real backend.
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  }, []);

  const login = useCallback(async (_form: LoginForm): Promise<AuthSession> => {
    throw new Error("Authentication not configured. Backend required.");
  }, []);

  const register = useCallback(
    async (_form: RegisterForm): Promise<AuthSession> => {
      throw new Error("Authentication not configured. Backend required.");
    },
    []
  );

  const refreshUser = useCallback(async () => {
    // No backend - no-op. Will fetch from real backend later.
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      user,
      isAdmin,
      loading,
      signOut,
      logout: signOut,
      login,
      register,
      refreshUser,
    }),
    [session, user, isAdmin, loading, signOut, login, register, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
