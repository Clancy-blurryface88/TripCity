import { useState } from 'react';
import type { Activity, CategoryId, ChecklistItem, CityKey, Flight, Hotel, TripBundle, TripDocument } from '@/domain/types';
import { CATEGORIES } from '@/domain/categories';
import { cityInfo } from '@/domain/cities';
import { formatTime, localDateOf, shortDate } from '@/domain/time';
import type { TransportTab } from '@/city/hotspots';
import { he } from '@/i18n/he';
import type { AddMethod } from './AddDocument';
import { CATEGORY_ICON } from './categoryIcon';
import { ChecklistPanel } from './ChecklistPanel';
import { FlightsScreen } from './themed/FlightsScreen';
import { HotelsScreen } from './themed/HotelsScreen';
import { AttractionsScreen } from './themed/AttractionsScreen';
import { TransportScreen } from './themed/TransportScreen';
import { CarScreen } from './themed/CarScreen';
import { InsuranceScreen } from './themed/InsuranceScreen';
import { Camera, CarTaxiFront, Clock, FileText, Hash, Lock, MapPin, Music, PencilLine, Plus, TrainFront, Upload, Utensils } from '@/ui/icons';

type Detail = { kind: 'flight'; item: Flight } | { kind: 'hotel'; item: Hotel } | { kind: 'activity'; item: Activity };

const STATUS: Record<Activity['status'], { l: string; c: string }> = {
  planned: { l: 'מתוכנן', c: 'bg-amber-50 text-amber-700' },
  confirmed: { l: 'מאושר', c: 'bg-emerald-50 text-emerald-700' },
  completed: { l: 'בוצע', c: 'bg-slate-100 text-slate-600' },
  cancelled: { l: 'בוטל', c: 'bg-rose-50 text-rose-700' },
};
const TICKET: Record<Activity['ticketStatus'], string> = { none: 'ללא כרטיס', needed: 'צריך לקנות כרטיס', purchased: 'יש כרטיס' };

function Chip({ children, className = 'bg-emerald-50 text-emerald-700' }: { children: React.ReactNode; className?: string }) {
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}>{children}</span>;
}

