# NWIS — Pitch Guide
### SIH 2026 · Problem Statement 26121 · Oil India Limited
**eRTMAC-NWIS (Nearby Wells Intelligence System): an AI-powered offset-well knowledge and decision-support platform for drilling operations**

> Use this as your speaking script and cheat sheet. Each section of the website has what it is, how to demo it, what to say, and which requirement of the problem statement it answers.

---

## 1. The 30-second pitch (say this first)

> "When a drilling team in Upper Assam approaches a difficult formation, the answer to *'what happened to the wells next to us at this depth?'* is buried in hundreds of PDF reports and in the memory of a few senior engineers.
>
> **NWIS turns those scattered reports into institutional memory, and warns the driller *before* the bit reaches the depth where nearby wells had trouble.** It tells them what the problem was, how likely it is, and what fixed it last time, with the source report and page as proof.
>
> It works alongside eRTMAC: eRTMAC shows what is happening *now*, and NWIS adds what happened *before*, *nearby*."

**One line to repeat at the end:** *"NWIS turns scattered reports into proactive decisions."*

---

## 2. The problem, in plain words

Oil India's **eRTMAC** already streams real-time drilling and mud-logging data. But real-time data only shows the **active well**. Good drilling decisions in complex formations also need the experience of **nearby (offset) wells** drilled in the same reservoir.

Today that experience is:

| Where the knowledge lives | Why it hurts |
|---|---|
| Well Completion Reports (WCRs), Daily Drilling Reports (DDRs), PDFs, old scans | Slow to search. Engineers spend hours reading reports. |
| Individual engineers' memory | Leaves when people rotate or retire. Not available at 3 a.m. at the rig. |
| Separate databases | No link between a mud loss in one well and the same formation in the next well. |

**Result:** decisions are delayed and problems that *could* have been anticipated (mud losses, kicks, stuck pipe) are met reactively. That becomes **Non-Productive Time (NPT)**, the costliest kind of rig time.

The problem statement asks for **four missing capabilities**:
1. Show nearby wells on a **map** relative to the active well.
2. **Instant access** to historical drilling experience from offset wells.
3. **Correlate** parameters, formations and problems across wells.
4. **Proactive alerts** when the current well approaches depths or formations where offsets had trouble.

---

## 3. How NWIS answers every requirement

| # | Expected outcome in the PS | Where it is in NWIS |
|---|---|---|
| R1 | AI / NLP / OCR to extract data from reports | **Document AI** page (scan → OCR → NLP entities → structured record) |
| R2 | Interactive map of nearby wells, user-defined radius | **Nearby Wells Map** (3D columns, radius slider, rings, distances) |
| R3 | Searchable repository of events, lessons, mitigations | **Knowledge Search**, **Ask NWIS**, **Well Records** |
| R4 | Correlate geology, drilling, reservoir data by depth & formation | **Offset Correlation** (formation-aligned tracks + auto patterns) |
| R5 | Predictive analytics for mud loss, stuck pipe, overpressure, torque, cementing | **Risk model**: look-ahead on **Live Drilling**, risk ribbon on **Overview** |
| R6 | Real-time alerts and recommendations | **Live Drilling** alerts (predictive + live-signal), bell icon, pop-ups |
| R7 | User-friendly dashboard for field and office personnel | **Field / Office mode**, **Risk Dashboard**, Hindi toggle, guided demo |

> Say it this way: *"Every one of the seven expected outcomes has a screen, and I'll show all of them in three minutes."*

---

## 4. Section-by-section walkthrough

### 4.0 The frame: top bar and side menu (visible on every page)

**What it is:** the navigation, designed for people who don't live on websites.

