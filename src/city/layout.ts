import type { CategoryId } from '@/domain/types';
import { box, iso, rng, type BoxFaces, type Pt } from './iso';

export type Rect = [i0: number, i1: number, j0: number, j1: number];

export const EXTENT = { min: -3, max: 23 };
export const RIVER: Rect = [EXTENT.min, EXTENT.max, 11, 13];
export const QUAIS: Rect[] = [
  [EXTENT.min, EXTENT.max, 10.7, 11],
  [EXTENT.min, EXTENT.max, 13, 13.3],
];
/** Roads running along i (constant j band) and along j (constant i band). */
export const ROADS_I: Rect[] = [
  [EXTENT.min, EXTENT.max, 10.1, 10.7],
  [EXTENT.min, EXTENT.max, 3.4, 4.0],
  [EXTENT.min, EXTENT.max, 13.3, 13.8],
  [EXTENT.min, EXTENT.max, 17.4, 18.0],
];
export const ROADS_J: Rect[] = [
  [-0.6, 0, EXTENT.min, EXTENT.max],
  [5.4, 6.0, EXTENT.min, EXTENT.max],
  [11.4, 12.0, EXTENT.min, EXTENT.max],
  [15.4, 16.0, EXTENT.min, EXTENT.max],
  [20.4, 21.0, EXTENT.min, EXTENT.max],
];
export const BRIDGES: Rect[] = ROADS_J.map(([i0, i1]) => [i0 - 0.05, i1 + 0.05, 10.7, 13.3]);

export const PARK: Rect = [6.0, 11.4, 4.0, 10.1];
export const PLAZA: Rect = [7.0, 11.0, 7.4, 10.1];
export const LAWNS: Rect[] = [
  [6.4, 8.5, 4.4, 7.0],
  [8.9, 11.0, 4.4, 7.0],
];
export const TROCADERO: Rect = [6.0, 11.4, 13.8, 17.4];
export const FOUNTAIN: Rect = [7.9, 9.5, 14.3, 15.9];
export const PARKING: Rect = [12.3, 15.1, 14.1, 17.1];

export const TOWER_AT = { i: 9, j: 9 };

export type SpecialKind = 'hotel' | 'station' | 'insurance' | 'ecole' | 'chaillot';
export interface Building {
  key: string;
  rect: Rect;
  h: number;
  faces: BoxFaces;
  depth: number;
  special?: SpecialKind;
  chimney?: BoxFaces;
}

const SPECIALS: Array<{ kind: SpecialKind; rect: Rect; h: number }> = [
  { kind: 'hotel', rect: [1.3, 2.9, 5.6, 7.1], h: 58 },
  { kind: 'station', rect: [12.4, 15.0, 6.4, 9.6], h: 38 },
  { kind: 'insurance', rect: [16.4, 18.2, 14.1, 15.5], h: 34 },
  { kind: 'ecole', rect: [6.5, 10.9, 1.6, 3.1], h: 30 },
  { kind: 'chaillot', rect: [6.3, 8.1, 16.4, 17.2], h: 28 },
  { kind: 'chaillot', rect: [9.3, 11.1, 16.4, 17.2], h: 28 },
];

const I_BANDS: Array<[number, number]> = [
  [EXTENT.min, -0.6],
  [0, 5.4],
  [6, 11.4],
  [12, 15.4],
  [16, 20.4],
  [21, EXTENT.max],
];
const J_BANDS: Array<[number, number]> = [
  [EXTENT.min, 3.4],
  [4.0, 10.1],
  [13.8, 17.4],
  [18.0, EXTENT.max],
];

function overlaps(a: Rect, b: Rect): boolean {
  return a[0] < b[1] && b[0] < a[1] && a[2] < b[3] && b[2] < a[3];
}

const RESERVED: Rect[] = [PARK, TROCADERO, PARKING, ...SPECIALS.map((s) => s.rect), [6, 11.4, 1.2, 3.4]];

