import { describe, expect, it } from 'vitest';
import { formatTime, localDateOf, eachDate, longHebrewDate } from './time';
import { detectConflicts, conflictsWithAnchors } from './conflicts';
import { resolveCityKey } from './cities';
import { summarize } from './progress';
import { parisTrip } from '@/data/paris';

describe('time (trip timezone, not device timezone)', () => {
  it('shows Paris wall-clock time for the LY381 arrival', () => {
    const f = parisTrip.flights[0];
    expect(f.arrivalAt).toBe('2027-04-12T11:45:00.000Z');
    expect(formatTime(f.arrivalAt, 'Europe/Paris')).toBe('13:45');
    expect(formatTime(f.departureAt, 'Asia/Jerusalem')).toBe('10:30');
  });
  it('computes the local date in the trip timezone', () => {
    expect(localDateOf('2027-04-12T22:30:00Z', 'Europe/Paris')).toBe('2027-04-13');
  });
  it('lists trip days and names weekdays correctly', () => {
    expect(eachDate('2027-04-12', '2027-04-16')).toHaveLength(5);
    expect(longHebrewDate('2027-04-12')).toBe('יום שני, 12 באפריל');
  });
});

describe('conflict detection', () => {
  it('finds the deliberate Versailles / Orsay overlap on day 3', () => {
    const day3 = parisTrip.itinerary.filter((i) => i.date === '2027-04-14');
    const c = detectConflicts(day3);
    expect(c).toContainEqual({ kind: 'overlap', itemIds: ['it-11', 'it-12'], minutes: 30 });
  });
  it('has no conflicts on day 1', () => {
    expect(detectConflicts(parisTrip.itinerary.filter((i) => i.date === '2027-04-12'))).toEqual([]);
  });
  it('flags moving an item onto a locked anchor', () => {
    const day1 = parisTrip.itinerary.filter((i) => i.date === '2027-04-12');
    const rer = day1.find((i) => i.id === 'it-2')!;
    const hits = conflictsWithAnchors(rer, '2027-04-12T16:30:00Z', day1);
    expect(hits.map((h) => h.id)).toEqual(['it-4']);
  });
});

describe('cities and progress', () => {
  it('maps MVP cities and falls back to generic', () => {
    expect(resolveCityKey('Paris')).toBe('paris');
    expect(resolveCityKey('רומא')).toBe('rome');
    expect(resolveCityKey('Lisbon')).toBe('lisbon');
    expect(resolveCityKey('FCO')).toBe('rome');
    expect(resolveCityKey('Paris, France')).toBe('paris');
    expect(resolveCityKey('Eilat')).toBe('generic');
  });
  it('summarizes the Paris trip', () => {
    const s = summarize(parisTrip);
    expect(s.flights.count).toBe(2);
    expect(s.checklist).toMatchObject({ done: 8, total: 12 });
    expect(s.car.ready).toBe(false);
  });
});