- **Side menu:** every item has an icon, a name *and a one-line description* ("Offset wells around the rig on a 3D map"), so nobody has to guess what a button does. It is grouped into *Operations*, *Knowledge* and *Office*.
- **Active-well chip** (top centre): always shows `NWS-12 · 2,650 m · Tipam Sandstone`. The current depth and formation are never more than a glance away. Click it to jump to Live Drilling.
- **Search (Ctrl + K):** one box finds wells, drilling events and pages, or sends the question to Ask NWIS.
- **Guided demo:** a 9-step walkthrough that moves through the app by itself with captions. Useful if a judge wants to explore alone.
- **Field / Office toggle:**
  - *Field mode* (for tablets at the rig site): larger text, only the essentials in the menu (Overview, Map, Live, Ask).
  - *Office mode*: all analytics and planning tools.
- **हिंदी / English toggle:** labels, alerts and navigation switch to Hindi for field crews.
- **Theme:** light by default (readable in daylight and on projectors), dark "control-room" mode available.
- **Bell:** count of new alerts; opens the alert list.

**What to say:** *"We designed this for a drilling engineer on a tablet at the rig, not for a software engineer. Everything is labelled, the current depth is always visible, and one switch gives a simpler Field mode or a Hindi interface."*

**Covers:** R7.

---

### 4.1 Overview (home page)

**What it is:** the "where are we, what's next" screen.

**On screen:**
- **Active well card:** *"Currently at 2,650 m in Tipam Sandstone, drilling the 8½″ section"*, with a progress bar to the target depth (3,950 m).
- **Next risk ahead:** the single most important warning, e.g. **Mud loss: HIGH, about 79%, at ~2,910 m (Barail), 7 of 12 offset wells had this problem here.** It includes the recommendation and *what worked before* in a named offset well.
- **Predicted risk along the rest of the well:** a horizontal strip across the formations (Tipam → Barail → Kopili → Sylhet) showing where each problem type is likely: mud loss at the Barail top, stuck pipe deeper in the Barail coals, kick in the Kopili.
- **Numbers:** offset wells in radius, reports read by AI (90 documents, ~5,100 pages), drilling events indexed (49), historical NPT captured.
- **"How NWIS works":** four steps: *Read the reports → Build institutional memory → Correlate by formation → Alert ahead of the bit.* Each links to its page.
- **Quick question box** for Ask NWIS, and the latest alerts.

**How to demo:** open the page and point at the *Next risk* card and the risk strip. Click **Start live replay**.

**What to say:** *"In five seconds a driller knows where the bit is, what's coming, how likely it is, and what to do about it."*

**Covers:** R5, R6, R7.

---

### 4.2 Nearby Wells Map

**What it is:** the geospatial view of the field around the active rig (requirement R2).

**On screen:**
- A tilted **2.5D map** (fictional block near Duliajan, Upper Assam). On first open it flies in from India to Assam to the field, and the wells rise out of the ground.
- **Each well is a 3D column:** height = total depth; colour = status (blue = drilling now, green = producing, amber = suspended, grey = abandoned, purple outline = planned).
- **Pulsing marker** = the active rig (NWS-12).
- **Search-radius slider (0.5–10 km)** plus quick buttons (1 / 3 / 5 / 8 km). Wells inside the circle light up and wells outside fade to grey.
- **Distance lines and labels** from the rig to each nearby well.
- **"Nearest offset wells" list:** distance *and direction* (e.g. `NWS-07 · 1.6 km SE`) and the problems each one had.
- **Layer switches:** well columns, distance rings, distance lines, **problem-density hexagons** (where past trouble concentrated), deviated well paths, names. Map or satellite base.
- **Click any well:** a side panel opens with its overview, depth strip, events & lessons, casing & mud, and documents, plus an *Add to correlation* button.
- **Mini live card:** current depth and next risk; tapping it highlights the evidence wells on the map.

**How to demo:** drag the radius from 5 km to 2 km and back, then click **NWS-07** and show the Events tab.

**What to say:** *"The radius is user-defined, exactly as the problem statement asks. Every well you can see is a clickable history."*

**Covers:** R2 (and R3 through the well panel).

---

### 4.3 Live Drilling ⭐ (the "story moment")

**What it is:** NWIS running next to the eRTMAC stream, looking ahead of the bit (requirements R5 + R6).

