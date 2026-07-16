import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/+$/, "");

async function request(path, options = {}) {
  const token = sessionStorage.getItem("mb_session_token");
  const response = await fetch(`${API_BASE}${path}`, { credentials: "include", ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || "Ошибка авторизации");
  return data;
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const refreshProfile = async () => {
    try {
      const data = await request("/auth/me");
      const roles = data.principal?.roles ?? [];
      const profile = { ...data.profile, roles, is_admin: roles.includes("admin") || roles.includes("site_admin") };
      setAuth({ principal: data.principal, profile });
      return profile;
    } catch {
      setAuth(null);
      return null;
    }
  };

  useEffect(() => { refreshProfile().finally(() => setIsLoading(false)); }, []);

  const value = useMemo(() => ({
    authError,
    isAuthenticated: Boolean(auth?.profile),
    isLoading,
    isSupabaseConfigured: true,
    profile: auth?.profile ?? null,
    session: auth?.principal ? { user: { id: auth.principal.profileId } } : null,
    user: auth?.principal ? { id: auth.principal.profileId } : null,
    refreshProfile,
    async signInTelegram(payload) {
      setAuthError("");
      try { const session = await request("/auth/telegram/login", { method: "POST", body: JSON.stringify(payload) }); sessionStorage.setItem("mb_session_token", session.token); return await refreshProfile(); }
      catch (error) { setAuthError(error.message); throw error; }
    },
    async signOut() { await request("/auth/logout", { method: "POST", body: "{}" }).catch(() => undefined); sessionStorage.removeItem("mb_session_token"); setAuth(null); },
  }), [auth, authError, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
