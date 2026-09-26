import type { CityKey } from '@/domain/types';
import { EiffelTower } from './EiffelTower';
import { GenericLandmark } from './GenericLandmark';

/**
 * Landmark registry (spec §3). Phase 1 ships Paris; Rome (Colosseum), London (Big Ben / Eye),
 * New York (Liberty / skyline) and Tokyo (Tokyo Tower) plug in here. Unknown cities get the generic skyline.
 */
export const LANDMARKS: Partial<Record<CityKey, (p: { x?: number; y?: number }) => JSX.Element>> = {
  paris: EiffelTower,
};

export function Landmark({ city, x, y }: { city: CityKey; x?: number; y?: number }) {
  const L = LANDMARKS[city] ?? GenericLandmark;
  return <L x={x} y={y} />;
}