**On screen:**
- **Controls:** Start / Pause, speed 1× / 2× / 4×, **Skip to next risk** (jumps just before a trouble zone so demos stay short), Reset. It says clearly: *"Replay of recorded eRTMAC stream (synthetic)"*.
- **Big bit depth** and current formation with lithology.
- **Parameter tiles:** ROP, WOB, RPM, Torque, SPP, Mud weight, Flow out/in, Pit gain. A tile turns red when abnormal.
- **Mud-log style depth tracks** (depth runs downward, as engineers read it): formation column, ROP, Torque, SPP, Flow in/out, Pit gain/Gas.
  - **Above the blue line** = already drilled (live data).
  - **Grey zone below** = the next 200 m, and the right-hand **Predicted risk** column shows Loss / Stuck / Kick risk coming from offset wells.
- **Look-ahead panel:** each upcoming risk with probability, depth, distance ahead, and *"7 of 12 offset wells had this problem here: NWS-15, NWS-04, …"*.
- **Alerts feed** with two kinds of alert:
  1. **Predictive** (from offset wells). Example:
     > **Mud loss risk: HIGH (~75%)**. In the Barail, ~160 m ahead (2,880 m). 7 of 12 offset wells had this problem at the equivalent depth.
     > **Recommendation:** pre-treat with sized LCM, keep MW ≤ 1.22 sg, cut flow rate ~10%.
     > **What worked before (NWS-16, NPT 7 h):** pre-treated the system with 15 ppb sized CaCO₃ and reduced ROP.
  2. **Real-time signal** (from the live data): e.g. *"Torque +40% over the 50 m baseline. This signature preceded stuck pipe in NWS-07"*, *flow-out < flow-in* (loss), *pit gain* (kick).
- Each alert has three buttons: **Apply recommendation**, **Acknowledge**, **Show offset wells on map** (the map flies to the evidence wells and highlights them in red).
- **Apply recommendation changes the outcome:** if the LCM recommendation is applied before the loss zone, the flow-out barely drops; if it is ignored, the replay shows heavy losses. The same applies to the kick zone (mud weight is raised) and the torque zone.

**How to demo (60 seconds):**
1. Click **Skip to next risk**, then **Start**.
2. A red pop-up appears: *Mud loss risk HIGH*. Read it out.
3. Click **Show offset wells on map**: the map flies to the highlighted wells.
4. Go back and click **Apply recommendation**, then continue drilling through the Barail top: returns stay stable.

**What to say:** *"This is the heart of NWIS. The alert comes about 160 m before the problem, not after it. It says what, where, how likely, and what worked in the well next door, with proof. The engineer stays in charge: NWIS recommends, the engineer decides."*

**Covers:** R5, R6 (and R4, because the prediction is formation-correlated).

---

### 4.4 Offset Correlation ⭐ (the "engineering wow" screen)

**What it is:** offset wells side by side, **aligned by formation tops** (requirement R4).

**On screen:**
- The active well (NWS-12) plus selected offsets (default NWS-04, 07, 15, 16) as vertical tracks with coloured formation bands.
- **Two alignment modes:**
  - *Align by formation:* the same rock lines up horizontally, even if it sits at a different depth in each well. This is the correct way to compare wells.
  - *Measured depth:* raw depths, with slanted connecting bands that look like a geological cross-section (formations dip across the field).
- **Event markers** (Loss, Kick, Stuck, Torque, …) on every well; click one for full details and the source report.
- **Active well:** the drilled part plus a hatched undrilled part and a live bit line.
- **"Patterns found" panel** (automatic), e.g.:
  - *Mud loss in 4/4 wells, on average 28 m below the Barail top. Total NPT 51 h.*
  - *Kick in 3/4 wells, about 78 m below the Kopili top.*
  - *Stuck pipe in 2/4 wells, about 228 m below the Barail top.*
- Add or remove wells and filter by problem type.

**How to demo:** toggle *Measured depth* then *Align by formation*, and point at the loss markers lining up at the Barail top.

**What to say:** *"Comparing by raw depth is misleading because formations dip. NWIS aligns wells by geology, and the pattern jumps out: everyone lost mud just below the Barail top. That's institutional memory as a picture."*