function Card({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const cls = 'block w-full rounded-2xl border border-slate-100 bg-white p-3 text-right shadow-[0_1px_2px_rgba(31,42,68,0.04)]';
  return onClick ? (
    <li>
      <button type="button" onClick={onClick} className={`${cls} active:bg-slate-50`}>
        {children}
      </button>
    </li>
  ) : (
    <li className={cls}>{children}</li>
  );
}

function Field({ l, v, ltr }: { l: string; v?: string; ltr?: boolean }) {
  if (!v) return null;
  return (
    <div className="flex justify-between gap-3 border-b border-slate-50 py-2 text-sm last:border-0">
      <span className="text-ink-soft">{l}</span>
      <span className="font-semibold text-ink" dir={ltr ? 'ltr' : undefined}>
        {v}
      </span>
    </div>
  );
}

function Docs({ docs }: { docs: TripDocument[] }) {
  if (!docs.length) return <p className="text-xs text-ink-soft">אין מסמכים מקושרים עדיין.</p>;
  return (
    <ul className="space-y-1.5">
      {docs.map((d) => (
        <li key={d.id} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <FileText size={16} className="text-ink-soft" aria-hidden />
          <span className="flex-1 truncate font-semibold text-ink">{d.title}</span>
          <span className="text-[11px] text-ink-soft" dir="ltr">
            {d.mimeType === 'application/pdf' ? 'PDF' : 'IMG'} · {Math.round(d.sizeBytes / 1000)}KB
          </span>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 text-xs font-bold text-ink-soft">{title}</h3>
      {children}
    </section>
  );
}

function InputMethods({ flights, onAdd }: { flights?: boolean; onAdd?: (m: AddMethod) => void }) {
  const items = [
    { l: he.inputMethods.camera, I: Camera, m: 'choose' as AddMethod },
    { l: he.inputMethods.upload, I: Upload, m: 'choose' as AddMethod },
    { l: he.inputMethods.manual, I: PencilLine, m: 'manual' as AddMethod },
    ...(flights ? [{ l: he.inputMethods.flightNumber, I: Hash, m: 'flight' as AddMethod }] : []),
  ];
  return (
    <div className={`mt-4 grid gap-2 ${flights ? 'grid-cols-4' : 'grid-cols-3'}`}>
      {items.map(({ l, I, m }) => (
        <button key={l} type="button" disabled={!onAdd} onClick={() => onAdd?.(m)} title={onAdd ? undefined : he.comingSoon} className="flex flex-col items-center gap-1 rounded-2xl bg-slate-50 py-2.5 text-[11px] font-semibold text-ink-soft active:bg-slate-100 disabled:cursor-not-allowed">
          <I size={18} aria-hidden />
          {l}
        </button>
      ))}
    </div>
  );
}

function nights(h: Hotel, tz: string) {
  const a = new Date(localDateOf(h.checkInAt, tz));
  const b = new Date(localDateOf(h.checkOutAt, tz));
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function DetailView({ d, bundle, onBack }: { d: Detail; bundle: TripBundle; onBack: () => void }) {
  const tz = bundle.trip.timezone;
  const docs = bundle.documents.filter((x) => x.linkedId === d.item.id);
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-3 text-xs font-semibold text-brand">
        → חזרה לרשימה
      </button>
      {d.kind === 'flight' && (
        <>
          <div className="rounded-3xl bg-gradient-to-l from-[#2f80ed] to-[#56a0f5] p-4 text-white">
            <div className="flex items-center justify-between text-xs opacity-90">
              <span>{d.item.airline}</span>
              <span dir="ltr" className="font-bold">
                {d.item.flightNumber}
              </span>
            </div>
            <div className="mt-3 flex items-end justify-between" dir="ltr">
              <div>
                <p className="text-3xl font-extrabold">{d.item.origin}</p>
                <p className="text-sm">{formatTime(d.item.departureAt, d.item.departureTimezone)}</p>
              </div>
              <span className="mb-4 text-lg">✈︎</span>
              <div className="text-right">
                <p className="text-3xl font-extrabold">{d.item.destination}</p>
                <p className="text-sm">{formatTime(d.item.arrivalAt, d.item.arrivalTimezone)}</p>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-[11px] opacity-90" dir="ltr">
              <span dir="rtl">
                {d.item.originName} · טרמינל {d.item.departureTerminal ?? '-'}
              </span>
              <span dir="rtl">
                {d.item.destinationName} · טרמינל {d.item.arrivalTerminal ?? '-'}
              </span>
            </div>
          </div>
          <Section title="פרטי הטיסה">
            <Field l="תאריך" v={shortDate(localDateOf(d.item.departureAt, d.item.departureTimezone))} />
            <Field l="קוד הזמנה" v={d.item.bookingReference} ltr />
            <Field l="שער" v={d.item.gate ?? 'יתעדכן ביום הטיסה'} />
            <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-soft">
              <Lock size={12} aria-hidden /> עוגן קבוע: המתכנן לא יזיז את הטיסה
            </p>
          </Section>
        </>
      )}
      {d.kind === 'hotel' && (
        <>
          <h3 className="text-lg font-extrabold text-ink">{d.item.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
            <MapPin size={12} aria-hidden /> {d.item.address}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-violet-50 p-3">
              <p className="text-[11px] text-violet-700">צ'ק-אין</p>
              <p className="font-bold text-ink">
                {shortDate(localDateOf(d.item.checkInAt, tz))} · {formatTime(d.item.checkInAt, tz)}
              </p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-3">
              <p className="text-[11px] text-violet-700">צ'ק-אאוט</p>
              <p className="font-bold text-ink">
                {shortDate(localDateOf(d.item.checkOutAt, tz))} · {formatTime(d.item.checkOutAt, tz)}
              </p>
            </div>
          </div>
          <Section title="פרטי ההזמנה">
            <Field l="לילות" v={String(nights(d.item, tz))} />
            <Field l="מספר הזמנה" v={d.item.bookingNumber} ltr />
            <Field l="טלפון" v={d.item.phone} ltr />
            <Field l="הערות" v={d.item.notes} />
          </Section>
        </>
      )}
      {d.kind === 'activity' && (
        <>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-extrabold text-ink">{d.item.name}</h3>
            <Chip className={STATUS[d.item.status].c}>{STATUS[d.item.status].l}</Chip>
          </div>
          {d.item.address && (
            <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
              <MapPin size={12} aria-hidden /> {d.item.address}
            </p>
          )}
          <Section title="פרטים">
            <Field l="תאריך" v={d.item.date ? shortDate(d.item.date) : 'גמיש'} />
            <Field l="שעה" v={d.item.startAt ? formatTime(d.item.startAt, tz) : 'המתכנן ישבץ'} />
            <Field l="משך" v={d.item.durationMinutes ? `${Math.floor(d.item.durationMinutes / 60)}:${String(d.item.durationMinutes % 60).padStart(2, '0')} שעות` : undefined} />
            <Field l="מחיר" v={d.item.price ? `${d.item.price.amount} ${d.item.price.currency}` : undefined} ltr />
            <Field l="כרטיס" v={TICKET[d.item.ticketStatus]} />
          </Section>
        </>
      )}
      <Section title="מסמכים">
        <Docs docs={docs} />
      </Section>
      <Section title="הערות">
        <p className="rounded-2xl bg-slate-50 p-3 text-xs text-ink-soft">{('notes' in d.item && d.item.notes) || 'אפשר להוסיף הערה (בקרוב)'}</p>
      </Section>
    </div>
  );
}

export function CategoryDetail({ id, bundle, count, tab, city, onAdd, onChecklist, onOpenDocs }: { id: CategoryId; bundle: TripBundle; count: number; tab?: TransportTab; city?: CityKey; onAdd?: (m: AddMethod) => void; onChecklist?: (l: ChecklistItem[]) => void; onOpenDocs?: () => void }) {
  const meta = CATEGORIES[id];
  const Icon = CATEGORY_ICON[id];
  const tz = bundle.trip.timezone;
  const [detail, setDetail] = useState<Detail | null>(null);
  const [tTab, setTTab] = useState<TransportTab>(tab ?? 'train');
  const landmark = cityInfo(city ?? bundle.trip.cityKey)?.landmarkHe;

  const done = bundle.checklist.filter((c) => c.done).length;
  const total = bundle.checklist.length;

  const c = city ?? bundle.trip.cityKey;
  const themed: CategoryId = id;
  if (themed === 'flights') return <FlightsScreen bundle={bundle} city={c} onAdd={onAdd} onOpenDocs={onOpenDocs} />;
  if (themed === 'hotels') return <HotelsScreen bundle={bundle} city={c} onOpenDocs={onOpenDocs} />;
  if (themed === 'attractions') return <AttractionsScreen bundle={bundle} city={c} onOpenDocs={onOpenDocs} />;
  if (themed === 'transport') return <TransportScreen bundle={bundle} city={c} tab={tab} />;
  if (themed === 'car') return <CarScreen bundle={bundle} city={c} onAdd={onAdd} />;
  if (themed === 'insurance') return <InsuranceScreen bundle={bundle} city={c} />;
  if (themed === 'checklist') return <ChecklistPanel bundle={bundle} color={meta.color} city={c} onChange={(l) => onChecklist?.(l)} />;
  if (detail) return <DetailView d={detail} bundle={bundle} onBack={() => setDetail(null)} />;

  const empty = (text: string) => <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-ink-soft">{text}</p>;

  let body: JSX.Element;
  if (id === 'flights') {
    body = (
      <ul className="space-y-2">
        {bundle.flights.map((f) => (
          <Card key={f.id} onClick={() => setDetail({ kind: 'flight', item: f })}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-soft">
                {shortDate(localDateOf(f.departureAt, f.departureTimezone))} · {f.airline}
              </span>
              <span className="text-xs font-bold text-ink" dir="ltr">
                {f.flightNumber}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between" dir="ltr">
              <span className="text-lg font-extrabold text-ink">
                {f.origin} <span className="text-sm text-ink-soft">{formatTime(f.departureAt, f.departureTimezone)}</span>
              </span>
              <span className="text-ink-faint">→</span>
              <span className="text-lg font-extrabold text-ink">
                {f.destination} <span className="text-sm text-ink-soft">{formatTime(f.arrivalAt, f.arrivalTimezone)}</span>
              </span>
            </div>
          </Card>
        ))}
      </ul>
    );
  } else if (id === 'hotels') {
    body = bundle.hotels.length ? (
      <ul className="space-y-2">
        {bundle.hotels.map((h) => (
          <Card key={h.id} onClick={() => setDetail({ kind: 'hotel', item: h })}>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-bold text-ink">{h.name}</span>
              <Chip>מאושר</Chip>
            </div>
            <p className="mt-0.5 text-xs text-ink-soft">
              {shortDate(localDateOf(h.checkInAt, tz))}–{shortDate(localDateOf(h.checkOutAt, tz))} · {nights(h, tz)} לילות
            </p>
            <p className="truncate text-xs text-ink-soft">{h.address}</p>
          </Card>
        ))}
      </ul>
    ) : (
      empty('עוד לא הוספת מלון שהזמנת.')
    );
  } else if (id === 'attractions') {
    const evIcon = { restaurant: Utensils, show: Music } as Record<string, typeof Music>;
    body = (
      <>
        {landmark && <p className="mb-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">הלנדמרק של העיר: {landmark}</p>}
        <ul className="space-y-2">
          {bundle.activities.map((a) => (
            <Card key={a.id} onClick={() => setDetail({ kind: 'activity', item: a })}>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-ink">{a.name}</span>
                <Chip className={STATUS[a.status].c}>{STATUS[a.status].l}</Chip>
              </div>
              <p className="mt-0.5 text-xs text-ink-soft">
                {a.date ? shortDate(a.date) : 'ללא תאריך'}
                {a.startAt ? ` · ${formatTime(a.startAt, tz)}` : ''} · {TICKET[a.ticketStatus]}
              </p>
            </Card>
          ))}
        </ul>
        {bundle.events.length > 0 && (
          <Section title="אירועים ומסעדות">
            <ul className="space-y-2">
              {bundle.events.map((e) => {
                const I = evIcon[e.kind] ?? Clock;
                return (
                  <Card key={e.id}>
                    <div className="flex items-center gap-2">
                      <I size={16} className="text-ink-soft" aria-hidden />
                      <span className="flex-1 truncate text-sm font-bold text-ink">{e.name}</span>
                      <span className="text-xs font-semibold text-ink-soft">
                        {shortDate(localDateOf(e.startAt, tz))} · {formatTime(e.startAt, tz)}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </ul>
          </Section>
        )}
      </>
    );
  } else if (id === 'transport') {
    const list = bundle.transport.filter((t) => (tTab === 'taxi' ? t.mode === 'taxi' : t.mode !== 'taxi'));
    body = (
      <>
        <div className="mb-3 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-bold" role="tablist">
          {(['train', 'taxi'] as const).map((k) => (
            <button key={k} role="tab" aria-selected={tTab === k} type="button" onClick={() => setTTab(k)} className={`flex items-center justify-center gap-1.5 rounded-xl py-2 ${tTab === k ? 'bg-white text-ink shadow-sm' : 'text-ink-soft'}`}>
              {k === 'train' ? <TrainFront size={16} aria-hidden /> : <CarTaxiFront size={16} aria-hidden />}
              {k === 'train' ? 'רכבות' : 'מוניות'}
            </button>
          ))}
        </div>
        {list.length ? (
          <ul className="space-y-2">
            {list.map((t) => (
              <Card key={t.id}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-soft">
                    {shortDate(localDateOf(t.departureAt, tz))} · {t.operator}
                  </span>
                  <span className="text-xs font-bold text-ink" dir="ltr">
                    {formatTime(t.departureAt, tz)} → {formatTime(t.arrivalAt, tz)}
                  </span>
                </div>
                <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-bold text-ink">
                  <span className="truncate">{t.origin}</span>
                  <span className="shrink-0 text-ink-faint" aria-label="אל">←</span>
                  <span className="truncate">{t.destination}</span>
                </p>
              </Card>
            ))}
          </ul>
        ) : (
          empty(tTab === 'taxi' ? 'אין נסיעות מונית מתוכננות.' : 'אין נסיעות רכבת.')
        )}
      </>
    );
  } else if (id === 'car') {
    body = bundle.carRentals.length ? (
      <ul className="space-y-2">
        {bundle.carRentals.map((c) => (
          <Card key={c.id}>
            <p className="text-sm font-bold text-ink">
              {c.company} {c.carModel ? `· ${c.carModel}` : ''}
            </p>
            <p className="text-xs text-ink-soft">
              איסוף: {c.pickupLocation} · {shortDate(localDateOf(c.pickupAt, tz))} {formatTime(c.pickupAt, tz)}
            </p>
            <p className="text-xs text-ink-soft">
              החזרה: {c.dropoffLocation} · {shortDate(localDateOf(c.dropoffAt, tz))} {formatTime(c.dropoffAt, tz)}
            </p>
          </Card>
        ))}
      </ul>
    ) : (
      <div className="rounded-2xl bg-orange-50 p-4 text-sm text-ink">
        <p className="font-bold">עוד לא נוספה השכרת רכב</p>
        <p className="mt-1 text-xs text-ink-soft">כשתוסיף הזמנה נשמור: חברה, דגם, מקום ושעת איסוף, מקום ושעת החזרה, מספר הזמנה ומסמך.</p>
      </div>
    );
  } else if (id === 'insurance') {
    body = bundle.insurance.length ? (
      <ul className="space-y-2">
        {bundle.insurance.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-ink">{p.provider}</span>
              <Chip className="bg-teal-50 text-teal-700">פעיל</Chip>
            </div>
            <Field l="מספר פוליסה" v={p.policyNumber} ltr />
            <Field l="כיסוי" v={`${shortDate(p.coverageStart)}–${shortDate(p.coverageEnd)}`} />
            <Field l="מוקד חירום" v={p.emergencyPhone} ltr />
          </Card>
        ))}
      </ul>
    ) : (
      empty('אין פוליסה לטיול הזה.')
    );
  } else {
    body = <ChecklistPanel bundle={bundle} color={meta.color} city={city} onChange={(l) => onChecklist?.(l)} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: meta.tint, color: meta.color }}>
          <Icon size={24} aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-ink">{he.categories[id]}</h2>
          <p className="text-xs text-ink-soft">{id === 'checklist' ? he.checklistDone(done, total) : he.categoryCount[id](count)}</p>
        </div>
      </div>
      {body}
      {(id === 'flights' || id === 'hotels' || id === 'car' || id === 'insurance') && <InputMethods flights={id === 'flights'} onAdd={id === 'flights' || id === 'hotels' ? onAdd : undefined} />}
      {id !== 'checklist' && <button disabled title={he.comingSoon} className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white opacity-95 disabled:cursor-not-allowed" style={{ background: meta.color }}>
        <Plus size={18} aria-hidden />
        {he.addCta[id]}
        <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px]">{he.comingSoon}</span>
      </button>}
    </div>
  );
}
