import { describe, expect, it } from 'vitest';
import { parisTrip } from '@/data/paris';
import { formatTime } from './time';
import { dayItems, introducedConflicts, moveToDay, removeItem, reorder, retime } from './editItinerary';

const tz = 'Europe/Paris';
const all = parisTrip.itinerary;

describe('itinerary editing', () => {
  it('never moves a locked anchor', () => {
    expect(retime(all, 'it-4', '12:00', tz)).toBeNull();
    expect(reorder(all, 'it-1', 3, tz)).toBeNull();
    expect(removeItem(all, 'it-4').length).toBe(all.length);
  });
  it('retimes an item and keeps its duration', () => {
    const next = retime(all, 'it-8', '16:00', tz)!;
    const i = next.find((x) => x.id === 'it-8')!;
    expect(formatTime(i.startAt, tz)).toBe('16:00');
    expect(formatTime(i.endAt!, tz)).toBe('19:00');
  });
  it('reports the overlap a change creates', () => {
    const next = retime(all, 'it-8', '18:30', tz)!; // 18:30-21:30 hits the 19:30 cruise
    const c = introducedConflicts(all, next, ['2027-04-13']);
    expect(c.some((x) => x.kind === 'overlap' && x.itemIds.includes('it-9'))).toBe(true);
  });
  it('drag to the top of a day places the item before the first one', () => {
    const next = reorder(all, 'it-8', 0, tz)!;
    const day = dayItems(next, '2027-04-13');
    expect(day[0].id).toBe('it-8');
  });
  it('moves an item to another day at the same time', () => {
    const next = moveToDay(all, 'it-16', '2027-04-13', tz)!;
    const i = next.find((x) => x.id === 'it-16')!;
    expect(i.date).toBe('2027-04-13');
    expect(formatTime(i.startAt, tz)).toBe('16:00');
  });
});