**Covers:** R4, R3.

---

### 4.5 Ask NWIS (AI assistant)

**What it is:** ask the knowledge base questions in plain language.

**On screen:**
- Suggested questions, e.g.:
  - *What problems did nearby wells face in the Barail formation?*
  - *Which wells had stuck pipe below 3,000 m?*
  - *Summarise NWS-07's drilling history*
  - *What mud weight worked for the Kopili?*
  - *What should we prepare for in the next 200 m?*
- **"Understood as" chips:** shows how NWIS interpreted the question (Formation: Barail · Offsets within 5 km · Depth ≥ 3,000 m). This is transparency.
- The answer streams in, with a summary, bullet points and **numbered citations** that link to the exact report and page (e.g. *NWS-07 · DDR Day 36, p.2*). There are tables where useful (casing, mud weights per well) and follow-up question buttons.
- It understands key Hindi terms too (e.g. *"बरैल में मड लॉस"*).

**How to demo:** click *"What problems did nearby wells face in the Barail formation?"*, then click citation [1] to show it opens the source.

**What to say:** *"Every answer is grounded in the knowledge base, and every statement cites its source report and page. No black box, and nothing invented."*

**Covers:** R3, R1 (the knowledge came from extracted reports).

---

### 4.6 Knowledge Search

**What it is:** the searchable institutional memory: every event, action taken and lesson learned (requirement R3).

**On screen:**
- Search box (e.g. *stuck pipe coal*, *LCM pill*, *Kopili kick*).
- **Filters with live counts:** problem type, formation, severity, depth range slider, *only offsets within X km*.
- **Event cards:** problem, depth, formation, what happened, **Action taken**, **Lesson learned**, severity, NPT hours, date, and a **source badge** (e.g. *DDR Day 37, p.1 · 88% extraction confidence*).
- **Top lessons** panel: the most valuable lessons in the current results, ranked by NPT they would have saved.

**What to say:** *"This is what used to take hours of reading PDFs. Now it's a search box with filters, and each card says what happened, what was done, and what we learned."*

**Covers:** R3.

---

### 4.7 Well Records

**What it is:** one complete page per well.

**Tabs:**
- **Overview:** status, depth, distance from the rig, spud date, profile, rig, total NPT, risk score.
- **Depth strip:** a vertical "mud-log" view with formation bands, casing shoes and event markers at their depths. Click an event for details.
- **Events & Lessons:** all event cards with sources.
- **Timeline (time vs depth):** the classic drilling curve. Flat steps are NPT and casing runs, compared against a benchmark. Engineers recognise it immediately.
- **Casing & Mud:** wellbore schematic (nested casing strings, cement quality) next to mud weight vs depth.
- **Documents:** the WCR, DDRs, mud log, cement and survey reports, each with an *AI-extracted ✓* status and the number of fields extracted.

**What to say:** *"Everything about a well, from casing to cement to the day-by-day problems, on one page instead of five reports."*

**Covers:** R3, R4 (casing, cementing and mud programs, as listed in the PS).

---

### 4.8 Document AI

**What it is:** how old reports become data (requirement R1: AI / NLP / OCR).

**On screen:** a 5-step pipeline: **Upload → OCR (read text) → NLP (find entities) → Structure record → Add to knowledge base.**
- Sample 1: a **scanned, skewed DDR fax** from NWS-07. Sample 2: a **faded WCR photocopy** (casing summary) from NWS-03. You can also drop a file.
- OCR draws boxes line by line with a scanning bar. NLP then highlights entities in colour: **Well, Date, Depth, Formation, Event, Volume, Rate, Mud weight, Action, NPT, Casing**.
- A **structured record** appears with a **confidence %** per field. Fields below 90% are flagged for a quick human check.
- Final step: **"Saved as event NWS-07-E1 → View"** opens the same event in the knowledge base. The demo is consistent end to end.

**How to demo:** pick the DDR, click **Run extraction** and let it play (~5 s), then click **View**.

