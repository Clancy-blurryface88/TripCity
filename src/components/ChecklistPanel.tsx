import { useMemo, useState } from 'react';
import type { ChecklistCategory, ChecklistItem, CityKey, TripBundle } from '@/domain/types';
import { motion } from '@/ui/motion';
import { ThemedHero } from './themed/CityCrop';
import { CHECK_CATEGORIES, addItem, removeItem, suggestItems, toggleItem } from '@/domain/checklist';
import { he } from '@/i18n/he';
import { Check, Luggage, Plus, Sparkles, Trash2, X } from '@/ui/icons';

export const CHECK_GROUPS: Record<ChecklistCategory, string> = { documents: 'מסמכים', clothes: 'בגדים', electronics: 'אלקטרוניקה', health: 'בריאות', other: 'אחר' };

const TAG: Record<ChecklistCategory, string> = { documents: '#2f80ed', clothes: '#e11d48', electronics: '#f59e0b', health: '#16a34a', other: '#64748b' };

function Ring({ pct, color }: { pct: number; color: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90" aria-hidden>
      <circle cx="24" cy="24" r={r} fill="none" stroke="#ede9fe" strokeWidth="6" />
      <motion.circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} animate={{ strokeDashoffset: c * (1 - pct / 100) }} transition={{ type: 'spring', damping: 20 }} />
    </svg>
  );
}

function Burst() {
  const bits = ['🎉', '✈️', '⭐', '🧳', '✨', '🎊', '⭐', '✨'];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {bits.map((b, i) => {
        const a = (i / bits.length) * Math.PI * 2;
        return (
          <motion.span key={i} className="absolute left-1/2 top-1/2 text-lg" initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }} animate={{ x: Math.cos(a) * 110, y: Math.sin(a) * 60 - 20, opacity: 0, scale: 1.2 }} transition={{ duration: 1.1, ease: 'easeOut' }}>
            {b}
          </motion.span>
        );
      })}
    </div>
  );
}