export function buildCity(): Building[] {
  const r = rng(20270412);
  const out: Building[] = [];
  for (const [bi0, bi1] of I_BANDS) {
    for (const [bj0, bj1] of J_BANDS) {
      // split block into cells
      const iCuts: number[] = [bi0];
      while (iCuts[iCuts.length - 1] < bi1 - 0.9) iCuts.push(Math.min(bi1, iCuts[iCuts.length - 1] + 1.2 + r() * 0.8));
      if (bi1 - iCuts[iCuts.length - 1] < 0.9) iCuts[iCuts.length - 1] = bi1;
      else iCuts.push(bi1);
      const depth = bj1 - bj0;
      const rows = depth > 4.5 ? 3 : depth > 2.6 ? 2 : 1;
      const jCuts = Array.from({ length: rows + 1 }, (_, k) => bj0 + (depth * k) / rows);
      for (let a = 0; a < iCuts.length - 1; a++) {
        for (let b = 0; b < jCuts.length - 1; b++) {
          const rect: Rect = [iCuts[a] + 0.1, iCuts[a + 1] - 0.1, jCuts[b] + 0.1, jCuts[b + 1] - 0.1];
          if (rect[1] - rect[0] < 0.5 || rect[3] - rect[2] < 0.5) continue;
          if (RESERVED.some((res) => overlaps(res, rect))) continue;
          const h = 26 + Math.round(r() * 20);
          const cx = (rect[0] + rect[1]) / 2;
          const cy = (rect[2] + rect[3]) / 2;
          const b2: Building = { key: `b-${out.length}`, rect, h, faces: box(rect[0], rect[2], rect[1], rect[3], h), depth: cx + cy };
          if (r() < 0.45) {
            const ci = rect[0] + 0.2 + r() * (rect[1] - rect[0] - 0.5);
            const cj = rect[2] + 0.15;
            b2.chimney = box(ci, cj, ci + 0.18, cj + 0.18, 7, h);
          }
          out.push(b2);
        }
      }
    }
  }
  for (const s of SPECIALS) {
    out.push({
      key: `s-${s.kind}-${s.rect[0]}`,
      rect: s.rect,
      h: s.h,
      faces: box(s.rect[0], s.rect[2], s.rect[1], s.rect[3], s.h),
      depth: (s.rect[0] + s.rect[1]) / 2 + (s.rect[2] + s.rect[3]) / 2,
      special: s.kind,
    });
  }
  return out;
}

export interface Tree {
  key: string;
  p: Pt;
  depth: number;
  size: number;
}

export function buildTrees(): Tree[] {
  const r = rng(75);
  const list: Array<[number, number]> = [];
  for (let j = 4.3; j < 10; j += 0.55) {
    list.push([6.2, j], [11.2, j]);
  }
  for (let i = 6.6; i < 11; i += 0.6) list.push([i, 7.2]);
  for (let j = 14; j < 16.3; j += 0.55) list.push([6.3, j], [11.1, j]);
  for (let i = EXTENT.min + 0.3; i < EXTENT.max; i += 0.75) {
    if (ROADS_J.some(([a, b]) => i > a - 0.3 && i < b + 0.3)) continue;
    list.push([i, 10.85 - 0.02], [i, 13.55]);
  }
  return list.map(([i, j], k) => ({ key: `t-${k}`, p: iso(i, j), depth: i + j, size: 0.85 + r() * 0.35 }));
}

export interface MarkerSpot {
  id: CategoryId;
  anchor: Pt; // point on the scene the marker belongs to
  lift: number; // how far above the anchor the pin floats
}

export const MARKER_SPOTS: MarkerSpot[] = [
  { id: 'flights', anchor: { x: 150, y: -262 }, lift: 0 },
  { id: 'hotels', anchor: iso(2.1, 6.35, 58), lift: 26 },
  { id: 'attractions', anchor: iso(10.6, 8.2), lift: 58 },
  { id: 'transport', anchor: iso(13.7, 8.0, 38), lift: 24 },
  { id: 'checklist', anchor: iso(3.6, 8.9, 30), lift: 26 },
  { id: 'car', anchor: iso(13.7, 15.6), lift: 30 },
  { id: 'insurance', anchor: iso(17.3, 14.8, 34), lift: 24 },
];
