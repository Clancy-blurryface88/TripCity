import { describe, expect, it } from 'vitest';
import { parsePlan } from './schema';

const valid = {
  days: [{ date: '2027-04-12', items: [{ source_type: 'activity', source_id: 'ac-eiffel', start: '18:00', end: '20:00', reason: 'Fits after hotel check-in' }] }],
  conflicts: [],
  unplaced_items: [{ source_id: 'ac-orsay', reason: 'No free slot on day 3' }],
};

describe('AI plan validation', () => {
  it('accepts strict valid JSON', () => {
    expect(parsePlan(valid).ok).toBe(true);
  });
  it('rejects extra keys (e.g. HTML)', () => {
    const bad = { ...valid, html: '<div/>' };
    expect(parsePlan(bad).ok).toBe(false);
  });
  it('rejects bad times and end before start', () => {
    const bad = structuredClone(valid);
    bad.days[0].items[0].start = '25:00';
    expect(parsePlan(bad).ok).toBe(false);
    const bad2 = structuredClone(valid);
    bad2.days[0].items[0].end = '17:00';
    expect(parsePlan(bad2).ok).toBe(false);
  });
  it('rejects a plan that moves a locked anchor', () => {
    const anchors = new Map([['ac-eiffel', { date: '2027-04-12', start: '17:00' }]]);
    const r = parsePlan(valid, anchors);
    expect(r.ok).toBe(false);
  });
});
