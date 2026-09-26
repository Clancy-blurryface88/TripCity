import type { CityKey } from '@/domain/types';

// Each board is a 9:16 WebP in src/assets/cities/<key>.webp. Missing cities fall back to generic.webp,
// so a new image only needs to be dropped into that folder.
const files = import.meta.glob('../assets/cities/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const BOARDS: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) BOARDS[path.split('/').pop()!.replace('.webp', '')] = url;

export function boardImage(key: CityKey): { url: string; key: CityKey | 'generic' } {
  if (BOARDS[key]) return { url: BOARDS[key], key };
  return { url: BOARDS.generic ?? '', key: 'generic' };
}

export function hasBoard(key: CityKey): boolean {
  return Boolean(BOARDS[key]);
}
