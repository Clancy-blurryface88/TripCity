import type { AiPlan } from '@/ai/schema';
import type { Flight, GeoPoint, Hotel, TripBundle, TripDocument, UUID } from '@/domain/types';

/**
 * Ports (interfaces) for every external dependency.
 * UI code depends only on these. Real adapters (Supabase, LLM, OCR, maps) plug in behind them.
 * No adapter here pretends to be a production API.
 */

export interface TripRepository {
  getTrip(tripId: UUID): Promise<TripBundle>;
  listTrips(): Promise<Array<Pick<TripBundle['trip'], 'id' | 'name' | 'destination' | 'startDate' | 'endDate'>>>;
}

export interface DocumentStorage {
  /** Uploads to a PRIVATE bucket; validates MIME and size before upload. */
  upload(tripId: UUID, file: File, link?: { type: TripDocument['linkedType']; id: UUID }): Promise<TripDocument>;
  /** Short-lived signed URL; documents are never public. */
  signedUrl(doc: TripDocument, expiresInSeconds?: number): Promise<string>;
}

export type ExtractedBooking =
  | { kind: 'flight'; fields: Partial<Flight>; confidence: number }
  | { kind: 'hotel'; fields: Partial<Hotel>; confidence: number };

export interface BookingExtractor {
  /** OCR + LLM extraction. Output always goes to a "We found these details" confirm step. */
  extract(doc: TripDocument): Promise<ExtractedBooking[]>;
}

export interface ItineraryPlanner {
  /** Server-side (Edge Function) call. Returns validated JSON (see ai/schema.ts). */
  buildDraft(tripId: UUID): Promise<AiPlan>;
}

export interface MapsProvider {
  travelMinutes(from: GeoPoint, to: GeoPoint, mode: 'walk' | 'transit' | 'drive'): Promise<number>;
  geocode(address: string): Promise<GeoPoint | null>;
}

export class NotConnectedError extends Error {
  constructor(service: string) {
    super(`${service} is not connected yet`);
    this.name = 'NotConnectedError';
  }
}

/**
 * Background reminders. Server side: an Edge Function on a cron reads due reminders
 * (same rules as domain/reminders.ts) and sends Web Push with VAPID keys kept in function secrets.
 */
export interface PushService {
  /** Store this device's PushSubscription for the signed-in user. */
  subscribe(sub: PushSubscriptionJSON): Promise<void>;
  unsubscribe(endpoint: string): Promise<void>;
}
