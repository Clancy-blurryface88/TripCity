import { describe, expect, it } from 'vitest';
import { parisTrip } from '@/data/paris';
import { detectConflicts } from '@/domain/conflicts';
import { applyDraft, planTrip } from './planner';

describe('planTrip', () => {
  it('places wishlist items without moving anchors or creating overlaps', () => {
    const d = planTrip(parisTrip, 'balanced');
    expect(d.placements.length).toBeGreaterThanOrEqual(4);
    const merged = applyDraft(parisTrip, d);
    for (const a of parisTrip.itinerary.filter((i) => i.isLocked)) {
      expect(merged.find((i) => i.id === a.id)!.startAt).toBe(a.startAt);
    }
    const newIds = new Set(d.placements.map((p) => `it-ai-${p.activity.id}`));
    for (const day of new Set(merged.map((i) => i.date))) {
      const c = detectConflicts(merged.filter((i) => i.date === day));
      expect(c.filter((x) => x.itemIds.some((id) => newIds.has(id)))).toEqual([]);
    }
  });
  it('respects opening days', () => {
    const d = planTrip(parisTrip, 'packed');
    const rodin = d.placements.find((p) => p.activity.id === 'ac-rodin');
    if (rodin) expect(rodin.date).not.toBe('2027-04-12'); // closed Mondays
    const pomp = d.placements.find((p) => p.activity.id === 'ac-pompidou');
    if (pomp) expect(pomp.date).not.toBe('2027-04-13'); // closed Tuesdays
  });
  it('relaxed pace places fewer items', () => {
    expect(planTrip(parisTrip, 'relaxed').placements.length).toBeLessThanOrEqual(planTrip(parisTrip, 'packed').placements.length);
  });
});

describe('arrival and departure days', () => {
  it('never plans before landing or after leaving for the airport', () => {
    for (const pace of ['relaxed', 'balanced', 'packed'] as const) {
      for (const p of planTrip(parisTrip, pace).placements) {
        if (p.date === '2027-04-12') expect(p.start >= '14:15').toBe(true);
        if (p.date === '2027-04-16') expect(p.end <= '13:00').toBe(true);
      }
    }
  });
});
