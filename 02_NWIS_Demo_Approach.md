# NWIS — Demo Approach (Round 1)

> Scope: this is a **demo / prototype approach**, not the final architecture. The goal is to show the idea convincingly and visually. There is no real backend: all data is mocked, and "AI" behaviour is scripted.

---

## 1. Demo Format: What to Build

### Recommendation: a deployed web app (frontend-only)

| Option | Verdict | Why |
|---|---|---|
| **Web app (React, hosted on a live link)** | ✅ **Best** | Judges open it on any device; one link; looks like a real product; easy to screen-record |
| Desktop software (Electron, etc.) | ❌ | Install friction; no advantage for a demo |
| Figma prototype | ⚠️ Backup only | Looks good, but judges can tell it isn't "working" |
| Slides + video only | ❌ | Weakest; nothing interactive |

**Deliver three things:**
1. **Live link** (Vercel or Netlify, free).
2. **2–3 minute screen-recorded video** as a fallback in case the Wi-Fi or link fails.
3. **Screenshots** for the PPT or idea submission.

**How the "fake backend" works:** all well data lives in local JSON files. "Live drilling" is a pre-recorded data replay on a timer. The AI assistant has scripted answers for 5–6 prepared questions. To the viewer, it behaves like the real thing.

---

## 2. The Core Concept: The 2.5D Map

The map is the hero screen. A **2.5D view** means a tilted, perspective map (pitch ~50–60°) with extruded 3D objects on top of a flat or terrain base map. It is not full 3D, but it feels spatial and impressive.

