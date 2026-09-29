# N.W.I.S.: Demo Video Script (≈ 9½ minutes)
**Team Perfect_SW_Atria · SIH 2026 · PS 26121 · Oil India Limited**
Follows the idea deck `Perfect_SW_Atria_SIH26121_Idea.pptx` (6 slides).

**Legend**
- 🎥 **CAMERA + SLIDE**: you on camera with the slide on screen.
- 🖥️ **WEBSITE**: screen recording. Use the **Guided demo** button (top bar) and **Next**. You can still click on the page while the guide card is open.

**Flow:** Slide 1 → Slide 2 → **website demo** → Slide 3 → Slide 4 → Slide 5 → Slide 6.
Slide 2 promises five ideas, the website **shows** them, and slides 3–5 explain **how, whether it's feasible, and why it matters**.

**Before recording:** website open on **Overview**, Live Drilling **Reset**, Office mode, English, full-screen browser.

---

## 1 · Slide 1: Title 🎥 (0:00–0:35)

> "Hello, we are **Team Perfect_SW_Atria**, and this is our solution to Smart India Hackathon 2026 problem statement **26121** from **Oil India Limited**: **N.W.I.S., the Nearby Wells Intelligence System.**
>
> Our tagline says it all: **offset-well memory that warns the driller before the bit gets there.**
>
> *(point at the graphic)* On the right you can see the idea in one picture: an active well going down through Tipam, Barail, Kopili and Sylhet, the offset wells beside it, and an alert, **mud loss likely 160 metres ahead.**"

---

## 2 · Slide 2: Problem & Idea 🎥 (0:35–1:50)

**The problem (left side):**
> "Why does this matter? **Lost circulation alone is 20 to 40 percent of drilling cost.** Oil India has drilled **over 3,000 wells**, and their lessons are locked in PDFs and scanned reports. And **eRTMAC**, Oil India's real-time system, shows only the active well, which means **zero metres of look-ahead** from the wells next door.
>
> So when a crew approaches the Barail, the question *'what happened to the wells around us at this depth?'* takes hours of reading, or depends on one senior engineer's memory."

**Our idea (01–05):**
> "N.W.I.S. does five things:
> **One**, it reads the archive. OCR and NLP turn old reports into events, each linked to its page.
> **Two**, it maps offset wells in 3D within a radius the user sets.
> **Three**, it compares wells **by rock, not depth**, lining them up by formation tops.
> **Four**, it **warns about 160 metres ahead of the bit**, with the fix that worked next door.
> **Five**, it's built for the rig: plain-language answers with citations, a Field mode, multiple languages, and it runs beside eRTMAC.
>
> These are real screens from our working prototype. Let me show you."

---

## 3 · Website demo 🖥️ (1:50–6:30)
*(Click **Guided demo**. Each block = one guide step: talk, do the small action, press **Next**.)*

### Step 1 · Overview (≈ 25 s)
> "This is the home screen. Our active well **NWS-12** is at **2,650 metres in the Tipam Sandstone**. On the right, the **next risk ahead**: mud loss, **79 percent**, at the Barail top, where **7 of 12 nearby wells had this problem**. It gives the recommendation and what worked before. The strip below shows risk along the rest of the well."

### Steps 2–3 · 3D Offset Map: *Idea 02* (≈ 45 s)
*(Drag the radius 5 km → 2 km → 5 km. Click a green column, e.g. **NWS-07**.)*
> "Idea two, the offset map. Each well is a 3D column: **height is depth, colour is status**. The problem statement asks for a **user-defined radius**, so I drag it and wells inside light up, with distance and direction in the list.
> Clicking **NWS-07** opens its full history: depth strip, problems, casing, mud and source documents."

### Steps 4–5 · Live look-ahead alert: *Idea 04* ⭐ (≈ 1 min 20 s)
*(The guide starts the replay. Click **Skip to next risk**. Wait for the red alert.)*
> "Idea four, the heart of N.W.I.S. We're replaying an eRTMAC-style data stream. Above the blue line is what we've drilled; the **grey zone is the next 200 metres**, and the right column shows risk predicted from offset wells.
>
> *(alert appears)* And here's the alert, about **160 metres before** the Barail: **mud loss risk, high.** It says **what, where, how likely**, and **what worked next door**: a sized LCM pill.
>
> *(click **Show offset wells on map**, then come back)* One click shows the evidence wells on the map.
>
> *(click **Apply recommendation**)* The engineer stays in control. When the fix is applied, the replay drills through the zone with only minor losses. It also watches live signals: a **torque spike** like the one before stuck pipe in NWS-07, or a **pit gain** that means a kick."

