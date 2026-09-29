import { useMemo, useState } from 'react';
import type { CityKey, TripBundle } from '@/domain/types';
import { PageHero } from './themed/CityCrop';
import { Settings } from '@/ui/icons';
import { REMINDER_KINDS, buildReminders, upcoming, whenLabel, type NotificationPrefs, type ReminderKind } from '@/domain/reminders';
import { CATEGORIES } from '@/domain/categories';
import { CATEGORY_ICON } from './categoryIcon';
import { permission, requestPermission, showSystem, type PermissionState } from '@/pwa/notify';
import { usePwa } from '@/pwa/usePwa';
import { Bell, BellOff, Check, Download, Smartphone, WifiOff } from '@/ui/icons';

const KIND_LABEL: Record<ReminderKind, { t: string; d: string }> = {
  flight_checkin: { t: 'פתיחת צ׳ק-אין לטיסה', d: '24 שעות לפני ההמראה' },
  leave_airport: { t: 'יציאה לשדה', d: '4 שעות לפני ההמראה' },
  hotel: { t: 'מלון', d: 'ביום הצ׳ק-אין ובבוקר הצ׳ק-אאוט' },
  activity: { t: 'אטרקציות ואירועים', d: 'לפני שעת ההתחלה' },
  car: { t: 'רכב שכור', d: 'לפני איסוף והחזרה' },
  checklist: { t: 'אריזה', d: 'יומיים לפני אם הצ׳ק-ליסט לא הושלם' },
  documents: { t: 'מסמכים חסרים', d: '3 ימים לפני אם חסר כרטיס או אישור' },
};

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-slate-200'}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-0.5' : 'left-[22px]'}`} />
    </button>
  );
}

const PERM_TEXT: Record<PermissionState, string> = {
  granted: 'התראות מערכת מאושרות במכשיר הזה',
  default: 'עוד לא אישרת התראות במכשיר הזה',
  denied: 'התראות חסומות. אפשר לפתוח אותן בהגדרות האתר בכרום',
  unsupported: 'הדפדפן הזה לא תומך בהתראות. התזכורות יופיעו בתוך האפליקציה',
};

export function SettingsView({ bundle, prefs, onPrefs, onTest, city }: { city?: CityKey; bundle: TripBundle; prefs: NotificationPrefs; onPrefs: (p: NotificationPrefs) => void; onTest: (title: string, body: string) => void }) {
  const [perm, setPerm] = useState<PermissionState>(permission);
  const embedded = typeof window !== 'undefined' && window.self !== window.top;
  const pwa = usePwa();
  const all = useMemo(() => buildReminders(bundle, prefs), [bundle, prefs]);
  const next = useMemo(() => upcoming(all, prefs), [all, prefs]);
  const count = (k: ReminderKind) => all.filter((r) => r.kind === k).length;

  const test = async () => {
    const r = { id: 'test', title: 'Trip City · בדיקה', body: 'ככה תיראה תזכורת לפני הטיול.' };
    if (!(await showSystem(r))) onTest(r.title, r.body);
  };

  return (
    <div className="space-y-4 px-4 pb-28 pt-2">
      <PageHero city={city ?? bundle.trip.cityKey} at={{ x: 50, y: 40 }} fw={1} ratio={0.42} color="#475569" icon={<Settings size={24} aria-hidden />} title="הגדרות" subtitle="תזכורות, התקנה ומצב אופליין" />

      <section className="rounded-3xl bg-white p-4 shadow-soft" aria-labelledby="notif-h">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">{prefs.enabled ? <Bell size={20} /> : <BellOff size={20} />}</span>
          <div className="flex-1">
            <h3 id="notif-h" className="text-sm font-extrabold text-ink">
              תזכורות לטיול
            </h3>
            <p className="text-xs text-ink-soft">{prefs.enabled ? `${next.length} תזכורות מתוכננות` : 'כבויות'}</p>
          </div>
          <Toggle on={prefs.enabled} label="תזכורות לטיול" onChange={(enabled) => onPrefs({ ...prefs, enabled })} />
        </div>

        <div className={`mt-3 rounded-2xl px-3 py-2 text-xs ${perm === 'granted' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
          <p className="font-semibold">{embedded && perm !== 'granted' ? 'בתצוגה המקדימה אי אפשר לבקש התראות מערכת. באפליקציה המותקנת זה יעבוד; כאן התזכורות מופיעות בתוך המסך.' : PERM_TEXT[perm]}</p>
          {perm === 'default' && !embedded && (
            <button type="button" onClick={async () => setPerm(await requestPermission())} className="mt-2 min-h-[40px] w-full rounded-xl bg-brand text-sm font-bold text-white">
              אפשר התראות
            </button>
          )}
        </div>

        {prefs.enabled && (
          <ul className="mt-3 divide-y divide-slate-100">
            {REMINDER_KINDS.map((k) => (
              <li key={k} className="flex items-center gap-3 py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{KIND_LABEL[k].t}</p>
                  <p className="text-[11px] text-ink-soft">
                    {KIND_LABEL[k].d}
                    {count(k) ? ` · ${count(k)} בטיול הזה` : ''}
                  </p>
                </div>
                <Toggle on={prefs.kinds[k]} label={KIND_LABEL[k].t} onChange={(v) => onPrefs({ ...prefs, kinds: { ...prefs.kinds, [k]: v } })} />
              </li>
            ))}
            <li className="flex items-center gap-3 py-2.5">
              <p className="flex-1 text-sm font-semibold text-ink">כמה זמן לפני אטרקציה</p>
              <div className="flex gap-1" role="radiogroup" aria-label="כמה זמן לפני אטרקציה">
                {[30, 60, 120].map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={prefs.activityLead === m} onClick={() => onPrefs({ ...prefs, activityLead: m })} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${prefs.activityLead === m ? 'bg-ink text-white' : 'bg-slate-100 text-ink-soft'}`}>
                    {m < 60 ? `${m} דק׳` : m === 60 ? 'שעה' : 'שעתיים'}
                  </button>
                ))}
              </div>
            </li>
          </ul>
        )}
        <button type="button" onClick={test} className="mt-2 min-h-[44px] w-full rounded-xl bg-slate-100 text-sm font-bold text-ink">
          שלח התראת בדיקה
        </button>
      </section>

      {prefs.enabled && next.length > 0 && (
        <section className="rounded-3xl bg-white p-4 shadow-soft" aria-label="התזכורות הבאות">
          <h3 className="mb-2 text-sm font-extrabold text-ink">התזכורות הבאות</h3>
          <ul className="space-y-2">
            {next.slice(0, 8).map((r) => {
              const Icon = CATEGORY_ICON[r.category];
              const meta = CATEGORIES[r.category];
              return (
                <li key={r.id} className="flex gap-3 rounded-2xl bg-slate-50 p-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: meta.tint, color: meta.color }}>
                    <Icon size={17} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-brand">{whenLabel(r)}</p>
                    <p className="truncate text-sm font-bold text-ink">{r.title}</p>
                    <p className="line-clamp-2 text-xs text-ink-soft">{r.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          {next.length > 8 && <p className="mt-2 text-center text-xs text-ink-soft">ועוד {next.length - 8}</p>}
          <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">כרגע תזכורות נשלחות כשהאפליקציה פתוחה. אחרי חיבור השרת הן יגיעו גם כשהיא סגורה (Web Push).</p>
        </section>
      )}

      <section className="rounded-3xl bg-white p-4 shadow-soft" aria-labelledby="app-h">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm">
            <Smartphone size={20} />
          </span>
          <div className="flex-1">
            <h3 id="app-h" className="text-sm font-extrabold text-ink">
              אפליקציה במסך הבית
            </h3>
            <p className="text-xs text-ink-soft">
              {pwa.install === 'installed' ? 'מותקנת במכשיר הזה' : pwa.install === 'available' ? 'אפשר להתקין עכשיו' : 'נפתחת כמו אפליקציה, עובדת גם בלי רשת'}
            </p>
          </div>
          {pwa.install === 'installed' && <Check size={20} className="text-emerald-500" aria-hidden />}
        </div>
        {pwa.install === 'available' && (
          <button type="button" onClick={pwa.promptInstall} className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-violet-600 text-sm font-bold text-white">
            <Download size={17} /> התקן את Trip City
          </button>
        )}
        {pwa.install === 'unavailable' && <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-ink-soft">בכרום באנדרואיד: תפריט ⋮ ← ״התקנת אפליקציה״ או ״הוספה למסך הבית״.</p>}
        {pwa.install === 'ios' && <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-ink-soft">בספארי: כפתור השיתוף ← ״הוספה למסך הבית״.</p>}
        <ul className="mt-3 space-y-1 text-xs text-ink-soft">
          <li className="flex items-center gap-2">
            <WifiOff size={14} aria-hidden /> {pwa.online ? 'מחובר לרשת' : 'אין רשת כרגע. מוצג המידע השמור במכשיר'}
          </li>
        </ul>
        {pwa.update && (
          <button type="button" onClick={pwa.applyUpdate} className="mt-3 min-h-[44px] w-full rounded-xl bg-emerald-600 text-sm font-bold text-white">
            יש גרסה חדשה. עדכן עכשיו
          </button>
        )}
      </section>

      <p className="text-center text-[11px] text-ink-faint">Trip City 0.7 · אחרי התחברות עם גוגל הטיול נשמר בענן ומסונכרן בין מכשירים</p>
    </div>
  );
}
