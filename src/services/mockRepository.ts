import { parisTrip } from '@/data/paris';
import type { TripBundle } from '@/domain/types';
import type { TripRepository } from './ports';

/** Phase 1 in-memory repository with the Paris sample trip. */
export class MockTripRepository implements TripRepository {
  private trips = new Map<string, TripBundle>([[parisTrip.trip.id, parisTrip]]);

  async getTrip(tripId: string): Promise<TripBundle> {
    const t = this.trips.get(tripId);
    if (!t) throw new Error(`Trip ${tripId} not found`);
    return structuredClone(t);
  }

  async listTrips() {
    return [...this.trips.values()].map(({ trip }) => ({
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
    }));
  }
}
