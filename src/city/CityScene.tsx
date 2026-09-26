import { memo, useMemo } from 'react';
import type { CategoryId, CityKey } from '@/domain/types';
import { CATEGORIES } from '@/domain/categories';
import { CATEGORY_ICON } from '@/components/categoryIcon';
import { he } from '@/i18n/he';
import { EXTENT, BRIDGES, FOUNTAIN, LAWNS, PARK, PARKING, PLAZA, QUAIS, RIVER, ROADS_I, ROADS_J, TROCADERO, TOWER_AT, MARKER_SPOTS, buildCity, buildTrees, type Building, type Rect } from './layout';
import { box, iso, quad } from './iso';
import { Landmark } from './landmarks';

const q = (r: Rect, z = 0) => quad(r[0], r[2], r[1], r[3], z);

const WALL_L = '#f4e8d2';
const WALL_R = '#dcc8a8';
const ROOF = '#8a9ab2';
const ROOF_EDGE = '#f8f0e0';

function BuildingShape({ b }: { b: Building }) {
  let wallL = WALL_L;
  let wallR = WALL_R;
  let roof = ROOF;
  let windows = true;
  if (b.special === 'hotel') {
    roof = '#9b7fe0';
    wallL = '#fbf3e6';
    wallR = '#e6d5bb';
  } else if (b.special === 'station') {
    roof = '#b9dcf2';
    wallL = '#efe2c9';
    wallR = '#d6c09c';
  } else if (b.special === 'insurance') {
    roof = '#62bdb3';
    wallL = '#f3f7f6';
    wallR = '#d5e2e0';
  } else if (b.special === 'ecole' || b.special === 'chaillot') {
    roof = '#b8c2cf';
    wallL = '#f6ecd9';
    wallR = '#e2d1b4';
  }
  return (
    <g>
      <polygon points={b.faces.left} fill={wallL} />
      <polygon points={b.faces.right} fill={wallR} />
      {windows && <polygon points={b.faces.left} fill="url(#win-l)" />}
      {windows && <polygon points={b.faces.right} fill="url(#win-r)" />}
      <polygon points={b.faces.top} fill={roof} stroke={ROOF_EDGE} strokeWidth="1.2" strokeLinejoin="round" />
      {b.chimney && (
        <>
          <polygon points={b.chimney.left} fill="#c8a98a" />
          <polygon points={b.chimney.right} fill="#a88a6c" />
          <polygon points={b.chimney.top} fill="#7a6552" />
        </>
      )}
      {b.special === 'station' && <StationDetails b={b} />}
      {b.special === 'hotel' && <HotelDetails b={b} />}
      {b.special === 'insurance' && <InsuranceDetails b={b} />}
    </g>
  );
}

function StationDetails({ b }: { b: Building }) {
  const [i0, i1, j0, j1] = b.rect;
  const glass = box(i0 + 0.2, j0 + 0.3, i1 - 0.2, j1 - 0.3, 10, b.h);
  const c = iso((i0 + i1) / 2, j1, b.h * 0.62);
  return (
    <g>
      <polygon points={glass.left} fill="#cde8f7" opacity="0.95" />
      <polygon points={glass.right} fill="#a9d2ea" />
      <polygon points={glass.top} fill="#e3f3fb" stroke="#fff" strokeWidth="1" />
      <circle cx={c.x} cy={c.y} r="6" fill="#fff" stroke="#8b6f4e" strokeWidth="1.5" />
      <path d={`M ${c.x} ${c.y} v -4 M ${c.x} ${c.y} h 3`} stroke="#3b3b3b" strokeWidth="1" />
    </g>
  );
}

