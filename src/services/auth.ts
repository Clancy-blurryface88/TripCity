import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

export interface AuthState {
  /** false when Supabase env vars are missing: the app runs local-only. */
  available: boolean;
  /** true until the stored session has been read. */
  loading: boolean;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function displayName(user: User): string {
  const m = user.user_metadata ?? {};
  return (m.full_name as string) || (m.name as string) || user.email?.split('@')[0] || 'מטייל';
}

export function avatarUrl(user: User): string | undefined {
  const m = user.user_metadata ?? {};
  return (m.avatar_url as string) || (m.picture as string) || undefined;
}

export function useAuth(): AuthState {
  const sb = getSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!sb);

  useEffect(() => {
    if (!sb) return;
    let alive = true;
    sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data } = sb.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [sb]);

  const signInWithGoogle = useCallback(async () => {
    if (!sb) return;
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname, queryParams: { prompt: 'select_account' } },
    });
    if (error) throw error;
  }, [sb]);

  const signOut = useCallback(async () => {
    if (!sb) return;
    await sb.auth.signOut();
  }, [sb]);

  return { available: !!sb, loading, user, signInWithGoogle, signOut };
}
