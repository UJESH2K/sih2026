# NWIS: Demo Video Script (≈ 9 minutes)
**SIH 2026 · PS 26121 · Oil India Limited · Theme: Smart Automation**

**Format:** you on camera with the PPT ⇄ screen recording of the website.
- 🎥 **CAMERA + PPT**: you talking, slide on screen.
- 🖥️ **WEBSITE**: screen recording. Click **Guided demo** (top bar) and use **Next** to move between steps. You can still click things on the page while the guide is open.

**Before recording:** open the website, press **Reset** on Live Drilling, go back to **Overview**, Office mode, English, browser full-screen.

Speaking pace ≈ 130 words/min. Timings are targets, not rules.

---

## 0:00–0:40 · Opening 🎥 CAMERA + PPT
**Slide 1: title (NWIS logo, PS 26121, team name)**

> "Hello everyone. We are Team ______, and this is our solution to Smart India Hackathon 2026 problem statement 26121, given by **Oil India Limited**: **eRTMAC-NWIS, the Nearby Wells Intelligence System**.
>
> In one line: **NWIS gives a drilling engineer the memory of every nearby well, and warns them before they reach the depth where those wells had trouble.**"

---

## 0:40–2:00 · The problem 🎥 CAMERA + PPT
**Slide 2: "The knowledge exists, but it is buried"** (icons: PDFs, scans, people)

> "Oil India already has **eRTMAC**, a real-time system that streams drilling and mud-logging data from the rig. But real-time data only shows the **well being drilled right now**.
>
> Drilling in Upper Assam is hard: formations like the **Barail** and **Kopili** cause **mud losses, stuck pipe and kicks**. The wells drilled nearby have already faced these problems, and the lessons exist, but they're buried in hundreds of **Well Completion Reports, Daily Drilling Reports, old scanned PDFs**, and in the memory of a few senior engineers."

**Slide 3: "What it costs"** (four missing capabilities from the PS)

> "So today there is no single place to:
> **one**, see nearby wells on a map;
> **two**, instantly find what happened in those wells;
> **three**, compare them by depth and formation;
> **four**, get a warning *before* reaching a known trouble zone.
>
> Engineers spend hours searching reports, and problems that could have been anticipated become **Non-Productive Time**, the most expensive hours on a rig."

---

## 2:00–2:40 · Our solution 🎥 CAMERA + PPT
**Slide 4: "NWIS: how it works"** (4 steps: Read → Remember → Correlate → Alert)

> "NWIS is a **standalone decision-support platform that works alongside eRTMAC**. It does four things:
> **Read**: AI with OCR and NLP extracts depths, problems, actions and lost time from old reports.
> **Remember**: all of it becomes one searchable knowledge base, with every record linked to its source page.
> **Correlate**: nearby wells are compared by **geological formation**, not just raw depth.
> **Alert**: while drilling, NWIS looks ahead of the bit and warns early, with what worked before.
>
> Let me show you."

---

## 2:40–7:20 · Live demo 🖥️ WEBSITE
*(Click **Guided demo**. Each block below is one guide step. Talk, do the small action, then press **Next**.)*

### Step 1 · Overview (≈ 30 s)
> "This is the home screen. At a glance: our active well **NWS-12** is at **2,650 metres in the Tipam Sandstone**. On the right is the **next risk ahead**: mud loss, high probability, at the **Barail top**, and **7 of 12 nearby wells had this problem there**. It gives a recommendation and **what worked before** in a named well. Below, this strip shows predicted risk along the rest of the well."

### Steps 2–3 · Nearby Wells Map (≈ 50 s)
*(Drag the radius slider from 5 km down to 2 km and back. Then click a green column, e.g. NWS-07.)*
> "This is the map around our rig. Each well is a 3D column: **height is its depth, colour is its status**. The problem statement asks for a **user-defined radius**, so we can drag it and wells inside light up. The list shows each well's **distance and direction**.
> If I click **NWS-07**, its whole history opens: depth strip, problems, casing, mud and documents."

