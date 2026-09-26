import type { ItineraryItem } from './types';
import { minutesBetween } from './time';

export type ConflictKind = 'overlap' | 'travel_too_short';

export interface Conflict {
  kind: ConflictKind;
  itemIds: [string, string];
  /** Minutes of overlap, or minutes missing for travel. */
  minutes: number;
}

const DEFAULT_DURATION_MIN = 60;

function endOf(item: ItineraryItem): string {
  if (item.endAt) return item.endAt;
  return new Date(new Date(item.startAt).getTime() + DEFAULT_DURATION_MIN * 60000).toISOString();
}

/**
 * Detect schedule conflicts within one list of items (usually one day).
 * - overlap: an item starts before the previous one ends.
 * - travel_too_short: the gap is shorter than the estimated travel time.
 */
export function detectConflicts(items: ItineraryItem[]): Conflict[] {
  const sorted = [...items].sort((a, b) => a.startAt.localeCompare(b.startAt));
  const conflicts: Conflict[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const gap = minutesBetween(endOf(a), b.startAt);
    if (gap < 0) {
      conflicts.push({ kind: 'overlap', itemIds: [a.id, b.id], minutes: -gap });
    } else if (a.travelToNext && gap < a.travelToNext.minutes) {
      conflicts.push({ kind: 'travel_too_short', itemIds: [a.id, b.id], minutes: a.travelToNext.minutes - gap });
    }
  }
  return conflicts;
}

/** Would moving `item` to `newStartAt` create a conflict with a locked anchor? Used before applying user edits. */
export function conflictsWithAnchors(item: ItineraryItem, newStartAt: string, dayItems: ItineraryItem[]): ItineraryItem[] {
  const duration = item.endAt ? minutesBetween(item.startAt, item.endAt) : DEFAULT_DURATION_MIN;
  const start = new Date(newStartAt).getTime();
  const end = start + duration * 60000;
  return dayItems.filter((other) => {
    if (other.id === item.id || !other.isLocked) return false;
    const oStart = new Date(other.startAt).getTime();
    const oEnd = new Date(endOf(other)).getTime();
    return start < oEnd && oStart < end;
  });
}
