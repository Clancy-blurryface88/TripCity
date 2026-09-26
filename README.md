# Trip City

הטיול שלך כעיר אחת. React + TypeScript + Tailwind PWA, Hebrew RTL, mobile first.

## Phase 1 (this version)
- City Home: isometric Paris with the Eiffel Tower, 7 small category markers, bottom sheets.
- Map / Itinerary toggle, day-by-day timeline ("יום X מתוך N"), conflict detection (sample overlap on day 3).
- Floating "✨ בנה לי את המסלול" button: shows anchors vs flexible items. The AI engine is not connected yet (Phase 5).
- Desktop: map 60% | panel 40%.
- All times shown in the trip timezone (Europe/Paris), never the phone timezone.
- Sample data only (`src/data/paris.ts`). No fake production APIs: external services sit behind interfaces in `src/services/ports.ts` and throw `NotConnectedError` until wired.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest: domain, AI JSON validation, City Home UI
npm run build      # typecheck + production build
```
Deep links for testing: `?mode=itinerary&day=3`, `?sheet=hotels`, `?ai=1`.

## Backend (ready to connect)
- `supabase/migrations/0001_init.sql`: all tables, RLS on every table, private `trip-documents` bucket with per-user folders.
- Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- LLM / OCR / maps keys go only into Supabase Edge Function secrets. The AI planner must return JSON matching `src/ai/schema.ts`; `parsePlan` validates it and rejects plans that move locked anchors.

## Structure
- `src/domain` types, time (timezone), conflicts, progress, cities
- `src/city` isometric projection, layout, scene, landmarks (Paris + generic fallback)
- `src/components` app shell, sheets, itinerary, progress
- `src/services` ports, mock repository, Supabase adapters
- `src/ai` structured output schema

## Next phases
2 Flights/Hotels/Activities forms · 3 Documents + OCR · 4 Drag & drop + editing · 5 AI planner · 6 Checklist/notifications. Landmarks for Rome, London, New York and Tokyo plug into `src/city/landmarks`.