### Steps 4–5 · Live Drilling: the key moment (≈ 1 min 20 s)
*(The guide starts the replay. Click **Skip to next risk**. Wait for the red alert.)*
> "This is NWIS running next to eRTMAC. We're replaying a drilling data stream. Above the blue line is what we've drilled; the **grey zone below is the next 200 metres**, where NWIS shows predicted risk from nearby wells.
>
> *(alert pops)* Here's the alert, about **160 metres before** the problem: **Mud loss risk, high**. It tells the engineer **what, where, how likely**, and **what worked before**: a sized LCM pill in the neighbouring well.
>
> *(click **Show offset wells on map**, then come back)* One click shows the evidence wells on the map.
>
> *(click **Apply recommendation**)* The engineer stays in control. When the recommendation is applied, the replay drills through the zone with only minor losses. NWIS also watches live signals: a **torque spike** that looks like the one before stuck pipe in NWS-07, or a **pit gain** that signals a kick."

### Step 6 · Offset Correlation (≈ 35 s)
*(Toggle **Measured depth** → **Align by formation**.)*
> "Here nearby wells sit side by side. Formations are at different depths in each well, so we **align them by formation**, and now the pattern is obvious: **every well lost mud just below the Barail top**. NWIS finds these patterns automatically, here on the right."

### Step 7 · Ask NWIS (≈ 30 s)
*(Click the suggestion "What problems did nearby wells face in the Barail formation?")*
> "Engineers can simply **ask in plain language**, even using Hindi terms. The answer lists every relevant incident, and **each line cites the exact report and page**. No guessing: every answer can be verified."

### Step 8 · Document AI (≈ 30 s)
*(Click **Run extraction**, then **View** at the end.)*
> "This is where the knowledge comes from. An old, skewed, scanned drilling report goes through **OCR, then NLP**, which tags depth, event, mud weight, action and lost time, and becomes a **structured record with confidence scores**. Low-confidence fields go to a human for review."

### Step 9 · Risk Dashboard (≈ 25 s)
*(Then click **Field** in the top bar, then **हिंदी**.)*
> "For the office and management: lost time by cause, the riskiest formation, and the **projected time saved** on this well if alerts are acted on.
> And for the rig site, one click gives **Field mode** with bigger, simpler screens, and one more gives a **Hindi** interface for field crews."

---

## 7:20–8:10 · Technology & feasibility 🎥 CAMERA + PPT
**Slide 5: architecture** (Reports → OCR/NLP → Knowledge base → Risk model ⇄ eRTMAC stream → Dashboard/Alerts)

> "How does the prediction work? For every depth ahead of the bit, NWIS finds the **same point in the same formation** in each nearby well, collects the problems recorded there, gives more weight to **closer wells and more severe events**, and combines them into a probability. It's **explainable by design**: every percentage links to the exact wells and reports behind it.
>
> The demo is built with **Next.js, React and TypeScript**, a 3D map using **MapLibre and deck.gl**, and runs on sample data modelled on Upper Assam geology. For deployment we plug in Oil India's real reports and the **live eRTMAC feed**, with production OCR, an NLP model for drilling terms, and a language model grounded in the same knowledge base."

---

## 8:10–8:50 · Impact & close 🎥 CAMERA + PPT
**Slide 6: impact** (less lost time · faster decisions · knowledge that stays)

> "The impact:
> **Less non-productive time**, because problems are prepared for instead of reacted to.
> **Faster decisions**: seconds instead of hours of reading reports.
> **Knowledge that stays** with Oil India when experienced people move on.
> And it works for **both the field and the office**.
>
> **NWIS turns scattered reports into proactive decisions.** Thank you."

---

### Recording tips
- Record website parts in one take with the guide. If a step goes wrong, press **Back** and redo it; cut in editing.
- Keep the mouse still while talking; move it only to click.
- If the alert is slow to appear on step 5, click **Skip to next risk** again.
- Say "demo data" once (it's synthetic) and move on; don't dwell on it.
