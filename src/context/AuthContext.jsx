import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isuToAuthEmail, isSupabaseConfigured, supabase } from "../lib/supabase";

const AuthContext = createContext(null);

async function fetchOwnProfile(userId) {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState("");

  const user = session?.user ?? null;

  const refreshProfile = async (nextUser = user) => {
    if (!nextUser) {
      setProfile(null);
      return null;
    }

    const nextProfile = await fetchOwnProfile(nextUser.id);
    setProfile(nextProfile);
    return nextProfile;
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (data.session?.user) {
        try {
          await refreshProfile(data.session.user);
        } catch (error) {
          setAuthError(error.message);
        }
      }
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        try {
          await refreshProfile(nextSession.user);
        } catch (error) {
          setAuthError(error.message);
        }
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      authError,
      isAuthenticated: Boolean(user),
      isLoading,
      isSupabaseConfigured,
      profile,
      refreshProfile,
      session,
      user,
      async signIn({ isuNumber, password }) {
        if (!supabase) throw new Error("Supabase не настроен");
        setAuthError("");
        const { data, error } = await supabase.auth.signInWithPassword({
          email: isuToAuthEmail(isuNumber),
          password,
        });
        if (error) {
          setAuthError(error.message);
          throw error;
        }
        return data;
      },
      async signUp({ isuNumber, password, nickname, fullName, faculty }) {
        if (!supabase) throw new Error("Supabase не настроен");
        setAuthError("");
        const { data, error } = await supabase.auth.signUp({
          email: isuToAuthEmail(isuNumber),
          password,
          options: {
            data: {
              isu_number: String(isuNumber).trim(),
              nickname,
              full_name: fullName,
              faculty,
            },
          },
        });
        if (error) {
          setAuthError(error.message);
          throw error;
        }

        if (data.user && data.session) {
          const nextProfile = await refreshProfile(data.user);
          if (!nextProfile) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .upsert(
                {
                  auth_user_id: data.user.id,
                  isu_number: String(isuNumber).trim(),
                  nickname,
                  full_name: fullName,
                  faculty,
                },
                { onConflict: "auth_user_id" },
              )
              .select()
              .single();

            if (profileError) {
              setAuthError(profileError.message);
              throw profileError;
            }

            setProfile(profileData);
          }
        }

        return data;
      },
      async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
        setProfile(null);
      },
    }),
    [authError, isLoading, profile, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
