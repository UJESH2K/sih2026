# SIH 2026 — Problem Statement 26121

## eRTMAC-NWIS (Nearby Wells Intelligence System)
### An AI-Powered Offset Well Knowledge and Decision Support Platform for Drilling Operations

---

## 1. Portal Details

| Field | Value |
|---|---|
| **Problem Statement ID** | 26121 |
| **Title** | eRTMAC-NWIS (Nearby Wells Intelligence System): An AI-Powered Offset Well Knowledge and Decision Support Platform for Drilling Operations |
| **Organization** | Oil India Limited |
| **Department** | Oil India Limited |
| **Category** | Software |
| **Theme** | Smart Automation |
| **Hackathon** | Smart India Hackathon 2026 |

---

## 2. Description (from the SIH portal)

### 2.1 Background

Oil India Limited has a digital real-time monitoring system (**eRTMAC**) that provides real-time drilling data, mud logging information, and wellsite analytics across operational areas.

However, drilling decisions, particularly in geologically complex formations, require not only real-time data from the active well but also insights from **nearby and historical wells** drilled in the same reservoir or formation.

Historical drilling knowledge currently resides across numerous well completion reports, drilling reports, PDF documents, and individual experience, making retrieval time-consuming and dependent on individual experience and memory. This often results in delays in decision-making and missed opportunities to proactively mitigate drilling risks.

### 2.2 Problem Description

Currently, drilling teams do not have a unified platform that can:

1. Display nearby wells on a geospatial map relative to the active well.
2. Provide instant access to historical drilling experiences and operational events from offset wells.
3. Correlate drilling parameters, reservoir characteristics, mud losses, kicks, stuck pipe incidents, casing programs, cementing practices, and formation-specific risks across wells.
4. Generate proactive alerts when current drilling operations approach depths or formations where similar challenges were encountered in nearby wells.

As a result, engineers often spend significant time manually searching through historical reports and databases, limiting the ability to make fast, informed, and data-driven operational decisions.

### 2.3 Expected Outcome / Solution

Develop an AI/ML-enabled **Nearby Wells Intelligence System (NWIS)** that acts as a **standalone decision-support platform alongside eRTMAC** that has **institutional memory**.

The solution should:

1. Use **AI, NLP, OCR, and data analytics** to automatically extract and structure information from historical drilling reports and well documents.
2. Provide an **interactive map-based visualization** of nearby wells within a **user-defined radius**.
3. Create a **searchable knowledge repository** of drilling events, lessons learned, operational challenges, and mitigation measures.
4. **Correlate** geological, drilling, and reservoir data across wells based on **depth and formation**.
5. Develop **predictive analytics models** that can identify potential drilling risks such as mud losses, stuck pipe, overpressure zones, torque spikes, or cementing issues based on historical offset-well behaviour.
6. Generate **real-time alerts and recommendations** to assist drilling engineers in proactive decision-making.
7. Present information through a **user-friendly dashboard** for field and office-based personnel.

### 2.4 Relevant Data Availability

Potential data sources available within OIL may include:

1. Well Completion Reports (WCRs)
2. Daily Drilling Reports (DDRs)
3. Drilling and mud logging databases
4. Historical well parameters and drilling records
5. Reservoir and geological data
6. eRTMAC data streams
7. Well trajectory and survey data
8. Casing, cementing, and mud program records
9. Historical operational event records, including mud losses, kicks, stuck pipe incidents, fishing operations, and NPT events

---

## 3. Breaking Down the Problem (Team Notes)

### 3.1 The one-line version
> Give the drilling engineer the collective memory of every nearby well, and warn them *before* they hit the depth or formation where those wells had trouble.

### 3.2 Requirement checklist

| # | Requirement | Keyword to show in demo |
|---|---|---|
| R1 | Extract data from reports | AI / NLP / OCR |
| R2 | Map of nearby wells, user-defined radius | Geospatial, radius slider |
| R3 | Searchable knowledge repository | Events, lessons learned, mitigation |
| R4 | Cross-well correlation | Depth + formation alignment |
| R5 | Risk prediction | Losses, stuck pipe, overpressure, torque, cementing |
| R6 | Real-time alerts + recommendations | Proactive, not reactive |
| R7 | User-friendly dashboard | Field + office users |

### 3.3 Key users
- **Drilling engineer at the rig site:** needs fast, glanceable alerts and "what did offsets do here?"
- **Office-based drilling / geology team:** needs planning views, correlation, and a searchable history.
- **Management:** needs NPT reduction and a risk overview across fields.

### 3.4 Glossary

| Term | Meaning |
|---|---|
| **eRTMAC** | OIL's real-time monitoring system for drilling and mud-logging data |
| **Offset well** | A previously drilled well near the planned or active well, used as a reference |
| **WCR** | Well Completion Report: final summary of a drilled well |
| **DDR** | Daily Drilling Report: day-by-day log of operations and problems |
| **MD / TVD** | Measured Depth (along the hole) / True Vertical Depth |
| **Formation top** | The depth where a geological formation begins in a given well |
| **Mud loss** | Drilling fluid escaping into the formation |
| **Kick** | Unwanted influx of formation fluid into the wellbore; can lead to a blowout |
| **Stuck pipe** | Drill string cannot be moved; a major cause of lost time |
| **Fishing** | Recovering equipment lost or stuck in the hole |
| **NPT** | Non-Productive Time: rig time lost to problems |
| **ROP** | Rate of Penetration (drilling speed) |
| **MW** | Mud Weight |
| **SPP** | Standpipe Pressure |
| **LCM** | Lost Circulation Material, used to cure mud losses |
