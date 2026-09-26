import type { BookingExtractor, DocumentStorage, ItineraryPlanner, MapsProvider } from './ports';
import { NotConnectedError } from './ports';

/** Honest placeholders: they throw until a real adapter is wired. Nothing is faked. */
export const notConnectedPlanner: ItineraryPlanner = {
  buildDraft: async () => {
    throw new NotConnectedError('AI itinerary planner');
  },
};
export const notConnectedExtractor: BookingExtractor = {
  extract: async () => {
    throw new NotConnectedError('OCR extractor');
  },
};
export const notConnectedStorage: DocumentStorage = {
  upload: async () => {
    throw new NotConnectedError('Document storage');
  },
  signedUrl: async () => {
    throw new NotConnectedError('Document storage');
  },
};
export const notConnectedMaps: MapsProvider = {
  travelMinutes: async () => {
    throw new NotConnectedError('Maps provider');
  },
  geocode: async () => {
    throw new NotConnectedError('Maps provider');
  },
};

export const notConnectedPush: import('./ports').PushService = {
  subscribe: async () => {
    throw new NotConnectedError('Web Push');
  },
  unsubscribe: async () => {
    throw new NotConnectedError('Web Push');
  },
};
