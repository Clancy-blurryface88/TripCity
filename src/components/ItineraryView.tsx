import { useMemo, useRef, useState } from 'react';
import { introducedConflicts, moveToDay, removeItem, reorder, retime, setNote, addFreeItem } from '@/domain/editItinerary';
import type { Conflict } from '@/domain/conflicts';
import { BottomSheet } from './BottomSheet';
import type { CityKey, ItineraryItem, TripBundle } from '@/domain/types';
import { PageHero } from './themed/CityCrop';
import { detectConflicts } from '@/domain/conflicts';
import { eachDate, formatTime, longHebrewDate } from '@/domain/time';
import { he } from '@/i18n/he';
import { CalendarDays, GripVertical, Plus, Trash2, AlertTriangle, BedDouble, CarTaxiFront, Coffee, Footprints, Lock, LogOut, Music, Plane, Ticket, TrainFront, TramFront, type LucideIcon } from '@/ui/icons';
import { motion } from '@/ui/motion';

const TYPE_STYLE: Record<ItineraryItem['itemType'], { Icon: LucideIcon; color: string }> = {
  flight: { Icon: Plane, color: '#2f80ed' },
  hotel_check_in: { Icon: BedDouble, color: '#8b5cf6' },
  hotel_check_out: { Icon: LogOut, color: '#8b5cf6' },
  transport: { Icon: TrainFront, color: '#16a34a' },
  activity: { Icon: Ticket, color: '#e11d48' },
  event: { Icon: Music, color: '#db2777' },
  car_pickup: { Icon: CarTaxiFront, color: '#f97316' },
  car_dropoff: { Icon: CarTaxiFront, color: '#f97316' },
  free_time: { Icon: Coffee, color: '#64748b' },
  note: { Icon: Coffee, color: '#64748b' },
};

const TRAVEL_ICON = { walk: Footprints, metro: TramFront, taxi: CarTaxiFront, train: TrainFront, car: CarTaxiFront } as const;

type Pending = { next: ItineraryItem[]; conflicts: Conflict[]; label: string };

