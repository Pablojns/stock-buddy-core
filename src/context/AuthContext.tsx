import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, PLAN_ORDER, type Plan } from '@/lib/supabase';

export interface Profile {
  id: string;
  plan?: Plan | null;
  onboarding_completed?: boolean | null;
  [key: string]: unknown;
}

interface AuthValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, meta?: Record<string, unknown>) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<string | null>;
  hasAccess: (plan: Plan) => boolean;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile((data as Profile | null) ?? { id: uid });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) setTimeout(() => void loadProfile(s.user.id), 0);
      else setProfile(null);
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadProfile(data.session.user.id);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const user = session?.user ?? null;

  const value: AuthValue = {
    user, session, profile, loading,
    signUp: async (email, password, meta) => {
      const quiz = localStorage.getItem('life-os-quiz');
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { ...meta, quiz: quiz ? JSON.parse(quiz) : null } },
      });
      return error?.message ?? null;
    },
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error?.message ?? null;
    },
    signInWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
      return error?.message ?? null;
    },
    signOut: async () => { await supabase.auth.signOut(); },
    updateProfile: async (patch) => {
      if (!user) return 'Não autenticado';
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...patch });
      if (!error) setProfile((p) => ({ ...(p ?? { id: user.id }), ...patch }));
      return error?.message ?? null;
    },
    hasAccess: (plan) => PLAN_ORDER.indexOf((profile?.plan as Plan) ?? 'free') >= PLAN_ORDER.indexOf(plan),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth fora do AuthProvider');
  return v;
}