function HotelDetails({ b }: { b: Building }) {
  const [i0, i1, , j1] = b.rect;
  const a0 = iso(i0 + 0.15, j1, 12);
  const a1 = iso(i1 - 0.15, j1, 12);
  const pole = iso(i1 - 0.2, (b.rect[2] + j1) / 2, b.h);
  return (
    <g>
      <path d={`M ${a0.x} ${a0.y} L ${a1.x} ${a1.y} L ${a1.x - 3} ${a1.y + 6} L ${a0.x - 3} ${a0.y + 6} Z`} fill="#8b5cf6" />
      <line x1={pole.x} y1={pole.y} x2={pole.x} y2={pole.y - 18} stroke="#6b5a45" strokeWidth="1.2" />
      <path d={`M ${pole.x} ${pole.y - 18} l 10 3 l -10 3 Z`} fill="#8b5cf6" className="tc-flag" />
    </g>
  );
}

function InsuranceDetails({ b }: { b: Building }) {
  const [i0, i1, , j1] = b.rect;
  const c = iso((i0 + i1) / 2, j1, b.h * 0.55);
  return <path d={`M ${c.x} ${c.y - 7} l 6 2.5 v 4 c 0 4 -3 6 -6 7.5 c -3 -1.5 -6 -3.5 -6 -7.5 v -4 Z`} fill="#0d9488" />;
}

function TreeShape({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <ellipse cx="2" cy="1" rx="7" ry="3" fill="#264a22" opacity="0.2" />
      <rect x="-1" y="-8" width="2" height="8" fill="#7a5a3c" />
      <circle cx="0" cy="-13" r="7.5" fill="#4e9a45" />
      <circle cx="-2.2" cy="-15" r="4.5" fill="#6dbb5c" />
    </g>
  );
}

function Cars() {
  const spots = [
    [12.8, 14.6, '#f97316'],
    [13.6, 14.6, '#3b82f6'],
    [14.4, 16.2, '#e5e7eb'],
    [12.8, 16.2, '#ef4444'],
  ] as const;
  return (
    <g>
      {spots.map(([i, j, c]) => {
        const car = box(i, j, i + 0.45, j + 0.8, 6);
        const cab = box(i + 0.06, j + 0.2, i + 0.39, j + 0.55, 4, 6);
        return (
          <g key={`${i}-${j}`}>
            <polygon points={car.left} fill={c} />
            <polygon points={car.right} fill={c} opacity="0.8" />
            <polygon points={car.top} fill={c} />
            <polygon points={cab.left} fill="#bfe3f7" />
            <polygon points={cab.right} fill="#9ccbe6" />
            <polygon points={cab.top} fill="#fff" opacity="0.9" />
          </g>
        );
      })}
    </g>
  );
}

function Bridge({ r }: { r: Rect }) {
  const deck = box(r[0], r[2], r[1], r[3], 3);
  const arches = [11.5, 12.5].map((j) => iso(r[1], j, 0));
  return (
    <g>
      <polygon points={deck.right} fill="#bfae92" />
      {arches.map((p, k) => (
        <ellipse key={k} cx={p.x} cy={p.y + 1} rx="5" ry="3" fill="#5f9dc0" />
      ))}
      <polygon points={deck.top} fill="#d9d4ca" stroke="#efe9dd" strokeWidth="1" />
    </g>
  );
}

