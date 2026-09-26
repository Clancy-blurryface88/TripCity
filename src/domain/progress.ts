import type { CategoryId, TripBundle } from './types';

export interface CategorySummary {
  id: CategoryId;
  count: number;
  done?: number; // for checklist / attractions with tickets
  total?: number;
  ready: boolean;
}

export function summarize(bundle: TripBundle): Record<CategoryId, CategorySummary> {
  const checklistDone = bundle.checklist.filter((c) => c.done).length;
  const activeActivities = bundle.activities.filter((a) => a.status !== 'cancelled');
  const confirmed = activeActivities.filter((a) => a.status === 'confirmed' || a.status === 'completed').length;
  return {
    flights: { id: 'flights', count: bundle.flights.length, ready: bundle.flights.length > 0 },
    hotels: { id: 'hotels', count: bundle.hotels.length, ready: bundle.hotels.length > 0 },
    transport: { id: 'transport', count: bundle.transport.length, ready: bundle.transport.length > 0 },
    attractions: {
      id: 'attractions',
      count: activeActivities.length,
      done: confirmed,
      total: activeActivities.length,
      ready: activeActivities.length > 0 && confirmed === activeActivities.length,
    },
    car: { id: 'car', count: bundle.carRentals.length, ready: bundle.carRentals.length > 0 },
    insurance: { id: 'insurance', count: bundle.insurance.length, ready: bundle.insurance.length > 0 },
    checklist: {
      id: 'checklist',
      count: bundle.checklist.length,
      done: checklistDone,
      total: bundle.checklist.length,
      ready: bundle.checklist.length > 0 && checklistDone === bundle.checklist.length,
    },
  };
}
