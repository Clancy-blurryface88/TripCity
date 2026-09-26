import type { ReactNode } from 'react';
import type { CityKey } from '@/domain/types';
import { boardImage } from '@/city/boardImages';
import { HOTSPOTS, type SpotId } from '@/city/hotspots';

/**
 * Shows one area of the city board (the same illustrated world as the home screen) as a header.
 * `fw` = fraction of the board width to show; `ratio` = header height / width.
 */
export function cropPosition(x: number, y: number, fw: number, ratio: number) {
  const bgW = 1 / fw; // board width in header widths
  const bgH = (bgW * 16) / 9;
  const px = ((x / 100) * bgW - 0.5) / (bgW - 1);
  const py = ((y / 100) * bgH - ratio / 2) / (bgH - ratio);
  const clamp = (v: number) => Math.min(100, Math.max(0, v * 100));
  return { size: `${bgW * 100}% auto`, pos: `${clamp(px)}% ${clamp(py)}%` };
}

export function CityCrop({
  city,
  spot,
  at,
  fw = 0.5,
  ratio = 0.5,
  className = '',
  animate = true,
  children,
}: {
  city: CityKey;
  spot?: SpotId;
  at?: { x: number; y: number };
  fw?: number;
  ratio?: number;
  className?: string;
  animate?: boolean;
  children?: ReactNode;
}) {
  const { url } = boardImage(city);
  const h = spot ? HOTSPOTS.find((s) => s.id === spot)! : undefined;
  const x = at?.x ?? h?.x ?? 50;
  const y = at?.y ?? h?.y ?? 50;
  const { size, pos } = cropPosition(x, y, fw, ratio);
  return (
    <div className={`relative overflow-hidden bg-sky-100 ${className}`} style={{ aspectRatio: `${1 / ratio}` }}>
      <div className={`absolute inset-0 ${animate ? 'tc-kenburns' : ''}`} style={{ backgroundImage: url ? `url(${url})` : undefined, backgroundSize: size, backgroundPosition: pos, backgroundRepeat: 'no-repeat' }} aria-hidden />
      {children}
    </div>
  );
}

/** Illustrated sheet header: city crop, soft fade into the sheet, title badge. */
export function ThemedHero({ city, spot, fw, ratio = 0.52, color, icon, title, subtitle, chip, children }: { city: CityKey; spot: SpotId; fw?: number; ratio?: number; color: string; icon: ReactNode; title: string; subtitle?: string; chip?: ReactNode; children?: ReactNode }) {
  return (
    <div className="relative -mx-5 -mt-8">
      <CityCrop city={city} spot={spot} fw={fw} ratio={ratio} className="rounded-t-4xl">
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/70 to-transparent" />
        {children}
        {chip && <div className="absolute right-4 top-4">{chip}</div>}
      </CityCrop>
      <div className="relative -mt-14 flex items-end gap-3 px-5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-pin ring-4 ring-white" style={{ background: color }}>
          {icon}
        </span>
        <div className="pb-1">
          <h2 className="text-2xl font-black leading-tight text-ink">{title}</h2>
          {subtitle && <p className="text-xs font-medium text-ink-soft">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

/** Full-page header: a postcard cut from the city board, with a stamp and title. */
export function PageHero({ city, spot, at, fw = 0.7, ratio = 0.48, color, icon, title, subtitle, stamp, children }: { city: CityKey; spot?: SpotId; at?: { x: number; y: number }; fw?: number; ratio?: number; color: string; icon: ReactNode; title: string; subtitle?: string; stamp?: ReactNode; children?: ReactNode }) {
  return (
    <div className="relative rounded-[30px] bg-white p-1.5 shadow-[0_18px_34px_-20px_rgba(31,42,68,.55)]">
      <CityCrop city={city} spot={spot} at={at} fw={fw} ratio={ratio} className="rounded-[24px]">
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        {stamp && (
          <div className="absolute left-3 top-3 rotate-[-8deg] rounded-md border-2 border-dashed border-white/90 bg-white/85 px-2 py-1 text-center shadow-sm backdrop-blur-sm" style={{ color }}>
            {stamp}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-pin ring-4 ring-white/80" style={{ background: color }}>
            {icon}
          </span>
          <div className="min-w-0 flex-1 pb-0.5 text-white">
            <h1 className="text-2xl font-black leading-tight drop-shadow">{title}</h1>
            {subtitle && <p className="truncate text-xs font-semibold opacity-90">{subtitle}</p>}
          </div>
        </div>
        {children}
      </CityCrop>
    </div>
  );
}
