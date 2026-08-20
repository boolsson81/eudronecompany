import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Slimmad variant av DigitalSignals useAuth. Samma användare, samma roller och
// samma RLS — databasen delas — men utan säljroller, impersonation och
// first-login-logik som bara hör hemma i SaaS-appen.
export type AppRole =
  | "global_admin"
  | "admin"
  | "editor"
  | "viewer"
  | "customer_service"
  | "finance"
  | "purchasing"
  | "marketing"
  | "it"
  | "sales";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleCache = new Map<string, AppRole | null>();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingFor = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Rollhämtningen får aldrig låsa appen i spinner om Supabase hänger.
    const failsafe = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 10000);

    const loadRole = async (userId: string) => {
      if (roleCache.has(userId)) {
        if (mounted) {
          setRole(roleCache.get(userId) ?? null);
          setLoading(false);
        }
        return;
      }
      if (fetchingFor.current === userId) return;
      fetchingFor.current = userId;
      try {
        const { data, error } = await supabase.rpc("get_user_role", { _user_id: userId });
        const resolved = error ? null : ((data as AppRole | null) ?? null);
        if (!error) roleCache.set(userId, resolved);
        if (mounted) setRole(resolved);
      } finally {
        fetchingFor.current = null;
        if (mounted) setLoading(false);
      }
    };

    const apply = (next: Session | null) => {
      if (!mounted) return;
      setSession(next);
      setUser(next?.user ?? null);
      if (next?.user) {
        void loadRole(next.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => apply(next));
    void supabase.auth.getSession().then(({ data }) => apply(data.session));

    return () => {
      mounted = false;
      clearTimeout(failsafe);
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      role,
      loading,
      isAdmin: role === "admin" || role === "global_admin",
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ?? null };
      },
      signOut: async () => {
        roleCache.clear();
        await supabase.auth.signOut();
      },
    }),
    [user, session, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth måste användas inuti AuthProvider");
  return ctx;
}
