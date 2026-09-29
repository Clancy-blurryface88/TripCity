import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { TripDocument, UUID } from '@/domain/types';
import type { DocumentStorage } from './ports';

/**
 * Browser Supabase client. Uses only the public URL + anon key; all data access is enforced by RLS
 * (see supabase/migrations). Service-role keys and LLM/OCR/maps keys live only in Edge Functions.
 * Returns null when env vars are missing so the app runs on mock data.
 */
let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  client = url && anon && import.meta.env.MODE !== 'test' ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
  return client;
}

export const DOCUMENTS_BUCKET = 'trip-documents';
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;

export function validateUpload(file: { type: string; size: number }): string | null {
  if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) return 'סוג קובץ לא נתמך';
  if (file.size > MAX_DOCUMENT_BYTES) return 'הקובץ גדול מ-10MB';
  return null;
}

/** Real Supabase Storage adapter (private bucket + signed URLs). Used once env vars are set. */
export class SupabaseDocumentStorage implements DocumentStorage {
  constructor(private sb: SupabaseClient) {}

  async upload(tripId: UUID, file: File, link?: { type: TripDocument['linkedType']; id: UUID }): Promise<TripDocument> {
    const err = validateUpload(file);
    if (err) throw new Error(err);
    const { data: auth } = await this.sb.auth.getUser();
    if (!auth.user) throw new Error('Not signed in');
    const id = crypto.randomUUID();
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const storagePath = `${auth.user.id}/${tripId}/${id}.${ext}`;
    const up = await this.sb.storage.from(DOCUMENTS_BUCKET).upload(storagePath, file, { contentType: file.type, upsert: false });
    if (up.error) throw up.error;
    const row = {
      id,
      trip_id: tripId,
      user_id: auth.user.id,
      title: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: storagePath,
      linked_type: link?.type ?? null,
      linked_id: link?.id ?? null,
    };
    const ins = await this.sb.from('documents').insert(row).select().single();
    if (ins.error) throw ins.error;
    return {
      id,
      tripId,
      userId: auth.user.id,
      title: file.name,
      mimeType: file.type as TripDocument['mimeType'],
      sizeBytes: file.size,
      storagePath,
      linkedType: link?.type,
      linkedId: link?.id,
      createdAt: ins.data.created_at,
    };
  }

  async signedUrl(doc: TripDocument, expiresInSeconds = 300): Promise<string> {
    const res = await this.sb.storage.from(DOCUMENTS_BUCKET).createSignedUrl(doc.storagePath, expiresInSeconds);
    if (res.error) throw res.error;
    return res.data.signedUrl;
  }
}
