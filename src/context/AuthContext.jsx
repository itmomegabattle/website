import { createContext, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const noop = async () => null;
  return <AuthContext.Provider value={{ authError: "", isAuthenticated: false, isLoading: false, isSupabaseConfigured: false, profile: null, session: null, user: null, refreshProfile: noop, signOut: noop }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