export function ItineraryView({ bundle, day, onDay, onItems, city }: { bundle: TripBundle; day: number; onDay: (d: number) => void; onItems?: (all: ItineraryItem[]) => void; city?: CityKey }) {
  const tz = bundle.trip.timezone;
  const [pending, setPending] = useState<Pending | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; startY: number; dy: number; centers: number[]; index: number } | null>(null);
  const refs = useRef(new Map<string, HTMLElement>());
  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  };
  const propose = (next: ItineraryItem[] | null, dates: string[], label: string) => {
    if (!next || !onItems) return;
    const c = introducedConflicts(bundle.itinerary, next, dates);
    if (c.length) setPending({ next, conflicts: c, label });
    else {
      onItems(next);
      flash(label);
    }
  };
  const { trip } = bundle;
  const dates = useMemo(() => eachDate(trip.startDate, trip.endDate), [trip]);
  const date = dates[day - 1];
  const items = useMemo(() => bundle.itinerary.filter((i) => i.date === date).sort((a, b) => a.startAt.localeCompare(b.startAt)), [bundle, date]);
  const conflicts = useMemo(() => detectConflicts(items), [items]);
  const conflictIds = new Set(conflicts.flatMap((c) => c.itemIds));
  const byId = new Map(bundle.itinerary.map((i) => [i.id, i]));
  const editItem = editing ? byId.get(editing) : undefined;
  const endDrag = () => {
    if (!drag) return;
    const others = drag.centers.filter((_, k) => k !== drag.index);
    const c = drag.centers[drag.index] + drag.dy;
    const target = others.filter((x) => x < c).length;
    setDrag(null);
    if (target === drag.index || Math.abs(drag.dy) < 8) return;
    const next = reorder(bundle.itinerary, drag.id, target, tz);
    const moved = next?.find((i) => i.id === drag.id);
    propose(next, [date], moved ? `הועבר ל-${formatTime(moved.startAt, tz)}` : 'הסדר עודכן');
  };

  return (
    <div className="px-4 pb-4">
      {city ? (
        <div className="mb-4">
          <PageHero
            city={city}
            spot="landmark"
            fw={0.8}
            ratio={0.42}
            color="#2f80ed"
            icon={<CalendarDays size={24} aria-hidden />}
            title={longHebrewDate(date)}
            subtitle={`${he.dayOf(day, dates.length)} · ${items.length} פריטים · ${he.parisTime}`}
            stamp={<><p className="text-[8px] font-black tracking-wider">DAY</p><p className="text-xl font-black leading-none">{day}</p></>}
          />
        </div>
      ) : (
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-brand">{he.dayOf(day, dates.length)}</p>
            <h2 className="text-xl font-extrabold text-ink">{longHebrewDate(date)}</h2>
          </div>
          <p className="text-[11px] text-ink-faint">{he.parisTime}</p>
        </div>
      )}

      <div className="relative mb-5">
        <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" aria-hidden />
        <div className="absolute right-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand transition-all" style={{ width: `calc((100% - 2rem) * ${(day - 1) / (dates.length - 1)})` }} aria-hidden />
        <div role="tablist" aria-label="ימי הטיול" className="relative flex justify-between">
          {dates.map((d, k) => {
            const n = k + 1;
            const active = n === day;
            return (
              <button
                key={d}
                role="tab"
                aria-selected={active}
                aria-label={`${he.dayOf(n, dates.length)}`}
                onClick={() => onDay(n)}
                className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition ${active ? 'bg-brand text-white shadow-soft ring-4 ring-brand/20' : n < day ? 'bg-brand/90 text-white' : 'bg-white text-ink-soft ring-1 ring-slate-200'}`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {conflicts.length > 0 && (
        <div role="alert" className="mb-3 flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
          <div>
            {conflicts.map((c) => {
              const a = byId.get(c.itemIds[0])!;
              const b = byId.get(c.itemIds[1])!;
              return <p key={c.itemIds.join()}>{c.kind === 'overlap' ? he.conflict.overlap(a.title, b.title, c.minutes) : he.conflict.travel(a.title, b.title, c.minutes)}</p>;
            })}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-ink-soft">{he.noItems}</p>
      ) : (
        <ol className="relative">
          {items.map((it, k) => {
            const { Icon, color } = TYPE_STYLE[it.itemType];
            const TIcon = it.travelToNext ? TRAVEL_ICON[it.travelToNext.mode] : null;
            const isConflict = conflictIds.has(it.id);
            return (
              <motion.li key={it.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.04 }}>
                <div
                  ref={(el) => { if (el) refs.current.set(it.id, el); else refs.current.delete(it.id); }}
                  className={`relative flex items-stretch gap-3 ${drag?.id === it.id ? 'z-20 opacity-95' : ''}`}
                  style={drag?.id === it.id ? { transform: `translateY(${drag.dy}px) scale(1.02)`, transition: 'none' } : undefined}
                >
                  <div className="w-12 shrink-0 pt-3 text-left" dir="ltr">
                    <span className="rounded-lg px-1.5 py-1 text-[13px] font-black" style={{ background: `${color}1a`, color }}>{formatTime(it.startAt, trip.timezone)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="mt-2 grid h-9 w-9 place-items-center rounded-full text-white shadow-[0_6px_12px_-6px_rgba(0,0,0,.5)] ring-4 ring-white" style={{ background: color }}>
                      <Icon size={17} aria-hidden />
                    </span>
                    {k < items.length - 1 && <span className="w-0 flex-1 border-r-2 border-dashed border-slate-300" aria-hidden />}
                  </div>
                  <div role="button" tabIndex={0} onClick={() => onItems && setEditing(it.id)} style={{ borderRightColor: color }} className={`mb-2 flex flex-1 gap-2 rounded-2xl border border-r-4 bg-white p-3 text-right shadow-[0_6px_16px_-10px_rgba(31,42,68,0.45)] ${isConflict ? 'border-amber-300' : 'border-slate-100'} ${drag?.id === it.id ? 'shadow-xl ring-2 ring-brand/40' : ''}`}>
                    <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black text-ink">{it.aiGenerated && <span className="me-1.5 rounded-full bg-violet-600 px-1.5 py-0.5 align-middle text-[9px] font-bold text-white">AI</span>}{it.title}</p>
                      <div className="flex shrink-0 items-center gap-1">
                        {isConflict && <AlertTriangle size={14} className="text-amber-500" aria-label="התנגשות" />}
                        {it.isLocked && (
                          <span className="flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft" title={he.locked}>
                            <Lock size={10} aria-hidden />
                            {he.locked}
                          </span>
                        )}
                      </div>
                    </div>
                    {(it.subtitle || it.endAt) && (
                      <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-ink-soft">
                        {it.subtitle && <span>{it.subtitle}</span>}
                        {it.endAt && (
                          <span dir="ltr" className="text-ink-faint">
                            {formatTime(it.startAt, trip.timezone)}–{formatTime(it.endAt, trip.timezone)}
                          </span>
                        )}
                      </p>
                    )}
                    {it.notes && <p className="mt-1 text-[11px] text-ink-soft">📝 {it.notes}</p>}
                    </div>
                    {onItems && !it.isLocked && (
                      <span
                        aria-label="גרור לשינוי סדר"
                        className="-my-1 -ms-1 grid w-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-ink-faint active:bg-slate-100"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                          const centers = items.map((x) => {
                            const r = refs.current.get(x.id)?.getBoundingClientRect();
                            return r ? r.top + r.height / 2 : 0;
                          });
                          setDrag({ id: it.id, startY: e.clientY, dy: 0, centers, index: k });
                        }}
                        onPointerMove={(e) => drag && drag.id === it.id && setDrag({ ...drag, dy: e.clientY - drag.startY })}
                        onPointerUp={endDrag}
                        onPointerCancel={() => setDrag(null)}
                      >
                        <GripVertical size={18} aria-hidden />
                      </span>
                    )}
                  </div>
                </div>
                {it.travelToNext && TIcon && k < items.length - 1 && (
                  <div className="mb-2 flex items-center gap-3">
                    <div className="w-11" />
                    <div className="flex w-9 justify-center" />
                    <p className="flex items-center gap-1 text-[11px] text-ink-faint">
                      <TIcon size={12} aria-hidden /> ~{he.travel[it.travelToNext.mode](it.travelToNext.minutes)}
                    </p>
                  </div>
                )}
              </motion.li>
            );
          })}
        </ol>
      )}
      {onItems && (
        <button type="button" onClick={() => setAdding(true)} className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-ink-soft">
          <Plus size={16} aria-hidden /> הוסף פריט ליום הזה
        </button>
      )}
      <p className="mt-2 text-center text-[11px] text-ink-faint">גרור את ⋮⋮ לשינוי סדר · הקש על פריט לעריכה · עוגנים קבועים לא זזים · זמני נסיעה הם הערכה</p>

      {toast && <div className="fixed inset-x-0 bottom-[150px] z-50 mx-auto w-fit rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white shadow-lg">{toast}</div>}

      {pending && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/30 p-6" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl">
            <p className="flex items-center gap-2 text-base font-bold text-ink"><AlertTriangle size={18} className="text-amber-500" aria-hidden /> שים לב</p>
            <div className="mt-2 space-y-1 text-sm text-ink">
              {pending.conflicts.map((c) => {
                const a = pending.next.find((x) => x.id === c.itemIds[0]);
                const b = pending.next.find((x) => x.id === c.itemIds[1]);
                return <p key={c.itemIds.join()}>{c.kind === 'overlap' ? `השינוי יוצר חפיפה של ${c.minutes} דק׳ בין "${a?.title}" ל"${b?.title}".` : `אחרי השינוי חסרות ${c.minutes} דק׳ להגיע מ"${a?.title}" ל"${b?.title}".`}</p>;
              })}
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setPending(null)} className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-bold text-ink">ביטול</button>
              <button type="button" onClick={() => { onItems?.(pending.next); flash(pending.label); setPending(null); }} className="flex-1 rounded-2xl bg-amber-500 py-3 text-sm font-bold text-white">להמשיך בכל זאת</button>
            </div>
          </div>
        </div>
      )}

      <BottomSheet open={!!editItem} onClose={() => setEditing(null)} title={editItem?.title ?? ''}>
        {editItem && <EditItem key={editItem.id} item={editItem} dates={dates} tz={tz}
          onTime={(hhmm) => { propose(retime(bundle.itinerary, editItem.id, hhmm, tz), [editItem.date], `השעה עודכנה ל-${hhmm}`); setEditing(null); }}
          onDay={(d) => { propose(moveToDay(bundle.itinerary, editItem.id, d, tz), [editItem.date, d], `הועבר ליום ${dates.indexOf(d) + 1}`); setEditing(null); }}
          onNote={(n) => { onItems?.(setNote(bundle.itinerary, editItem.id, n)); flash('ההערה נשמרה'); setEditing(null); }}
          onDelete={() => { onItems?.(removeItem(bundle.itinerary, editItem.id)); flash('הפריט נמחק'); setEditing(null); }}
        />}
      </BottomSheet>
      <BottomSheet open={adding} onClose={() => setAdding(false)} title="פריט חדש">
        {adding && <AddItem onAdd={(title, hhmm, mins) => { propose(addFreeItem(bundle.itinerary, trip.id, date, title, hhmm, mins, tz), [date], 'הפריט נוסף'); setAdding(false); }} />}
      </BottomSheet>
    </div>
  );
}

function EditItem({ item, dates, tz, onTime, onDay, onNote, onDelete }: { item: ItineraryItem; dates: string[]; tz: string; onTime: (t: string) => void; onDay: (d: string) => void; onNote: (n: string) => void; onDelete: () => void }) {
  const [time, setTime] = useState(formatTime(item.startAt, tz));
  const [note, setNoteText] = useState(item.notes ?? '');
  return (
    <div className="space-y-3 pt-8">
      <p className="text-base font-bold text-ink">{item.title}</p>
      {item.isLocked ? (
        <p className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs text-ink-soft"><Lock size={12} aria-hidden /> עוגן קבוע (טיסה, כרטיס לשעה או הזמנה). השעה והיום לא זזים, אבל אפשר להוסיף הערה.</p>
      ) : (
        <>
          <label className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-sm text-ink-soft">שעת התחלה</span>
            <span className="flex items-center gap-2">
              <input type="time" dir="ltr" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold" />
              <button type="button" onClick={() => onTime(time)} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white">עדכן</button>
            </span>
          </label>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="mb-1.5 text-sm text-ink-soft">העבר ליום</p>
            <div className="flex justify-between gap-1">
              {dates.map((d, k) => (
                <button key={d} type="button" disabled={d === item.date} onClick={() => onDay(d)} className={`h-9 flex-1 rounded-full text-sm font-bold ${d === item.date ? 'bg-brand text-white' : 'bg-white text-ink ring-1 ring-slate-200'}`}>{k + 1}</button>
              ))}
            </div>
          </div>
        </>
      )}
      <div className="rounded-xl bg-slate-50 px-3 py-2">
        <p className="mb-1.5 text-sm text-ink-soft">הערה</p>
        <textarea dir="auto" rows={2} value={note} onChange={(e) => setNoteText(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm" />
        <button type="button" onClick={() => onNote(note)} className="mt-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-ink">שמור הערה</button>
      </div>
      {!item.isLocked && (
        <button type="button" onClick={onDelete} className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-rose-50 py-3 text-sm font-bold text-rose-700"><Trash2 size={15} aria-hidden /> מחק מהמסלול</button>
      )}
    </div>
  );
}

function AddItem({ onAdd }: { onAdd: (title: string, hhmm: string, minutes: number) => void }) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('16:00');
  const [mins, setMins] = useState(60);
  return (
    <div className="space-y-3 pt-8">
      <input dir="auto" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="מה עושים? (למשל קפה בשאנז אליזה)" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm" />
      <div className="flex gap-2">
        <input type="time" dir="ltr" value={time} onChange={(e) => setTime(e.target.value)} className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold" />
        <select value={mins} onChange={(e) => setMins(Number(e.target.value))} className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
          {[30, 60, 90, 120, 180].map((m) => <option key={m} value={m}>{m} דק׳</option>)}
        </select>
      </div>
      <button type="button" disabled={!title.trim()} onClick={() => onAdd(title.trim(), time, mins)} className="w-full rounded-2xl bg-brand py-3 text-sm font-bold text-white disabled:opacity-40">הוסף</button>
    </div>
  );
}

