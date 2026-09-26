import { useEffect, useMemo, useState } from 'react';
import type { CityKey, ItineraryItem, TripBundle } from '@/domain/types';
import { CityCrop } from './themed/CityCrop';
import { motion } from '@/ui/motion';
import { eachDate, formatTime, longHebrewDate } from '@/domain/time';
import { applyDraft, PACE, PIPELINE, planTrip, type Draft, type Pace } from '@/ai/planner';
import { he } from '@/i18n/he';
import { AlertTriangle, Check, Lock, Plane, Sparkles } from '@/ui/icons';

const PACE_LOOK: Record<Pace, { e: string; d: string }> = { relaxed: { e: '🐢', d: 'מקום ביום' }, balanced: { e: '🚶', d: '2 ביום' }, packed: { e: '⚡', d: '3 ביום' } };

type Stage = { s: 'setup' } | { s: 'running'; step: number } | { s: 'draft'; draft: Draft } | { s: 'done'; count: number };

export function AiPlannerSheet({ bundle, onApply, onDone, city }: { bundle: TripBundle; onApply?: (all: ItineraryItem[]) => void; onDone?: () => void; city?: CityKey }) {
  const tz = bundle.trip.timezone;
  const anchors = bundle.itinerary.filter((i) => i.isLocked);
  const wishlist = useMemo(() => bundle.activities.filter((a) => a.status === 'planned' && !a.startAt && !bundle.itinerary.some((i) => i.referenceId === a.id)), [bundle]);
  const [pace, setPace] = useState<Pace>('balanced');
  const [picked, setPicked] = useState<Set<string>>(() => new Set(wishlist.map((a) => a.id)));
  const [stage, setStage] = useState<Stage>({ s: 'setup' });
  const [skip, setSkip] = useState<Set<string>>(new Set());
  const dates = eachDate(bundle.trip.startDate, bundle.trip.endDate);

  useEffect(() => {
    if (stage.s !== 'running') return;
    if (stage.step < PIPELINE.length - 1) {
      const t = window.setTimeout(() => setStage({ s: 'running', step: stage.step + 1 }), 230);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setStage({ s: 'draft', draft: planTrip(bundle, pace, [...picked]) }), 300);
    return () => window.clearTimeout(t);
  }, [stage, bundle, pace, picked]);

  const header = (
    <div className="relative -mx-5 -mt-8 mb-4">
      <CityCrop city={city ?? bundle.trip.cityKey} spot="landmark" fw={0.9} ratio={0.46} className="rounded-t-4xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/75 via-[#5b4ee8]/45 to-[#2f80ed]/70" />
        {[[12, 22, 0], [78, 18, 0.6], [62, 48, 1.2], [26, 58, 1.8], [88, 60, 0.9]].map(([x, y, d]) => (
          <motion.span key={`${x}`} className="absolute text-white" style={{ left: `${x}%`, top: `${y}%` }} animate={{ scale: [0.6, 1.1, 0.6], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.4, repeat: Infinity, delay: d }} aria-hidden>
            <Sparkles size={x === 62 ? 22 : 14} />
          </motion.span>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent" />
      </CityCrop>
      <div className="relative -mt-14 flex items-end gap-3 px-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#2f80ed] text-white shadow-pin ring-4 ring-white">
          <Sparkles size={26} aria-hidden />
        </span>
        <div className="pb-1">
          <h2 className="text-2xl font-black leading-tight text-ink">{he.ai.title}</h2>
          <p className="text-xs font-medium text-ink-soft">{he.ai.intro}</p>
        </div>
      </div>
    </div>
  );

  if (stage.s === 'running') {
    return (
      <div>
        {header}
        <div className="relative mb-4 h-10">
          <div className="absolute inset-x-2 top-1/2 border-t-2 border-dashed border-violet-200" />
          <div className="absolute right-2 top-1/2 h-0.5 -translate-y-px bg-gradient-to-l from-[#7c3aed] to-[#2f80ed] transition-all duration-200" style={{ width: `calc((100% - 1rem) * ${stage.step / (PIPELINE.length - 1)})` }} />
          <span className="absolute top-1/2 grid h-9 w-9 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full bg-white text-violet-600 shadow-md transition-all duration-200" style={{ right: `calc(0.5rem + (100% - 1rem) * ${stage.step / (PIPELINE.length - 1)})` }}>
            <Plane size={18} className="-scale-x-100" aria-hidden />
          </span>
        </div>
        <ol className="space-y-1.5">
          {PIPELINE.map((p, k) => (
            <li key={p} className={`flex items-center gap-2 text-sm ${k <= stage.step ? 'text-ink' : 'text-ink-faint'}`}>
              <span className={`grid h-5 w-5 place-items-center rounded-full ${k < stage.step ? 'bg-emerald-500 text-white' : k === stage.step ? 'animate-pulse bg-violet-500 text-white' : 'bg-slate-100'}`}>
                {k < stage.step ? <Check size={12} aria-hidden /> : null}
              </span>
              {p}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (stage.s === 'done') {
    return (
      <div className="py-6 text-center">
        {header}
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={28} /></div>
        <p className="mt-3 text-base font-bold text-ink">{stage.count} מקומות נוספו למסלול</p>
        <p className="mt-1 text-sm text-ink-soft">הם מסומנים ב-AI. אפשר לגרור, לשנות שעה או למחוק כל אחד.</p>
        <button type="button" onClick={onDone} className="mt-5 w-full rounded-2xl bg-brand py-3 text-sm font-bold text-white">לראות את המסלול</button>
      </div>
    );
  }

  if (stage.s === 'draft') {
    const { draft } = stage;
    const accepted = draft.placements.filter((p) => !skip.has(p.activity.id));
    const newIds = new Set(draft.placements.map((p) => `it-ai-${p.activity.id}`));
    const existing = draft.plan.conflicts.filter((c) => !c.item_ids.some((id) => newIds.has(id)));
    const title = (id: string) => bundle.itinerary.find((i) => i.id === id)?.title ?? id;
    return (
      <div>
        {header}
        <p className="mb-2 text-sm font-bold text-ink">טיוטה: {draft.placements.length} מקומות שובצו · קצב {PACE[pace].label}</p>
        {dates.map((d, k) => {
          const day = draft.placements.filter((p) => p.date === d);
          if (!day.length) return null;
          return (
            <section key={d} className="mb-3">
              <h3 className="mb-1 text-xs font-bold text-ink-soft">יום {k + 1} · {longHebrewDate(d)}</h3>
              <ul className="space-y-1.5">
                {day.map((p) => {
                  const off = skip.has(p.activity.id);
                  return (
                    <li key={p.activity.id} className={`rounded-2xl border p-3 ${off ? 'border-slate-100 bg-slate-50 opacity-60' : 'border-violet-200 bg-violet-50/60'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-ink"><span className="me-1.5 rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold text-white">AI</span>{p.activity.name}</p>
                          <p className="mt-0.5 text-xs font-semibold text-ink" dir="ltr" style={{ textAlign: 'right' }}>{p.start}–{p.end}</p>
                          <p className="mt-0.5 text-[11px] text-ink-soft">{p.reason}</p>
                          {p.replaces.length > 0 && <p className="mt-0.5 text-[11px] text-amber-700">במקום: {p.replaces.map(title).join(', ')}</p>}
                        </div>
                        <button type="button" onClick={() => setSkip((s) => { const n = new Set(s); n.has(p.activity.id) ? n.delete(p.activity.id) : n.add(p.activity.id); return n; })} className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${off ? 'bg-white text-ink ring-1 ring-slate-200' : 'bg-white text-rose-600 ring-1 ring-rose-200'}`}>
                          {off ? 'החזר' : 'הסר'}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {draft.unplaced.length > 0 && (
          <div className="mb-3 rounded-2xl bg-slate-50 p-3">
            <p className="mb-1 text-xs font-bold text-ink-soft">לא שובצו</p>
            {draft.unplaced.map((u) => <p key={u.activity.id} className="text-[11px] text-ink-soft"><b className="text-ink">{u.activity.name}</b>: {u.reason}</p>)}
          </div>
        )}
        {existing.length > 0 && (
          <div className="mb-3 flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
            <div>
              <p className="font-bold">בעיות שכבר קיימות במסלול (לא נגעתי בהן):</p>
              {existing.map((c) => <p key={c.item_ids.join()}>{c.message} בין "{title(c.item_ids[0])}" ל"{title(c.item_ids[1])}"</p>)}
            </div>
          </div>
        )}
        <p className="mb-3 text-[11px] text-ink-faint">עוגנים לא זזו. זמני נסיעה הם הערכה עד חיבור שירות מפות.</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setStage({ s: 'setup' })} className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-ink">חזרה</button>
          <button
            type="button"
            disabled={!accepted.length}
            onClick={() => {
              onApply?.(applyDraft(bundle, draft, new Set(accepted.map((p) => p.activity.id))));
              setStage({ s: 'done', count: accepted.length });
            }}
            className="flex-[2] rounded-2xl bg-gradient-to-l from-[#7c3aed] to-[#2f80ed] py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            אשר והוסף {accepted.length} למסלול
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {header}
      <h3 className="mb-1.5 text-xs font-bold text-ink-soft">קצב הטיול</h3>
      <div className="mb-3 flex gap-2">
        {(Object.keys(PACE) as Pace[]).map((p) => (
          <motion.button whileTap={{ scale: 0.95 }} key={p} type="button" onClick={() => setPace(p)} className={`flex flex-1 flex-col items-center rounded-2xl py-2.5 transition ${pace === p ? 'bg-gradient-to-br from-[#7c3aed] to-[#2f80ed] text-white shadow-[0_10px_20px_-12px_rgba(124,58,237,.9)]' : 'bg-violet-50 text-ink'}`}>
            <span className="text-2xl leading-none">{PACE_LOOK[p].e}</span>
            <span className="mt-1 text-xs font-black">{PACE[p].label}</span>
            <span className={`text-[10px] ${pace === p ? 'text-white/80' : 'text-ink-faint'}`}>{PACE_LOOK[p].d}</span>
          </motion.button>
        ))}
      </div>
      <h3 className="mb-1.5 text-xs font-bold text-ink-soft">מקומות שרצית לראות ({picked.size}/{wishlist.length})</h3>
      <ul className="mb-3 flex flex-wrap gap-1.5">
        {wishlist.map((a) => {
          const on = picked.has(a.id);
          return (
            <li key={a.id}>
              <button type="button" onClick={() => setPicked((s) => { const n = new Set(s); on ? n.delete(a.id) : n.add(a.id); return n; })} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${on ? 'bg-rose-500 text-white shadow-sm' : 'border border-dashed border-slate-300 text-ink-faint'}`}>
                {on ? '♥ ' : '+ '}{a.name}
              </button>
            </li>
          );
        })}
        {!wishlist.length && <li className="text-xs text-ink-soft">כל המקומות כבר במסלול.</li>}
      </ul>
      <h3 className="mb-1.5 text-xs font-bold text-ink-soft">{he.ai.anchors} ({anchors.length})</h3>
      <ul className="mb-4 flex flex-wrap gap-1.5">
        {anchors.map((a) => (
          <li key={a.id} className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-ink">
            <Lock size={10} aria-hidden />
            {a.title}
            <span className="text-ink-faint" dir="ltr">{formatTime(a.startAt, tz)}</span>
          </li>
        ))}
      </ul>
      <p className="mb-3 rounded-2xl bg-violet-50 p-3 text-[11px] text-violet-900">המתכנן בודק עוגנים, שעות פתיחה, קרבה בין מקומות וזמני נסיעה, ומחזיר טיוטה לאישור שלך. כרגע הוא רץ באפליקציה עצמה. אחרי חיבור השרת אותו מסך יעבוד מול מודל AI.</p>
      <button type="button" disabled={!picked.size} onClick={() => { setSkip(new Set()); setStage({ s: 'running', step: 0 }); }} className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#7c3aed] to-[#2f80ed] text-sm font-bold text-white disabled:opacity-40">
        <Sparkles size={18} aria-hidden />
        {he.ai.cta}
      </button>
    </div>
  );
}
