import { z } from 'zod';

/**
 * Strict contract for the AI itinerary planner (spec §23).
 * The model returns ONLY this JSON (Structured Outputs). It never returns HTML or UI decisions.
 * The Edge Function validates with this schema before anything touches the database.
 */
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'HH:mm');
const localDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD');

export const sourceTypeSchema = z.enum(['flight', 'hotel_check_in', 'hotel_check_out', 'transport', 'activity', 'event', 'car_pickup', 'car_dropoff', 'free_time']);

export const plannedItemSchema = z
  .object({
    source_type: sourceTypeSchema,
    source_id: z.string().min(1).nullable(),
    start: hhmm,
    end: hhmm,
    reason: z.string().max(300),
  })
  .strict()
  .refine((i) => i.end > i.start, { message: 'end must be after start', path: ['end'] });

export const conflictSchema = z
  .object({
    item_ids: z.array(z.string()).min(1),
    message: z.string().max(300),
  })
  .strict();

export const planSchema = z
  .object({
    days: z.array(z.object({ date: localDate, items: z.array(plannedItemSchema) }).strict()),
    conflicts: z.array(conflictSchema),
    unplaced_items: z.array(z.object({ source_id: z.string(), reason: z.string().max(300) }).strict()),
  })
  .strict();

export type AiPlan = z.infer<typeof planSchema>;

export type ParseResult = { ok: true; plan: AiPlan } | { ok: false; errors: string[] };

/** Validate raw model output. Also rejects plans that move a locked anchor. */
export function parsePlan(raw: unknown, lockedIds: ReadonlyMap<string, { date: string; start: string }> = new Map()): ParseResult {
  const res = planSchema.safeParse(raw);
  if (!res.success) {
    return { ok: false, errors: res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
  }
  const errors: string[] = [];
  for (const day of res.data.days) {
    for (const it of day.items) {
      if (!it.source_id) continue;
      const anchor = lockedIds.get(it.source_id);
      if (anchor && (anchor.date !== day.date || anchor.start !== it.start)) {
        errors.push(`anchor ${it.source_id} was moved`);
      }
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true, plan: res.data };
}