### 2.1 Map setup
- **Base:** dark satellite or dark-vector style (a "control-room" feel).
- **Camera:** pitch 55°, slight rotation (bearing ~−20°), smooth `flyTo` animations when a well is selected.
- **Terrain:** optional hillshade or 3D terrain for depth cues.
- **Region:** mock field around Upper Assam (near Duliajan, OIL's HQ, ~27.36° N, 95.32° E) to give Indian and OIL context. Use **fictional well names** (e.g., `NWS-01 … NWS-18`) so no one mistakes it for real OIL data.

### 2.2 Wells as 3D objects
- Each well is an **extruded column** rising from the map.
  - **Height** = total depth drilled (scaled).
  - **Colour** = risk level (green / amber / red) or status.
  - **Glow / pulse** = the active well currently drilling.
- **Well status types:** Active drilling · Producing · Suspended · Abandoned · Planned (ghost / wireframe column).
- Hovering shows a tooltip (name, depth, status, number of events). Clicking opens the Well Panel.

### 2.3 The user pointer (your idea, enhanced)
- A **pulsing location marker** for the user or rig ("You are here").
- **Concentric distance rings** at 1 / 3 / 5 km, labelled.
- **Radius slider** (the "user-defined radius" from the problem statement): wells outside the radius fade to grey, wells inside light up.
- **Distance lines** from the user to each nearby well, with labels (`2.4 km`) that appear on hover or for the nearest 5.
- **"Nearest wells" list** on the side, sorted by distance, with bearing (e.g., `NWS-07 · 1.8 km NE`).

### 2.4 Map layers (toggle panel)
| Layer | What it shows |
|---|---|
| Wells (3D columns) | Default |
| Risk heatmap / hexbins | Extruded hexagons: height = density of past problems in that area |
| Event markers | Icons for losses 💧, kicks ⚠️, stuck pipe 🔒, fishing 🎣 |
| Well trajectories | Deviated well paths drawn as lines (surface projection) |
| Radius rings | Distance circles |
| Formation filter | Show only wells that had events in, e.g., the "Barail" formation |

---

## 3. Screen Layout

```
┌───────────────────────────────────────────────────────────────────┐
│  NWIS  │ Field: Upper Assam ▾ │ Active: NWS-12 │ 🔍 Search  │ 🔔 3 │
├──────────┬────────────────────────────────────────┬───────────────┤
│ LEFT     │                                        │ RIGHT         │
│ • Radius │         2.5D MAP (hero)                │ Well Panel    │
│   slider │   extruded wells, rings, user pointer  │ (opens on     │
│ • Layers │                                        │  click)       │
│ • Nearest│                                        │               │
│   wells  │                                        │               │
├──────────┴────────────────────────────────────────┴───────────────┤
│ BOTTOM: Live drilling strip  — Depth 2,843 m │ ROP │ Torque │ MW │ │
│         + Alert feed (scrolling)                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 4. Well Detail Panel (on click)

Slide-in panel with tabs:

1. **Overview:** name, status, spud and completion dates, total depth, distance from the user, operator, target formation, and a small risk score gauge.
2. **Timeline:** horizontal day-by-day timeline of the well (from DDRs), with event icons on the dates problems occurred and total NPT hours.
3. **Depth Strip:** vertical depth track with coloured formation bands and event markers at their depths. This is the most "engineering" visual and judges will love it.
4. **Casing & Mud:** simple wellbore schematic (casing strings drawn as nested lines) plus a mud weight vs. depth chart.
5. **Events & Lessons:** cards like
   > **Mud loss @ 2,910 m (Barail)** · 180 bbl lost · Cured with LCM pill + MW reduced 1.22 → 1.18 sg · NPT 14 h
   > 📄 Source: *DDR Day 23, p.2* (clickable "source document" badge)
6. **Documents:** list of mock WCR/DDR PDFs with an "AI-extracted ✓" tag.

---

## 5. Features That Make the Demo Stand Out

### 5.1 Offset Correlation View (the "wow" screen)
- Select 3–5 wells, and they appear **side by side as depth tracks**, aligned by formation tops.
- Formation bands connect across wells with shaded lines (like a geological cross-section).
- Event markers show at a glance that *"everyone had losses at the top of this formation."*
- The **active well** track fills in live as drilling progresses and approaches the danger band.

### 5.2 Live Drilling Replay + Proactive Alert (the "story" moment)
- Press ▶ **Start simulation**: depth ticks up, ROP/torque/SPP charts animate.
- At a scripted depth, a red **alert** appears:
  > ⚠️ **Mud loss risk: HIGH (78%)**
  > Approaching Barail formation top in ~45 m. 4 of 6 offset wells within 5 km had losses here.
  > **Recommendation:** Pre-treat with LCM, consider MW 1.18 sg (worked in NWS-04, NWS-09).
  > [View offset evidence →]
- Clicking the alert makes the map **fly to** the offset wells and highlight them.

### 5.3 AI Assistant ("Ask NWIS")
- Chat drawer with 5–6 scripted Q&As, typed out with a streaming effect:
  - "What problems did nearby wells face in the Barail formation?"
  - "Which wells had stuck pipe below 3,000 m?"
  - "Summarise NWS-07's drilling history."
- Every answer includes **source citations** (report name + page). This shows trust and traceability.

### 5.4 Document AI Mock (shows OCR/NLP)
- Drag in a scanned DDR (a sample image), then a scanning animation, then extracted fields appear as a structured table (date, depth, event, action) with highlights on the source image.
- Entirely pre-baked, but it visualises requirement R1 clearly.

### 5.5 Knowledge Search
- Global search bar: type "stuck pipe" and get filterable event cards across all wells (by formation, depth range, year, severity).

### 5.6 Risk Overview Dashboard (office view)
- KPI cards: total wells, NPT hours saved (projected), active alerts, top risk formation.
- Charts: events by formation (bar), NPT by event type (donut), risk by depth band (heat strip).

---

## 6. Design Improvements (Beyond "Map + Popups")

1. **Control-room dark theme:** near-black background, one accent colour (e.g., amber or cyan), red reserved only for danger. Serious and industrial, not "student project".
2. **Cinematic intro:** the app opens zoomed out on India, then flies into Assam and the field, and wells rise from the ground one by one. Takes 3 seconds and grabs attention.
3. **Consistent risk colour language** across map, charts, alerts and cards.
4. **Glassmorphism side panels** over the map, so the map is always visible behind.
5. **Micro-interactions:** hover lift on wells, animated counters, smooth panel slides (Framer Motion).
6. **Field vs. Office mode toggle:** Field mode shows big text, alerts first, minimal clutter (for tablets at the rig). Office mode shows full analytics. Speaks directly to requirement R7.
7. **Guided demo mode:** a "▶ Demo tour" button that walks through the story automatically with captions. Great for the recorded video and for judges exploring alone.
8. **Mobile / tablet responsive:** at least the map + alerts should work on a tablet.
9. **Bilingual labels (optional):** English + Hindi toggle as a nice touch for field crews.

---

## 7. Demo Tech Stack (Frontend Only)

| Need | Tool |
|---|---|
| Framework | React + Vite (or Next.js) |
| 2.5D map | **MapLibre GL JS** (free, supports pitch/bearing/terrain) or Mapbox GL JS |
| 3D well columns, hexbins, arcs | **deck.gl** (`ColumnLayer`, `HexagonLayer`, `ArcLayer`, `PathLayer`, `ScatterplotLayer`) on top of MapLibre |
| Distance calculations, radius circles | **Turf.js** |
| Charts / depth tracks | Recharts or Plotly (depth tracks can be custom SVG/D3) |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Icons | Lucide |
| Hosting | Vercel / Netlify |
| Data | Static JSON files in `/public/data` |

**Optional extra:** a small **three.js subsurface view** showing well trajectories going underground with formation layers as translucent slabs. Map libraries can't render below the surface, so this would be a separate "Subsurface" tab.

---

## 8. Mock Data Plan

Create ~15–20 wells. Suggested JSON structure:

```json
{
  "id": "NWS-07",
  "name": "NWS-07",
  "lat": 27.382, "lng": 95.341,
  "status": "producing",
  "spud_date": "2019-03-11",
  "total_depth_m": 3420,
  "formation_tops": [
    { "name": "Girujan", "top_m": 900 },
    { "name": "Tipam", "top_m": 1850 },
    { "name": "Barail", "top_m": 2860 }
  ],
  "casing": [
    { "size_in": 13.375, "shoe_m": 450 },
    { "size_in": 9.625, "shoe_m": 2100 }
  ],
  "mud_program": [ { "from_m": 0, "to_m": 2100, "mw_sg": 1.12 } ],
  "events": [
    {
      "type": "mud_loss",
      "depth_m": 2910,
      "formation": "Barail",
      "date": "2019-04-02",
      "severity": "high",
      "details": "180 bbl lost",
      "action": "LCM pill, MW reduced 1.22 → 1.18 sg",
      "npt_hours": 14,
      "source": "DDR Day 23, p.2"
    }
  ],
  "risk_score": 0.72
}
```

Also create:
- `live_replay.json`: depth vs. time with ROP, torque, SPP, MW, flow in/out for the active well.
- `assistant_qa.json`: scripted questions and answers with citations.
- `alerts.json`: trigger depth, message, recommendation, linked offset wells.

> ⚠️ Formation names and depths above are illustrative placeholders. Verify against public Upper Assam geology references before showing them to judges, or keep them clearly labelled as synthetic.

**Real public data option:** Equinor's **Volve dataset** (North Sea) contains real DDRs, well logs and real-time drilling data. It's useful to prove the concept on genuine reports if time permits.

---

## 9. Demo Story Script (~3 minutes)

| Time | Scene |
|---|---|
| 0:00–0:20 | Cinematic intro: India, then Assam, then the field; wells rise. State the problem in one line. |
| 0:20–0:50 | User pointer + radius slider: nearby wells light up, distances shown. |
| 0:50–1:20 | Click a well: overview, timeline, depth strip, events with source citations. |
| 1:20–1:45 | Document AI mock: scanned DDR becomes a structured table. |
| 1:45–2:25 | Start live simulation: approaching Barail; **alert fires**; map flies to the offset evidence; correlation view. |
| 2:25–2:50 | Ask NWIS: one question answered with citations. |
| 2:50–3:00 | Close: "NWIS turns scattered reports into proactive decisions." |

---

## 10. Build Priority (If Time Is Short)

1. **Must have:** 2.5D map, extruded wells, user pointer, radius + distances, well detail panel.
2. **Should have:** live replay + alert, depth strip, events & lessons with sources.
3. **Nice to have:** correlation view, AI assistant, document AI mock, risk dashboard.
4. **Bonus:** cinematic intro, guided tour, field/office mode, subsurface 3D view.
