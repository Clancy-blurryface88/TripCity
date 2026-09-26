import { useState } from 'react';
import type { Flight, TripDocument } from '@/domain/types';
import { formatTime, localDateOf, minutesBetween, shortDate } from '@/domain/time';
import { FileText, Lock, Plane } from '@/ui/icons';

/** Deterministic barcode bars from a string (decorative; the real code comes from the airline PDF). */
function bars(seed: string, n = 46) {
  let h = 2166136261;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i;
    h = Math.imul(h, 16777619);
    out.push(1 + (Math.abs(h) % 3));
  }
  return out;
}

function Barcode({ seed, height = 44 }: { seed: string; height?: number }) {
  const b = bars(seed);
  let x = 0;
  return (
    <svg viewBox={`0 0 ${b.reduce((a, w) => a + w + 1.4, 0)} ${height}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      {b.map((w, i) => {
        const r = <rect key={i} x={x} y={0} width={w} height={height} fill="#1f2a44" />;
        x += w + 1.4;
        return r;
      })}
    </svg>
  );
}

function dur(f: Flight) {
  const m = minutesBetween(f.departureAt, f.arrivalAt);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}

/** Notches on both sides of the tear line. */
function Tear() {
  return (
    <div className="relative h-5" aria-hidden>
      <span className="absolute -right-2.5 top-0 h-5 w-5 rounded-full bg-white shadow-[inset_0_0_0_1px_#e0f2fe]" />
      <span className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-white shadow-[inset_0_0_0_1px_#e0f2fe]" />
      <div className="tc-perf absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2" />
    </div>
  );
}

export function BoardingPass({ f, label, doc, onOpenDoc }: { f: Flight; label: string; doc?: TripDocument; onOpenDoc?: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const date = shortDate(localDateOf(f.departureAt, f.departureTimezone));
  const cells: [string, string][] = [
    ['תאריך', date],
    ['טרמינל', f.departureTerminal ?? '-'],
    ['שער', f.gate ?? '--'],
    ['בוארדינג', formatTime(new Date(new Date(f.departureAt).getTime() - 40 * 60000).toISOString(), f.departureTimezone)],
  ];
  return (
    <div className="[perspective:1200px]">
      <button type="button" onClick={() => setFlipped((v) => !v)} aria-label={`כרטיס עלייה למטוס ${f.flightNumber}, הקש להפוך`} className={`tc-flip relative block w-full text-right ${flipped ? 'is-flipped' : ''}`}>
        {/* Front */}
        <div className="tc-face overflow-hidden rounded-[26px] bg-[#f5f9ff] shadow-[0_14px_30px_-14px_rgba(47,128,237,.55)] ring-1 ring-sky-100">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2f80ed] via-[#3b8cf0] to-[#62b0ff] px-4 pb-4 pt-3 text-white">
            <svg className="absolute -left-6 -top-8 h-32 w-32 opacity-15" viewBox="0 0 100 100" aria-hidden>
              <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 5" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="2" />
            </svg>
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">{label}</span>
              <span dir="ltr" className="tracking-wider">
                {f.airline.toUpperCase()} · {f.flightNumber}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-1" dir="ltr">
              <div>
                <p className="text-[34px] font-black leading-none tracking-tight">{f.origin}</p>
                <p className="mt-1 text-[11px] opacity-90" dir="rtl">
                  {f.originName}
                </p>
              </div>
              <div className="relative w-28">
                <svg viewBox="0 0 120 40" className="w-full" aria-hidden>
                  <path id={`arc-${f.id}`} d="M6 34 Q60 -6 114 34" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.6" strokeDasharray="3 4" />
                  <circle cx="6" cy="34" r="3" fill="#fff" />
                  <circle cx="114" cy="34" r="3" fill="#fff" />
                  <g>
                    <path d="M-6 0 L6 0 M0 -5 L2 0 L0 5 M-5 -2 L-4 0 L-5 2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <animateMotion dur="3.6s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 0 .55 1">
                      <mpath href={`#arc-${f.id}`} />
                    </animateMotion>
                  </g>
                </svg>
                <p className="-mt-1 text-center text-[10px] font-semibold opacity-90" dir="rtl">{dur(f)} שע׳</p>
              </div>
              <div className="text-right">
                <p className="text-[34px] font-black leading-none tracking-tight">{f.destination}</p>
                <p className="mt-1 text-[11px] opacity-90" dir="rtl">
                  {f.destinationName}
                </p>
              </div>
            </div>
            <div className="mt-2 flex justify-between text-sm font-bold" dir="ltr">
              <span>{formatTime(f.departureAt, f.departureTimezone)}</span>
              <span>{formatTime(f.arrivalAt, f.arrivalTimezone)}</span>
            </div>
          </div>
          <Tear />
          <div className="grid grid-cols-4 gap-1 px-4 pb-1 text-center">
            {cells.map(([l, v]) => (
              <div key={l}>
                <p className="text-[10px] font-semibold text-ink-faint">{l}</p>
                <p className="text-sm font-black text-ink" dir="ltr">
                  {v}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 px-4 pb-3 pt-2">
            <div className="h-9 flex-1 opacity-80">
              <Barcode seed={`${f.bookingReference ?? ''}${f.flightNumber}`} height={36} />
            </div>
            <span className="text-[10px] font-semibold text-ink-faint">הקש להפוך ↺</span>
          </div>
        </div>

        {/* Back */}
        <div className="tc-face tc-back tc-paper absolute inset-0 flex flex-col overflow-hidden rounded-[26px] p-4 shadow-[0_14px_30px_-14px_rgba(47,128,237,.55)] ring-1 ring-sky-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-ink-soft">קוד הזמנה</p>
            <Plane size={16} className="text-cat-flights" aria-hidden />
          </div>
          <p className="mt-0.5 font-mono text-2xl font-black tracking-[0.3em] text-ink" dir="ltr">
            {f.bookingReference ?? '------'}
          </p>
          <div className="my-3 h-16 rounded-xl bg-white p-2 ring-1 ring-slate-100">
            <Barcode seed={`${f.bookingReference ?? ''}${f.flightNumber}back`} height={48} />
          </div>
          <p className="flex items-center gap-1 text-[11px] text-ink-soft">
            <Lock size={12} aria-hidden /> עוגן קבוע: המתכנן לא יזיז את הטיסה
          </p>
          <div className="mt-auto">
            {doc ? (
              <span
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDoc?.();
                }}
                className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-cat-flights text-sm font-bold text-white"
              >
                <FileText size={15} aria-hidden /> {doc.title}
              </span>
            ) : (
              <span className="flex min-h-[40px] items-center justify-center rounded-xl border-2 border-dashed border-sky-200 text-xs font-bold text-sky-700">עוד לא צירפת את הכרטיס</span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
