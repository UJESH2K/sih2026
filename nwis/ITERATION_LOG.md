# NWIS demo — iteration log

Autonomous build/refine loop for SIH 2026 PS 26121 (Oil India · eRTMAC-NWIS).
Run: `npm run dev` → http://localhost:3000 (all data local & synthetic).
Screenshots for self-review: `node scripts/shot.mjs <path> <name> [--wait=ms] [--click="sel||sel"] [--dark]` (dev server on :3100).

## Decisions
- Next.js 16.3 (App Router, Turbopack) · React 19.2 · Tailwind 4 · shadcn/ui (Base UI "base-nova").
- Map: MapLibre GL **5.x** (v6 breaks deck.gl 9.4 `map.transform`) + deck.gl 9.4 interleaved overlay.
- `reactStrictMode: false` (deck overlay double-attach in dev).
- Light theme default, dark toggle; Hindi/English toggle; Field/Office mode.
- Risk model = formation-relative depth alignment + inverse-distance noisy-OR over offset events (src/lib/risk.ts) — explainable, every % links to evidence.

## Iteration 1 — 2026-09-28
- Data: 20 synthetic wells (Duliajan-East block), 8-formation Upper Assam stratigraphy, 49 events w/ source doc+page, casing, mud, documents.
- Engines: offset risk model, look-ahead, live eRTMAC replay generator w/ scripted loss/torque/kick zones, alert engine (predictive + real-time), mitigation feedback.
- Shell: labelled sidebar w/ descriptions, topbar (live well chip, Ctrl-K search, guided demo, Field/Office, हिंदी, theme, alerts bell).
- Pages: Overview (hero, next risk, risk ribbon, how-it-works), Map (2.5D columns, radius slider, rings, links, hexbins, trajectories, well panel), Live (tiles, mud-log tracks + predicted-risk column, look-ahead, alert feed w/ apply/ack/evidence), Wells list + detail (overview, depth strip, events & lessons, time-depth, casing & mud, documents).
- Guided tour (9 steps).

### Next priorities
1. Correlation view (formation-aligned tracks, connecting bands, active well live).
2. Ask NWIS (scripted streaming answers + citations).
3. Knowledge search (filters: type, formation, depth, severity, well).
4. Document AI mock (scan → OCR boxes → extracted table).
5. Risk dashboard (office KPIs, charts).
6. Polish: Hindi coverage, dark-mode check, mobile/tablet, field mode layouts, perf.