**What to say:** *"Oil India has decades of reports, many of them scans. NWIS reads them once, pulls out depth, event, action and NPT, and every record keeps a link back to its page. Low-confidence fields go to a human, because trust matters."*

**Covers:** R1.

---

### 4.9 Risk Dashboard (office view)

**What it is:** a field-wide view for planning engineers and management (R7 "office-based personnel").

**On screen:**
- **KPIs:** wells analysed, total NPT (hours and rig-days), **projected NPT saving on NWS-12 if alerts are acted on**, highest-risk formation (Barail), active alerts.
- **NPT by cause:** where rig time was lost (mud loss, stuck pipe, kicks, fishing…).
- **Events by formation:** stacked by problem type. The Barail stands out.
- **Problems by depth band:** a heat strip of which problems cluster at which depths.
- **Learning curve:** average NPT per well by spud year ("is the field getting better?").
- **Wells with the most difficult history:** review these before planning new wells nearby.
- Scope switch: *whole field* or *within X km of the active well*.

**What to say:** *"The same knowledge that warns the driller also helps the office plan the next well and show management where NPT comes from."*

**Covers:** R7, R5.

---

## 5. The AI/ML behind it (for technical judges)

### The risk model (explainable by design)
1. **Formation-relative depth alignment:** every depth in the active well is expressed as *which formation, and how far through it*, then mapped to the equivalent depth in each offset well. This is why we compare the Barail top with the Barail top, not 2,900 m with 2,900 m.
2. **Evidence gathering:** offset-well events near that equivalent depth (±70 m).
3. **Weighting:** closer wells count more (distance decay, ~3.5 km scale) and severe events count more.
4. **Combination:** probabilities are combined across wells (noisy-OR: *p = 1 − Π(1 − wᵢ)*).
5. **Look-ahead:** scans the next 200 m every 10 m of drilling and raises an alert when risk ≥ 40%, once per hazard zone.
6. **Real-time signal checks** on the live stream: torque vs moving baseline, flow-out vs flow-in, pit gain.

**Key selling point:** *every percentage links to the exact offset wells and reports behind it.* Engineers trust what they can verify.

### What is real vs. demo (be honest if asked)
| Demo today | Production plan |
|---|---|
| 20 synthetic wells, 49 events (labelled "synthetic") | OIL's WCRs, DDRs, mud-log databases, eRTMAC streams |
| Replay of a generated eRTMAC-style stream | Live eRTMAC feed (WITSML / OPC-UA / REST integration) |
| Pre-staged OCR/NLP animation on sample pages | OCR (e.g. Tesseract / PaddleOCR) + fine-tuned NER for drilling entities + human review queue |
| Local retrieval engine for Ask NWIS | LLM with retrieval (RAG) over the same index, with citations enforced |
| Explainable statistical risk model | Same model as the baseline, plus ML (e.g. gradient boosting) trained on historical parameters and events, with real-time anomaly detection on eRTMAC channels |
| Runs fully in the browser | Server + spatial database (e.g. PostGIS) + document store, deployed on OIL's network |