function Marker({ id, count, onSelect, selected, index }: { id: CategoryId; count: number; onSelect: (id: CategoryId) => void; selected: boolean; index: number }) {
  const spot = MARKER_SPOTS.find((m) => m.id === id)!;
  const Icon = CATEGORY_ICON[id];
  const meta = CATEGORIES[id];
  const x = spot.anchor.x;
  const y = spot.anchor.y - spot.lift;
  const label = he.categories[id];
  const labelW = label.length * 7 + 14;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${he.categoryCount[id](count)}`}
      aria-pressed={selected}
      className="tc-marker cursor-pointer outline-none"
      data-marker={id}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      {spot.lift > 0 && <line x1={spot.anchor.x} y1={spot.anchor.y} x2={x} y2={y + 16} stroke={meta.color} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.7" />}
      {spot.lift > 0 && <ellipse cx={spot.anchor.x} cy={spot.anchor.y} rx="5" ry="2.5" fill={meta.color} opacity="0.35" />}
      <g className="tc-bob" style={{ animationDelay: `${index * -0.45}s` }}>
        <circle cx={x} cy={y} r="28" fill="transparent" />
        {selected && <circle cx={x} cy={y} r="24" fill={meta.color} opacity="0.22" className="tc-pulse" />}
        <circle cx={x} cy={y + 2} r="18" fill="#1f2a44" opacity="0.18" />
        <circle cx={x} cy={y} r="18" fill={meta.color} stroke="#fff" strokeWidth="3" />
        <Icon x={x - 9} y={y - 9} width={18} height={18} color="#fff" strokeWidth={2.2} aria-hidden />
        {count > 0 && id !== 'checklist' && (
          <g>
            <circle cx={x + 14} cy={y - 13} r="7.5" fill="#fff" />
            <text x={x + 14} y={y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill={meta.color}>
              {count}
            </text>
          </g>
        )}
        <rect x={x - labelW / 2} y={y + 22} width={labelW} height="17" rx="8.5" fill="#fff" opacity="0.94" />
        <text x={x} y={y + 34.5} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#1f2a44">
          {label}
        </text>
      </g>
    </g>
  );
}

function Cloud({ x, y, s, d }: { x: number; y: number; s: number; d: number }) {
  return (
    <g className="tc-cloud" style={{ animationDuration: `${d}s` }}>
      <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity="0.9">
        <ellipse cx="0" cy="0" rx="34" ry="12" />
        <ellipse cx="-12" cy="-8" rx="16" ry="12" />
        <ellipse cx="10" cy="-11" rx="18" ry="14" />
      </g>
    </g>
  );
}

function PlaneInSky() {
  return (
    <g className="tc-plane">
      <path d="M 40 -220 C 80 -240 110 -250 132 -258" stroke="#2f80ed" strokeWidth="1.6" strokeDasharray="3 5" fill="none" opacity="0.55" />
    </g>
  );
}

export interface CitySceneProps {
  city: CityKey;
  counts: Record<CategoryId, number>;
  selected: CategoryId | null;
  onSelect: (id: CategoryId) => void;
  viewBox: string;
}

export const CityScene = memo(function CityScene({ city, counts, selected, onSelect, viewBox }: CitySceneProps) {
  const buildings = useMemo(buildCity, []);
  const trees = useMemo(buildTrees, []);
  const tower = iso(TOWER_AT.i, TOWER_AT.j);
  const drawables = useMemo(() => {
    const list: Array<{ depth: number; el: JSX.Element }> = [];
    for (const b of buildings) list.push({ depth: b.depth, el: <BuildingShape key={b.key} b={b} /> });
    for (const t of trees) list.push({ depth: t.depth, el: <TreeShape key={t.key} x={t.p.x} y={t.p.y} size={t.size} /> });
    list.sort((a, b) => a.depth - b.depth);
    return list;
  }, [buildings, trees]);
  const back = drawables.filter((d) => d.depth < 12.5);
  const front = drawables.filter((d) => d.depth >= 12.5);
  const towerIndex = front.findIndex((d) => d.depth > TOWER_AT.i + TOWER_AT.j + 0.6);
  const beforeTower = towerIndex === -1 ? front : front.slice(0, towerIndex);
  const afterTower = towerIndex === -1 ? [] : front.slice(towerIndex);
  const boatA = iso(EXTENT.min, 12);
  const boatB = iso(EXTENT.max, 12);

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className="h-full w-full select-none" role="group" aria-label="מפת העיר">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#cfe6ff" />
          <stop offset="1" stopColor="#f3f8ff" />
        </linearGradient>
        <linearGradient id="haze" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#eaf3ff" stopOpacity="1" />
          <stop offset="1" stopColor="#eaf3ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="water" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#8fd0ef" />
          <stop offset="1" stopColor="#5fb1dd" />
        </linearGradient>
        <pattern id="win-l" width="12" height="13" patternUnits="userSpaceOnUse" patternTransform="skewY(26.565)">
          <rect x="3.5" y="3" width="5" height="6.5" rx="0.8" fill="#7d93b0" />
          <rect x="3.5" y="3" width="5" height="1.6" fill="#b9c8da" />
        </pattern>
        <pattern id="win-r" width="12" height="13" patternUnits="userSpaceOnUse" patternTransform="skewY(-26.565)">
          <rect x="3.5" y="3" width="5" height="6.5" rx="0.8" fill="#6a7f9b" />
        </pattern>
      </defs>

      <rect x="-2000" y="-2000" width="4000" height="4000" fill="url(#sky)" />
      <Cloud x={-150} y={-330} s={1} d={70} />
      <Cloud x={90} y={-360} s={0.8} d={90} />
      <Cloud x={-320} y={-250} s={0.7} d={110} />

      {/* ground */}
      <polygon points={quad(EXTENT.min, EXTENT.min, EXTENT.max, EXTENT.max)} fill="#e9e2cf" />
      <polygon points={q(RIVER)} fill="url(#water)" />
      {[2, 7, 14, 19].map((i) => {
        const a = iso(i, 11.7);
        const b2 = iso(i + 0.8, 11.7);
        const c = iso(i + 3, 12.4);
        const d = iso(i + 3.6, 12.4);
        return (
          <g key={i} stroke="#fff" strokeWidth="1.3" opacity="0.55" strokeLinecap="round">
            <line x1={a.x} y1={a.y} x2={b2.x} y2={b2.y} />
            <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} />
          </g>
        );
      })}
      {QUAIS.map((r, k) => (
        <polygon key={k} points={q(r)} fill="#d8cdb6" />
      ))}
      {[...ROADS_I, ...ROADS_J].map((r, k) => (
        <polygon key={k} points={q(r)} fill="#c3c8d2" />
      ))}
      <polygon points={q(PARK)} fill="#e8dcb9" />
      <polygon points={q(PLAZA)} fill="#efe4c6" />
      {LAWNS.map((r, k) => (
        <polygon key={k} points={q(r)} fill="#93d27f" stroke="#7cc167" strokeWidth="1" />
      ))}
      <polygon points={q(TROCADERO)} fill="#a3d98f" />
      <polygon points={q(FOUNTAIN)} fill="url(#water)" stroke="#fff" strokeWidth="1.5" />
      <polygon points={q(PARKING)} fill="#b7bcc6" />
      {[12.9, 13.7, 14.5].map((i) => (
        <line key={i} {...lineProps(iso(i, 14.4), iso(i, 16.8))} stroke="#fff" strokeWidth="1" opacity="0.8" />
      ))}
      <Cars />
      {BRIDGES.map((r, k) => (
        <Bridge key={k} r={r} />
      ))}

      <g className="tc-boat" style={{ ['--bx' as string]: `${boatB.x - boatA.x}px`, ['--by' as string]: `${boatB.y - boatA.y}px` }}>
        <g transform={`translate(${boatA.x} ${boatA.y})`}>
          <path d="M -12 0 L 12 6 L 9 10 L -12 4 Z" fill="#fff" />
          <path d="M -6 0 L 6 3 L 6 -2 L -6 -5 Z" fill="#2f80ed" />
        </g>
      </g>

      {back.map((d) => d.el)}
      <rect x="-2000" y="-600" width="4000" height="440" fill="url(#haze)" />
      {beforeTower.map((d) => d.el)}
      <Landmark city={city} x={tower.x} y={tower.y} />
      {afterTower.map((d) => d.el)}

      <PlaneInSky />
      {MARKER_SPOTS.map((m, k) => (
        <Marker key={m.id} id={m.id} index={k} count={counts[m.id]} selected={selected === m.id} onSelect={onSelect} />
      ))}
    </svg>
  );
});

function lineProps(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}
