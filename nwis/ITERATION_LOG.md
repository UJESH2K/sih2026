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


## Iteration 2 — 2026-09-28
- Correlation: formation-aligned vs MD toggle, cross-section bands, event filter, add/remove wells, auto "Patterns found".
- Ask NWIS: local retrieval engine (wells/formations/problems/depth/radius parsing incl. Hindi terms), intents (summary, mud weight, advice, search), streaming reveal, citations → source pages, follow-ups.
- Knowledge search: text + facets w/ live counts, depth slider, radius toggle, sort, top lessons.
- Document AI: 5-stage pipeline, scanned DDR/WCR samples, OCR outlines, NLP entity tags, structured record w/ confidence, links to KB.
- Risk dashboard: KPIs (projected NPT saving), NPT by cause, events by formation (stacked, validated palette), depth heat strip, learning curve, worst wells.
- Event palette re-assigned to validated reference order (dataviz validator); chips use neutral text + coloured icon.
- Data consistency: per-event overrides (NWS-07 loss ↔ DDR sample; NWS-03 stuck → fishing), formation-aware lessons.

### Next priorities
1. Full QA pass: dark mode, Hindi, Field mode, tablet/mobile widths, guided tour end-to-end.
2. Map polish: labels on top, legend/scale overlap, planned wells ghost look, offline fallback test.
3. Correlation: show predicted zones on active track; Live: better formation labels & flow value overlap.
4. Dashboard learning-curve sanity; field-mode simplified overview.
5. Research previous SIH winning demo patterns → landing/pitch touches (problem→solution framing, impact numbers).