### Tech stack (demo)
Next.js 16 (React 19, App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · MapLibre GL + deck.gl (3D map) · Recharts + custom SVG (depth tracks) · Motion (animations) · Zustand (state). All data is local.

---

## 6. The 3-minute demo script

| Time | Screen | Do | Say |
|---|---|---|---|
| 0:00–0:20 | **Overview** | Point at the active-well card and Next Risk | 30-second pitch (Section 1) |
| 0:20–0:50 | **Map** | Drag the radius 5 → 2 → 5 km, click **NWS-07** | "User-defined radius; every well is a clickable history." |
| 0:50–1:10 | **Document AI** | Run extraction on the DDR, click **View** | "Old scans become searchable records with a link to the page." |
| 1:10–1:50 | **Live Drilling** | Skip to next risk → Start → alert pops → **Show offset wells on map** → back → **Apply** | "160 m before the problem: what, where, how likely, what worked before." |
| 1:50–2:20 | **Correlation** | Toggle MD ↔ formation, point at *Patterns found* | "Aligned by geology, everyone lost mud just below the Barail top." |
| 2:20–2:45 | **Ask NWIS** | Ask about the Barail, click a citation | "Plain-language answers, every statement cited." |
| 2:45–3:00 | **Dashboard** → toggle **Field** + **हिंदी** | Show the projected NPT saving, flip to Field mode and Hindi | "Office plans, field acts, in their language. NWIS turns scattered reports into proactive decisions." |

**Backup:** if anything goes wrong, click **Guided demo** in the top bar and let it drive.

---

## 7. Likely judge questions and answers

**Q: Isn't this just a dashboard on top of eRTMAC?**
A: No. eRTMAC shows the active well *now*. NWIS adds the *past* of *nearby* wells: extracted from reports, correlated by formation, and turned into look-ahead alerts. It is a standalone decision-support layer, exactly as the PS asks.

**Q: How do you handle formations at different depths in different wells?**
A: Formation-relative alignment. We compare the same rock, not the same number. You can see it in the correlation view by toggling between measured depth and formation alignment.

**Q: How accurate are the predictions?**
A: In the demo the model is statistical and fully explainable. With OIL's historical data we would validate it with leave-one-well-out testing: hide a drilled well, predict its problems from its offsets, and measure hits and false alarms. The baseline stays for explainability, and ML is added on top.

**Q: What if the OCR reads something wrong?**
A: Every field carries a confidence score. Anything below the threshold goes to a human review queue before it can drive an alert, and every record links back to its source page.

**Q: Won't engineers ignore alerts (alert fatigue)?**
A: Alerts fire once per hazard zone, only above a probability threshold, always with evidence and a concrete recommendation. Acknowledged and applied alerts are tracked, which also helps measure value.

**Q: Why should field staff use it?**
A: It is glanceable (current depth and next risk always visible), has a big-text Field mode for tablets and Hindi labels, and answers "what happened here before?" in seconds instead of hours.

**Q: Is the data real?**
A: No. It is synthetic data modelled on the public Upper Assam stratigraphy (Girujan, Tipam, Barail, Kopili, Sylhet), clearly labelled on every page. The architecture is built to take OIL's real WCRs, DDRs and eRTMAC streams.

**Q: What's the impact?**
A: Less NPT from anticipated problems (losses, stuck pipe, kicks), faster decisions, and knowledge that stays when experienced people move on. The dashboard shows a projected NPT saving for the active well when alerts are acted on.

---

## 8. Glossary (in case a term comes up)

| Term | Meaning |
|---|---|
| **eRTMAC** | OIL's real-time drilling and mud-logging monitoring system |
| **Offset well** | A previously drilled well near the active one, used as a reference |
| **WCR / DDR** | Well Completion Report / Daily Drilling Report |
| **NPT** | Non-Productive Time: rig time lost to problems |
| **Mud loss** | Drilling fluid escaping into the formation; cured with **LCM** (Lost Circulation Material) |
| **Kick** | Unwanted influx of formation fluid; signalled by **pit gain** |
| **Stuck pipe** | Drill string can't move; often preceded by **torque spikes** and overpull |
| **Fishing** | Recovering equipment left or stuck in the hole |
| **MW / ECD** | Mud weight / Equivalent Circulating Density |
| **ROP, WOB, RPM, SPP** | Rate of penetration, weight on bit, rotary speed, standpipe pressure |
| **MD** | Measured depth (along the hole) |
| **Formation top** | The depth where a rock formation begins in a given well |

---

## 9. Pre-demo checklist

- [ ] In the `nwis` folder: `npm run build`, then `npm run start` (faster and smoother than dev mode). Open http://localhost:3000.
- [ ] Internet on (map tiles). If it's offline, the map falls back to a plain background and wells still show.
- [ ] On Live Drilling, press **Reset** so the replay starts from 2,650 m.
- [ ] To replay the cinematic map intro, use the **Replay intro** link at the bottom-right of the map.
- [ ] Start in **Office** mode and **English**; switch to Field / Hindi at the end as the closer.
- [ ] Browser zoom 100%, full screen (F11), notifications off.
