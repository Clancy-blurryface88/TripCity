/** Isometric projection helpers. Grid coords (i, j) with height z (screen px). */
export const TW = 56; // tile width
export const TH = 28; // tile height
export const N = 18; // core grid size; (N/2, N/2) projects to (0, 0)

export interface Pt {
  x: number;
  y: number;
}

export function iso(i: number, j: number, z = 0): Pt {
  return { x: ((i - j) * TW) / 2, y: ((i + j - N) * TH) / 2 - z };
}

export function pts(list: Pt[]): string {
  return list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

/** Flat quad covering grid rectangle [i0,i1] x [j0,j1] at height z. */
export function quad(i0: number, j0: number, i1: number, j1: number, z = 0): string {
  return pts([iso(i0, j0, z), iso(i1, j0, z), iso(i1, j1, z), iso(i0, j1, z)]);
}

export interface BoxFaces {
  top: string;
  left: string; // face at j = j1 (faces down-left)
  right: string; // face at i = i1 (faces down-right)
}

export function box(i0: number, j0: number, i1: number, j1: number, h: number, z0 = 0): BoxFaces {
  return {
    top: quad(i0, j0, i1, j1, z0 + h),
    left: pts([iso(i0, j1, z0), iso(i1, j1, z0), iso(i1, j1, z0 + h), iso(i0, j1, z0 + h)]),
    right: pts([iso(i1, j0, z0), iso(i1, j1, z0), iso(i1, j1, z0 + h), iso(i1, j0, z0 + h)]),
  };
}

/** Deterministic PRNG so the city looks the same on every load. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
