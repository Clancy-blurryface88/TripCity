import { useEffect, useRef } from 'react';
import type { TripBundle } from '@/domain/types';
import { buildReminders, upcoming, type NotificationPrefs, type Reminder } from '@/domain/reminders';
import { loadRaw, save } from '@/services/localStore';
import { showSystem } from './notify';

/**
 * Foreground scheduler: while the app is open, fires reminders whose time has come.
 * Background delivery needs the server (Edge Function cron + Web Push); see services/ports.ts PushService.
 */
export function useReminderScheduler(bundle: TripBundle | null, prefs: NotificationPrefs, onInApp: (r: Reminder) => void) {
  const cb = useRef(onInApp);
  cb.current = onInApp;
  useEffect(() => {
    if (!bundle || !prefs.enabled) return;
    const key = `fired:${bundle.trip.id}`;
    const all = buildReminders(bundle, prefs).filter((r) => prefs.kinds[r.kind]);
    let last = Date.now();
    const tick = async () => {
      const now = Date.now();
      const fired = new Set(loadRaw<string[]>(key) ?? []);
      const due = all.filter((r) => {
        const t = new Date(r.at).getTime();
        return t <= now && t > last - 60_000 && !fired.has(r.id);
      });
      last = now;
      for (const r of due) {
        fired.add(r.id);
        if (!(await showSystem(r))) cb.current(r);
      }
      if (due.length) save(key, [...fired]);
    };
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [bundle, prefs]);
}

export { upcoming };
