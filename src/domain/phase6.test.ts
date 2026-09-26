import { describe, expect, it } from 'vitest';
import { parisTrip as parisBundle } from '@/data/paris';
import { addItem, plugAdvice, removeItem, suggestItems, toggleItem } from './checklist';
import { DEFAULT_PREFS, buildReminders, upcoming } from './reminders';

describe('checklist', () => {
  const list = parisBundle.checklist;
  it('toggles, adds and removes', () => {
    const t = toggleItem(list, 'ck-6');
    expect(t.find((c) => c.id === 'ck-6')!.done).toBe(!list.find((c) => c.id === 'ck-6')!.done);
    const a = addItem(list, parisBundle.trip.id, '  משקפי שמש ', 'other');
    expect(a).toHaveLength(list.length + 1);
    expect(a[a.length - 1]).toMatchObject({ label: 'משקפי שמש', done: false, category: 'other' });
    expect(addItem(a, parisBundle.trip.id, 'משקפי-שמש', 'other')).toBe(a);
    expect(addItem(a, parisBundle.trip.id, '   ', 'other')).toBe(a);
    const r = removeItem(a, 'ck-0');
    expect(r.map((c) => c.orderIndex)).toEqual(r.map((_, i) => i));
  });
  it('suggests trip-aware items without duplicates', () => {
    const s = suggestItems(parisBundle);
    const labels = s.map((x) => x.label);
    expect(labels).not.toContain('דרכון');
    expect(labels.some((l) => l.startsWith('מתאם חשמל'))).toBe(false);
    expect(new Set(labels).size).toBe(labels.length);
    expect(plugAdvice('GB')).toBe('מתאם חשמל (Type G)');
    expect(plugAdvice('IL')).toBeNull();
  });
});

describe('reminders', () => {
  it('builds reminders in time order with flight check-in 24h before', () => {
    const all = buildReminders(parisBundle);
    expect(all.map((r) => r.at)).toEqual([...all.map((r) => r.at)].sort());
    const f = parisBundle.flights[0];
    const ci = all.find((r) => r.id === `ci-${f.id}`)!;
    expect(new Date(f.departureAt).getTime() - new Date(ci.at).getTime()).toBe(24 * 3600_000);
    expect(all.some((r) => r.kind === 'checklist')).toBe(true);
  });
  it('respects prefs and the clock', () => {
    const all = buildReminders(parisBundle);
    const before = new Date('2026-01-01T00:00:00Z');
    expect(upcoming(all, DEFAULT_PREFS, before)).toHaveLength(all.length);
    expect(upcoming(all, { ...DEFAULT_PREFS, enabled: false }, before)).toHaveLength(0);
    const noFlights = { ...DEFAULT_PREFS, kinds: { ...DEFAULT_PREFS.kinds, flight_checkin: false } };
    expect(upcoming(all, noFlights, before).some((r) => r.kind === 'flight_checkin')).toBe(false);
    expect(upcoming(all, DEFAULT_PREFS, new Date('2030-01-01T00:00:00Z'))).toHaveLength(0);
  });
  it('lead time changes activity reminders', () => {
    const a = buildReminders(parisBundle, { ...DEFAULT_PREFS, activityLead: 30 }).find((r) => r.kind === 'activity')!;
    const b = buildReminders(parisBundle, { ...DEFAULT_PREFS, activityLead: 120 }).find((r) => r.id === a.id)!;
    expect(new Date(a.at).getTime() - new Date(b.at).getTime()).toBe(90 * 60_000);
  });
});