### Step 6 · Correlation by formation: *Idea 03* (≈ 35 s)
*(Toggle **Measured depth** → **Align by formation**.)*
> "Idea three, compare by rock, not depth. Formations sit at different depths in each well, so we align them by formation tops, and the pattern is instant: **every well lost mud just below the Barail top.** N.W.I.S. finds these patterns automatically, here on the right."

### Step 7 · Ask NWIS: *Idea 05* (≈ 30 s)
*(Click "What problems did nearby wells face in the Barail formation?", then click citation **[1]**.)*
> "Idea five, built for the rig. Engineers just **ask in plain language**. Every line of the answer **cites the exact report and page**, so nothing is made up and everything can be checked."

### Step 8 · Document AI: *Idea 01* (≈ 30 s)
*(Click **Run extraction**, then **View** at the end.)*
> "And idea one, where the memory comes from. An old, skewed scanned drilling report goes through **OCR, then entity extraction**: depth, formation, event, fix, lost time. It becomes a **structured record with confidence scores**. Anything unclear goes to an engineer for review."

### Step 9 · Dashboard + Field mode (≈ 25 s)
*(Then click **Field** in the top bar, then **हिंदी**.)*
> "For the office: lost time by cause, the riskiest formation, and **projected hours saved** on this well. And for the rig: one click for **Field mode**, with bigger, simpler screens, and one more for **Hindi**."

---

## 4 · Slide 3: Technical Approach 🎥 (6:30–7:35)

> "So how does it work? Five steps. **Ingest**: OCR with deskew reads scanned WCRs and DDRs, entity extraction pulls depth, formation, event, fix and NPT, and low-confidence fields go to an engineer. **Store**: wells in PostGIS, every event linked to its source page, with a vector index for questions. **Correlate**: each depth is read as a position inside its formation. **Predict**: an explainable baseline first, then **LightGBM** trained on Oil India's history, tested by hiding one well at a time. **Integrate**: a **read-only** WITSML or REST link to eRTMAC, running in Docker on Oil India's own network."

*(point at the flow chart at the bottom)*
> "And this is exactly the alert you just saw: **12 offset wells** within 5 km; **7** lost mud within 70 metres of the Barail top; closer wells and worse events count more; combined into **79 percent**; and the result is an alert **160 metres early**, once per zone, with the fix. Every percentage traces back to its evidence."

---

## 5 · Slide 4: Feasibility & Viability 🎥 (7:35–8:25)

> "Is it feasible? **It already runs**: the prototype works today, and every piece we use is open-source and proven. **The data exists**: Oil India already holds these reports and streams. **It fits their systems**: it only reads from eRTMAC and runs on their servers. And **the risks are handled**: unclear scans go to an engineer, and alerts fire once per zone, only above 40 percent.
>
> Business model: an **Oil India pilot field first**, then ONGC and other operators, with an annual licence per field and digitisation priced per page.
>
> Cost: at just **10 hours saved per well, it pays back within the first year**.
>
> Compared to Corva, SLB DrillPlan, eRTMAC alone or keyword search, N.W.I.S. is the only one that both **reads legacy scanned reports** and **warns ahead of trouble**."

---

## 6 · Slide 5: Impact & Benefits 🎥 (8:25–9:15)

> "What is one early warning worth? Follow a single alert:
> **At the rig**, 160 metres of warning, so the crew pre-treats the mud and well control stays calm.
> **For one well**, about **14 hours of NPT and 180 barrels of mud not lost**. That's the loss NWS-07 suffered, avoided next door.
> **For one field in one year**, about **₹53 lakh of rig time saved**.
> **For India**, we import **88.7 percent of our crude**, so faster wells mean domestic oil sooner, and drilling know-how stays in India as experts retire.
>
> Safety, economic, social and environmental benefits, aligned with **Atmanirbhar Bharat, Digital India and Viksit Bharat 2047**, and **SDGs 7, 8, 9 and 13**."

---

## 7 · Slide 6: References & Close 🎥 (9:15–9:40)

> "Our research, sources and the full code are on GitHub at **github.com/UJESH2K/sih2026**. The demo uses synthetic data modelled on public Upper Assam geology, ready for Oil India's real archive.
>
> **N.W.I.S. turns scattered reports into proactive decisions.** Thank you."

---

### Notes
- **Slide 6 says "3-minute walkthrough."** This script is about 9½ minutes. Either change the slide to "10-minute walkthrough", or for a 3-minute cut record only the website section (steps 1, 4–5, 6, 7) plus a single-line intro and close.
- On the Live step, the **79%** figure is in the **Look-ahead** panel on the right. The alert card can show a slightly lower number because it is raised earlier, 160 m ahead. Point at the look-ahead panel when you say the number.
- If the alert is slow, click **Skip to next risk** again.
- Fill in `[TEAM ID]`, `[AISHE CODE]` and `[INSTITUTE NAME]` on slide 1, and the YouTube link on slide 6 after uploading.