export function ChecklistPanel({ bundle, color, onChange, city }: { bundle: TripBundle; color: string; onChange: (list: ChecklistItem[]) => void; city?: CityKey }) {
  const list = bundle.checklist;
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [cat, setCat] = useState<ChecklistCategory>('other');
  const [editing, setEditing] = useState(false);
  const [hideDone, setHideDone] = useState(false);
  const suggestions = useMemo(() => suggestItems(bundle), [bundle]);
  const done = list.filter((c) => c.done).length;
  const total = list.length;
  const pct = Math.round((done / Math.max(total, 1)) * 100);

  const submit = () => {
    const next = addItem(list, bundle.trip.id, label, cat);
    if (next !== list) onChange(next);
    setLabel('');
  };

  return (
    <div>
      <ThemedHero city={city ?? bundle.trip.cityKey} spot="suitcase" fw={0.34} color={color} icon={<Luggage size={26} aria-hidden />} title="המזוודה" subtitle={he.checklistDone(done, total)}
        chip={
          <span className="relative grid place-items-center rounded-full bg-white/90 p-0.5 shadow-sm backdrop-blur">
            <Ring pct={pct} color={color} />
            <span className="absolute text-[11px] font-black text-ink" dir="ltr">{pct}%</span>
          </span>
        }
      />
      <div className="relative mt-3">
        {total > 0 && done === total && (
          <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative mb-3 rounded-2xl bg-emerald-50 px-3 py-2 text-center text-sm font-bold text-emerald-700">
            <Burst />
            הכול ארוז. אפשר לטוס ✈️
          </motion.p>
        )}
      </div>
      <div className="mb-2 flex gap-2 text-xs font-semibold">
        <button type="button" onClick={() => setHideDone((v) => !v)} className={`rounded-full px-3 py-1.5 ${hideDone ? 'bg-ink text-white' : 'bg-slate-100 text-ink-soft'}`}>
          {hideDone ? 'הצג הכול' : 'הסתר מה שארזתי'}
        </button>
        <button type="button" onClick={() => setEditing((v) => !v)} className={`rounded-full px-3 py-1.5 ${editing ? 'bg-ink text-white' : 'bg-slate-100 text-ink-soft'}`}>
          {editing ? 'סיום עריכה' : 'עריכה'}
        </button>
      </div>

      {CHECK_CATEGORIES.map((g) => {
        const items = list.filter((c) => c.category === g && !(hideDone && c.done));
        const all = list.filter((c) => c.category === g);
        if (!all.length) return null;
        return (
          <section key={g} className="mt-3">
            <h4 className="mb-1.5 flex items-center justify-between text-xs font-bold text-ink-soft">
              <span className="relative inline-flex items-center gap-1.5 rounded-l-md rounded-r-xl py-1 pl-3 pr-2 text-[11px] font-black text-white" style={{ background: TAG[g] }}>
                <span className="h-2 w-2 rounded-full bg-white" aria-hidden />
                {CHECK_GROUPS[g]}
              </span>
              <span dir="ltr">
                {all.filter((c) => c.done).length}/{all.length}
              </span>
            </h4>
            <ul className="space-y-0.5">
              {items.map((c) => (
                <li key={c.id} className="flex items-center gap-1">
                  <button type="button" role="checkbox" aria-checked={c.done} onClick={() => onChange(toggleItem(list, c.id))} className="flex min-h-[42px] flex-1 items-center gap-2 rounded-xl px-1 text-right text-sm text-ink active:bg-slate-50">
                    <motion.span animate={c.done ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.3 }} className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg transition-colors ${c.done ? 'text-white' : 'border-2 border-slate-200 bg-white'}`} style={c.done ? { background: TAG[c.category] } : undefined}>{c.done && <Check size={14} strokeWidth={3} />}</motion.span>
                    <span className={c.done ? 'text-ink-soft line-through decoration-slate-300' : ''}>{c.label}</span>
                  </button>
                  {editing && (
                    <button type="button" aria-label={`מחק ${c.label}`} onClick={() => onChange(removeItem(list, c.id))} className="grid h-9 w-9 place-items-center rounded-full text-rose-500 active:bg-rose-50">
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
              {!items.length && <li className="px-1 text-xs text-ink-faint">הכול ארוז בקטגוריה הזו</li>}
            </ul>
          </section>
        );
      })}

      {adding ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <input autoFocus enterKeyHint="done" value={label} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submit())} onChange={(e) => setLabel(e.target.value)} placeholder="מה לארוז?" aria-label="שם הפריט" className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400" />
            <button type="button" aria-label="סגור" onClick={() => setAdding(false)} className="grid h-10 w-10 place-items-center rounded-full text-ink-soft">
              <X size={18} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="קטגוריה">
            {CHECK_CATEGORIES.map((g) => (
              <button key={g} type="button" role="radio" aria-checked={cat === g} onClick={() => setCat(g)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${cat === g ? 'text-white' : 'bg-white text-ink-soft'}`} style={cat === g ? { background: color } : undefined}>
                {CHECK_GROUPS[g]}
              </button>
            ))}
          </div>
          <button type="button" onClick={submit} disabled={!label.trim()} className="mt-3 min-h-[44px] w-full rounded-xl text-sm font-bold text-white disabled:opacity-40" style={{ background: color }}>
            הוסף לרשימה
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white" style={{ background: color }}>
          <Plus size={18} aria-hidden />
          {he.addCta.checklist}
        </button>
      )}

      {suggestions.length > 0 && (
        <section className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/60 p-3">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-violet-800">
            <Sparkles size={14} aria-hidden /> הצעות לטיול הזה
          </h4>
          <ul className="space-y-1.5">
            {suggestions.slice(0, 6).map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{s.label}</p>
                  <p className="truncate text-[11px] text-ink-soft">
                    {CHECK_GROUPS[s.category]} · {s.reason}
                  </p>
                </div>
                <button type="button" aria-label={`הוסף ${s.label}`} onClick={() => onChange(addItem(list, bundle.trip.id, s.label, s.category))} className="flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-violet-700 shadow-sm">
                  <Plus size={14} /> הוסף
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
