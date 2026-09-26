import type { CategoryId } from '@/domain/types';

export type SpotId = 'airport' | 'insurance' | 'hotel' | 'landmark' | 'taxi' | 'rental' | 'train' | 'suitcase';
export type TransportTab = 'train' | 'taxi';

export interface Hotspot {
  id: SpotId;
  category: CategoryId;
  tab?: TransportTab;
  /** Center of the building, in % of the 9:16 board image (identical on every city board). */
  x: number;
  y: number;
  /** Tap area size, % of board width / height. */
  w: number;
  h: number;
}

export const HOTSPOTS: Hotspot[] = [
  { id: 'airport', category: 'flights', x: 22, y: 6.5, w: 34, h: 8 },
  { id: 'insurance', category: 'insurance', x: 89, y: 11, w: 14, h: 14 },
  { id: 'hotel', category: 'hotels', x: 21, y: 30, w: 30, h: 12 },
  { id: 'landmark', category: 'attractions', x: 66, y: 40, w: 44, h: 18 },
  { id: 'taxi', category: 'transport', tab: 'taxi', x: 58, y: 63, w: 20, h: 8 },
  { id: 'rental', category: 'car', x: 88, y: 60, w: 22, h: 9 },
  { id: 'train', category: 'transport', tab: 'train', x: 22, y: 69, w: 40, h: 12 },
  { id: 'suitcase', category: 'checklist', x: 83, y: 77, w: 22, h: 10 },
];
