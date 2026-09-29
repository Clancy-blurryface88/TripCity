import type { TripBundle } from '@/domain/types';
import { getSupabase } from './supabase';

/** Cloud copy of a trip for the signed-in user (table trip_snapshots, RLS: own rows only). */
export async function loadCloudTrip(userId: string, tripKey: string): Promise<TripBundle | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('trip_snapshots').select('data').eq('user_id', userId).eq('trip_key', tripKey).maybeSingle();
  if (error) throw error;
  return (data?.data as TripBundle | undefined) ?? null;
}

export async function saveCloudTrip(userId: string, tripKey: string, bundle: TripBundle): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb
    .from('trip_snapshots')
    .upsert({ user_id: userId, trip_key: tripKey, data: bundle, updated_at: new Date().toISOString() }, { onConflict: 'user_id,trip_key' });
  if (error) throw error;
}
