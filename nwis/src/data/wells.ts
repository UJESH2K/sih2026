import { FORMATIONS, FORMATION_BY_ID } from "./formations";
import type {
  CasingString,
  DrillingEvent,
  EventType,
  FormationTop,
  MudInterval,
  Severity,
  Well,
  WellDocument,
  WellStatus,
} from "./types";

/* ------------------------------------------------------------------ */
/* Field definition — a fictional block near Duliajan, Upper Assam.     */
/* All wells, depths and events are SYNTHETIC demonstration data.       */
/* ------------------------------------------------------------------ */

export const FIELD = {
  name: "Duliajan-East Block",
  nameHi: "दुलियाजान-पूर्व ब्लॉक",
  center: { lat: 27.37, lng: 95.33 },
  basin: "Upper Assam Shelf",
};

export const ACTIVE_WELL_ID = "NWS-12";

// deterministic pseudo-random helpers ---------------------------------
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
const pick = <T,>(arr: T[], key: string) => arr[Math.floor(hash(key) * arr.length) % arr.length];
const addDays = (iso: string, d: number) => {
  const dt = new Date(iso + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + Math.round(d));
  return dt.toISOString().slice(0, 10);
};

// Structural shift (m) — formations deepen to the NW, rise to the SE.
function structuralShift(lat: number, lng: number) {
  return Math.round((lat - FIELD.center.lat) * 3200 - (lng - FIELD.center.lng) * 2100);
}

function buildTops(id: string, lat: number, lng: number): FormationTop[] {
  const shift = structuralShift(lat, lng);
  return FORMATIONS.map((f, i) => ({
    id: f.id,
    top_m: i === 0 ? 0 : Math.round(f.baseTop_m + shift * (0.4 + i * 0.1) + (hash(id + f.id) - 0.5) * 36),
  }));
}

export function topOf(well: Pick<Well, "formation_tops">, formationId: string) {
  return well.formation_tops.find((t) => t.id === formationId)?.top_m ?? 0;
}

// Raw well table ---------------------------------------------------------
interface RawWell {
  id: string;
  lat: number;
  lng: number;
  status: WellStatus;
  spud: string | null;
  td: number;
  purpose?: Well["purpose"];
  profile?: Well["profile"];
  az?: number;
  dep?: number;
  result: string;
  rig: string;
  // compact events: [type, formation, metres below top, severity, NPT h]
  ev: [EventType, string, number, Severity, number][];
  /** hand-written overrides so key stories stay consistent across pages */
  over?: Record<number, { details?: string; action?: string }>;
}

const RAW: RawWell[] = [
  {
    id: "NWS-01", lat: 27.402, lng: 95.298, status: "producing", spud: "2008-11-04", td: 3720, rig: "E-1400 #2",
    result: "Oil producer — Barail sands",
    ev: [["bit_balling", "girujan", 180, 1, 6], ["mud_loss", "tipam", 420, 2, 11], ["tight_hole", "barail", 240, 1, 5]],
  },
  {
    id: "NWS-02", lat: 27.388, lng: 95.352, status: "producing", spud: "2009-06-18", td: 3810, rig: "E-1400 #2",
    result: "Oil producer — Barail & Kopili sands",
    ev: [["mud_loss", "barail", 25, 2, 12], ["kick", "kopili", 70, 2, 16], ["torque_spike", "kopili", 160, 1, 3]],
  },
  {
    id: "NWS-03", lat: 27.356, lng: 95.305, status: "abandoned", spud: "2010-02-02", td: 3350, rig: "Cardwell #5",
    result: "Plugged & abandoned after fishing failure",
    ev: [["mud_loss", "tipam", 610, 1, 4], ["wellbore_instability", "barail", 190, 3, 22], ["stuck_pipe", "barail", 230, 3, 58], ["fishing", "barail", 230, 3, 96]],
    over: { 2: { action: "Jarred down 38 times and spotted pipe-lax pill — unsuccessful; backed off above BHA." } },
  },
  {
    id: "NWS-04", lat: 27.381, lng: 95.318, status: "producing", spud: "2012-09-10", td: 3900, profile: "Deviated (J)", az: 40, dep: 620, rig: "E-2000 #1",
    result: "Oil producer — Barail main sand",
    ev: [["cement_issue", "barail", -40, 2, 9], ["mud_loss", "barail", 30, 3, 14], ["kick", "kopili", 95, 2, 10]],
  },
  {
    id: "NWS-05", lat: 27.343, lng: 95.347, status: "producing", spud: "2013-04-22", td: 3780, rig: "E-1400 #2",
    result: "Gas-condensate producer",
    ev: [["bit_balling", "girujan", 320, 1, 5], ["mud_loss", "barail", 18, 2, 9], ["kick", "kopili", 45, 3, 20]],
  },
  {
    id: "NWS-06", lat: 27.415, lng: 95.34, status: "suspended", spud: "2014-01-15", td: 3620, rig: "Cardwell #5",
    result: "Suspended — low productivity",
    ev: [["mud_loss", "tipam", 380, 3, 26], ["tight_hole", "barail", 310, 1, 4]],
  },
  {
    id: "NWS-07", lat: 27.362, lng: 95.343, status: "producing", spud: "2015-03-11", td: 3960, profile: "Deviated (J)", az: 115, dep: 540, rig: "E-2000 #1",
    result: "Oil producer — Barail & Sylhet",
    ev: [["mud_loss", "barail", 20, 3, 14], ["stuck_pipe", "barail", 215, 3, 31], ["torque_spike", "barail", 200, 2, 4], ["torque_spike", "sylhet", 60, 1, 2]],
    over: {
      0: { details: "Partial losses — 180 bbl lost at 18 bbl/hr while drilling ahead.", action: "Pumped 40 bbl LCM pill (CaCO₃ F/M + fibre), reduced MW 1.26 → 1.22 sg, cut flow rate 10%." },
      1: { action: "Jarred 22 times, spotted pipe-lax pill; freed after 26 h, then reamed the interval." },
    },
  },
  {
    id: "NWS-08", lat: 27.33, lng: 95.318, status: "producing", spud: "2016-05-30", td: 3680, rig: "E-1400 #2",
    result: "Oil producer — Tipam & Barail",
    ev: [["mud_loss", "tipam", 520, 2, 10], ["tight_hole", "girujan", 400, 1, 3]],
  },
  {
    id: "NWS-09", lat: 27.377, lng: 95.308, status: "producing", spud: "2017-01-08", td: 3880, rig: "E-2000 #1",
    result: "Oil producer — Barail main sand",
    ev: [["bit_balling", "girujan", 250, 1, 4], ["cement_issue", "barail", -35, 1, 6], ["mud_loss", "barail", 40, 2, 8], ["tight_hole", "barail", 260, 2, 7]],
  },
  {
    id: "NWS-10", lat: 27.395, lng: 95.372, status: "abandoned", spud: "2017-08-19", td: 2950, rig: "Cardwell #5",
    result: "Abandoned after well-control incident",
    ev: [["mud_loss", "tipam", 300, 1, 3], ["kick", "barail", 50, 3, 72]],
  },
  {
    id: "NWS-11", lat: 27.35, lng: 95.37, status: "producing", spud: "2018-02-26", td: 3740, rig: "E-1400 #2",
    result: "Oil producer — Barail",
    ev: [["bit_balling", "girujan", 210, 2, 8], ["stuck_pipe", "barail", 280, 2, 18], ["kick", "kopili", 110, 1, 5]],
  },
  {
    id: "NWS-12", lat: 27.37, lng: 95.33, status: "drilling", spud: "2026-08-02", td: 3950, rig: "E-2000 #1",
    result: "Drilling — 8½\" section",
    ev: [["bit_balling", "girujan", 260, 1, 3]],
  },
  {
    id: "NWS-13", lat: 27.42, lng: 95.31, status: "producing", spud: "2019-07-14", td: 3700, rig: "Cardwell #5",
    result: "Oil producer — Barail",
    ev: [["cement_issue", "barail", -50, 2, 12], ["stuck_pipe", "barail", 250, 2, 21], ["fishing", "barail", 250, 2, 30]],
  },
  {
    id: "NWS-14", lat: 27.325, lng: 95.29, status: "suspended", spud: "2020-10-05", td: 3590, rig: "E-1400 #2",
    result: "Suspended — awaiting workover",
    ev: [["mud_loss", "tipam", 460, 2, 13], ["tight_hole", "barail", 180, 1, 4]],
  },
  {
    id: "NWS-15", lat: 27.359, lng: 95.323, status: "producing", spud: "2021-03-03", td: 3920, profile: "S-shape", az: 210, dep: 380, rig: "E-2000 #1",
    result: "Oil producer — Barail & Kopili",
    ev: [["mud_loss", "barail", 35, 3, 16], ["stuck_pipe", "barail", 240, 2, 14], ["kick", "kopili", 80, 2, 9]],
  },
  {
    id: "NWS-16", lat: 27.385, lng: 95.335, status: "producing", spud: "2022-06-21", td: 3890, rig: "E-2000 #1",
    result: "Oil producer — Barail",
    ev: [["mud_loss", "barail", 28, 2, 7], ["torque_spike", "kopili", 130, 2, 5], ["kick", "kopili", 60, 2, 8]],
  },
  {
    id: "NWS-17", lat: 27.34, lng: 95.395, status: "producing", spud: "2023-01-12", td: 3760, rig: "Cardwell #5",
    result: "Oil producer — Tipam",
    ev: [["mud_loss", "tipam", 350, 2, 9], ["bit_balling", "girujan", 150, 1, 3]],
  },
  {
    id: "NWS-18", lat: 27.43, lng: 95.365, status: "producing", spud: "2024-04-09", td: 3810, rig: "E-1400 #2",
    result: "Oil producer — Barail",
    ev: [["bit_balling", "girujan", 190, 1, 4], ["torque_spike", "sylhet", 40, 1, 2]],
  },
  {
    id: "NWS-19", lat: 27.392, lng: 95.32, status: "planned", spud: null, td: 3900, rig: "—",
    result: "Planned development well (Q1 2027)", ev: [],
  },
  {
    id: "NWS-20", lat: 27.352, lng: 95.338, status: "planned", spud: null, td: 3880, rig: "—",
    result: "Planned appraisal well (Q2 2027)", purpose: "Appraisal", ev: [],
  },
];

// Text templates -----------------------------------------------------------
const TITLES: Record<EventType, string> = {
  mud_loss: "Mud loss",
  kick: "Kick / influx",
  stuck_pipe: "Stuck pipe",
  tight_hole: "Tight hole / overpull",
  torque_spike: "Torque spike",
  cement_issue: "Cementing issue",
  fishing: "Fishing operation",
  bit_balling: "Bit balling",
  wellbore_instability: "Wellbore instability",
};

function eventText(type: EventType, sev: Severity, key: string, mw: number, fm: string) {
  const bbl = [40, 120, 260][sev - 1] + Math.round(hash(key) * 60);
  switch (type) {
    case "mud_loss":
      return {
        details: `${sev === 3 ? "Total" : sev === 2 ? "Partial" : "Seepage"} losses — ${bbl} bbl lost at ${Math.round(8 + hash(key + "r") * 12)} bbl/hr while drilling ahead.`,
        action: pick(
          [
            `Pumped 40 bbl LCM pill (CaCO₃ fine/medium + fibre), reduced MW ${(mw + 0.04).toFixed(2)} → ${mw.toFixed(2)} sg, cut flow rate 10%.`,
            `Spotted 50 ppb LCM pill, pulled to shoe, waited 4 h; MW trimmed to ${mw.toFixed(2)} sg. Returns regained.`,
            `Pre-treated active system with 15 ppb sized CaCO₃; reduced ROP to 10 m/h through the zone.`,
          ],
          key,
        ),
        lesson:
          fm === "barail"
            ? "Pre-treat with sized LCM ~50 m above the Barail top and keep MW ≤ 1.22 sg / ECD below 1.30 sg."
            : fm === "tipam"
              ? "Tipam sands are highly permeable — keep LCM on standby and control ROP/ECD while drilling them."
              : "Monitor returns closely and keep LCM ready through fractured intervals.",
      };
    case "kick":
      return {
        details: `Pit gain of ${[6, 12, 22][sev - 1]} bbl with flow check positive; SIDPP ${[120, 260, 480][sev - 1]} psi.`,
        action: `Shut in (hard shut-in), circulated out by Driller's method; MW raised ${mw.toFixed(2)} → ${(mw + 0.08).toFixed(2)} sg.`,
        lesson:
          fm === "kopili"
            ? "Raise MW before the Kopili top; monitor pit volume and connection gas closely in the first 150 m."
            : "Unexpected pressured sand — take flow checks after drilling breaks and keep kick tolerance updated.",
      };
    case "stuck_pipe":
      return {
        details: `Pipe stuck while ${pick(["making connection", "tripping out", "back-reaming"], key)}; unable to rotate, ${[20, 45, 70][sev - 1]} t overpull.`,
        action: pick(
          [
            "Jarred down 38 times, spotted pipe-lax pill, freed after 9 h.",
            "Worked pipe with max overpull, spotted acid pill; freed after 14 h.",
            "Jarring unsuccessful — backed off above BHA; fishing job initiated.",
          ],
          key,
        ),
        lesson: "Keep pipe moving in coal seams; minimise static time at connections; wiper trip every 150 m.",
      };
    case "tight_hole":
      return {
        details: `Overpull ${[15, 25, 40][sev - 1]} t on trip out; drag above trend by ${[20, 35, 55][sev - 1]}%.`,
        action: "Back-reamed through interval, increased MW 0.02 sg and added shale inhibitor.",
        lesson: "Schedule reaming passes through reactive shale; watch drag trend on every stand.",
      };
    case "torque_spike":
      return {
        details: `Erratic surface torque — spikes to ${[22, 28, 34][sev - 1]} kN·m (baseline 14 kN·m); stick-slip observed.`,
        action: "Reduced WOB, adjusted RPM 120 → 90; added 2% lubricant.",
        lesson: "Torque spikes here preceded stuck pipe in offset wells — treat as an early warning.",
      };
    case "cement_issue":
      return {
        details: `CBL showed ${sev === 1 ? "patchy" : "poor"} bond above the 9⅝\" shoe; TOC ${[120, 260, 400][sev - 1]} m below plan.`,
        action: "Performed squeeze job; re-logged CBL/VDL, bond acceptable.",
        lesson: "Condition mud (YP < 15) and use spacer train before cementing the 9⅝\" string.",
      };
    case "fishing":
      return {
        details: `Fishing for left-in-hole BHA (${pick(["jar + DC", "motor + MWD", "bit + stabiliser"], key)}).`,
        action: sev === 3 ? "3 fishing runs failed; hole plugged back and sidetrack considered." : "Recovered fish with overshot on 2nd run.",
        lesson: "Early decision-point: after 24 h of unsuccessful jarring, evaluate sidetrack economics.",
      };
    case "bit_balling":
      return {
        details: `ROP fell from ${[22, 25, 28][sev - 1]} to ${[8, 6, 4][sev - 1]} m/h in sticky clay; SPP rose 150 psi.`,
        action: "Pumped detergent sweep, increased flow rate, switched to KCl-polymer mud.",
        lesson: "Use KCl-polymer mud and anti-balling additive before entering Girujan clay.",
      };
    case "wellbore_instability":
      return {
        details: `Cavings on shakers (splintery shale + coal), hole fill ${[3, 8, 15][sev - 1]} m after trip.`,
        action: "Raised MW 0.04 sg, added asphaltic inhibitor, performed hole-cleaning sweeps.",
        lesson: "Barail coal/shale is time-sensitive — minimise open-hole exposure time.",
      };
  }
}

// Build a mud program from tops
function buildMud(tops: FormationTop[], td: number): MudInterval[] {
  const g = tops.find((t) => t.id === "girujan")!.top_m;
  const b = tops.find((t) => t.id === "barail")!.top_m;
  const k = tops.find((t) => t.id === "kopili")!.top_m;
  const out: MudInterval[] = [
    { from_m: 0, to_m: g - 60, mw_sg: 1.08, type: "WBM" },
    { from_m: g - 60, to_m: b - 40, mw_sg: 1.16, type: "KCl-Polymer" },
    { from_m: b - 40, to_m: Math.min(k, td), mw_sg: 1.22, type: "KCl-Polymer" },
  ];
  if (td > k) out.push({ from_m: k, to_m: td, mw_sg: 1.32, type: "KCl-Polymer" });
  return out;
}

function mwAt(mud: MudInterval[], d: number) {
  return (mud.find((m) => d >= m.from_m && d <= m.to_m) ?? mud[mud.length - 1]).mw_sg;
}

function buildCasing(tops: FormationTop[], td: number, spud: string | null, key: string): CasingString[] {
  const g = tops.find((t) => t.id === "girujan")!.top_m;
  const b = tops.find((t) => t.id === "barail")!.top_m;
  const s = spud ?? "2027-01-01";
  const good = (k: string): CasingString["cement_result"] => (hash(key + k) > 0.8 ? "partial" : "good");
  const out: CasingString[] = [
    { name: "Conductor", size_in: 20, size_label: "20\"", shoe_m: 60, toc_m: 0, cement_result: "good", set_date: addDays(s, 1) },
    { name: "Surface", size_in: 13.375, size_label: "13⅜\"", shoe_m: g - 60, toc_m: 0, cement_result: good("s"), set_date: addDays(s, 9) },
  ];
  if (td > b - 40)
    out.push({ name: "Intermediate", size_in: 9.625, size_label: "9⅝\"", shoe_m: b - 40, toc_m: g - 260, cement_result: good("i"), set_date: addDays(s, 27) });
  if (td > b + 100)
    out.push({ name: "Production liner", size_in: 7, size_label: "7\"", shoe_m: td, toc_m: b - 140, cement_result: good("p"), set_date: addDays(s, 44) });
  return out;
}

function buildDocs(w: RawWell, events: DrillingEvent[]): WellDocument[] {
  if (!w.spud) return [];
  const days = Math.round(w.td / 85);
  const docs: WellDocument[] = [
    { id: `${w.id}-WCR`, wellId: w.id, kind: "WCR", title: `Well Completion Report — ${w.id}`, pages: 60 + Math.round(hash(w.id) * 80), date: addDays(w.spud, days + 20), status: w.status === "drilling" ? "queued" : "extracted", fields: 180 + Math.round(hash(w.id + "f") * 90), scanned: w.spud < "2015" },
    { id: `${w.id}-DDR`, wellId: w.id, kind: "DDR", title: `Daily Drilling Reports (Day 1–${days}) — ${w.id}`, pages: days * 3, date: addDays(w.spud, days), status: "extracted", fields: days * 14, scanned: w.spud < "2012" },
    { id: `${w.id}-MUD`, wellId: w.id, kind: "Mud Log", title: `Mud Logging Report — ${w.id}`, pages: 24 + Math.round(hash(w.id + "m") * 20), date: addDays(w.spud, days + 5), status: w.status === "drilling" ? "processing" : "extracted", fields: 95, scanned: false },
    { id: `${w.id}-CEM`, wellId: w.id, kind: "Cement Report", title: `Cementing Job Reports — ${w.id}`, pages: 12, date: addDays(w.spud, 30), status: "extracted", fields: 44, scanned: w.spud < "2014" },
    { id: `${w.id}-SRV`, wellId: w.id, kind: "Survey", title: `Directional Survey — ${w.id}`, pages: 8, date: addDays(w.spud, days), status: "extracted", fields: 120, scanned: false },
  ];
  void events;
  return docs;
}

function buildWell(w: RawWell): Well {
  const tops = buildTops(w.id, w.lat, w.lng);
  const mud = buildMud(tops, w.td);
  const events: DrillingEvent[] = w.ev.map(([type, fm, off, sev, npt], i) => {
    const depth = Math.round(topOf({ formation_tops: tops }, fm) + off);
    const key = `${w.id}-${i}`;
    const day = Math.max(2, Math.round(depth / 85 + hash(key) * 3));
    const txt = { ...eventText(type, sev, key, mwAt(mud, depth), fm), ...w.over?.[i] };
    const isDDR = type !== "cement_issue";
    const docId = `${w.id}-${isDDR ? "DDR" : "CEM"}`;
    return {
      id: `${w.id}-E${i + 1}`,
      wellId: w.id,
      type,
      depth_m: depth,
      formation: FORMATION_BY_ID[fm].name,
      date: addDays(w.spud ?? "2026-01-01", day),
      day,
      severity: sev,
      npt_hours: npt,
      title: TITLES[type],
      ...txt,
      source: {
        doc: isDDR ? `DDR Day ${day}` : "Cement Job Report",
        page: isDDR ? 1 + Math.round(hash(key + "p") * 2) : 3 + i,
        docId,
      },
      confidence: 0.86 + hash(key + "c") * 0.13,
    };
  });
  const npt = events.reduce((s, e) => s + e.npt_hours, 0);
  const riskRaw = events.reduce((s, e) => s + e.severity * (1 + e.npt_hours / 20), 0);
  const days = w.spud ? Math.round(w.td / 85 + npt / 24) : 0;
  return {
    id: w.id,
    name: w.id,
    lat: w.lat,
    lng: w.lng,
    status: w.status,
    purpose: w.purpose ?? (w.id === "NWS-01" ? "Exploratory" : "Development"),
    profile: w.profile ?? "Vertical",
    azimuth_deg: w.az ?? 0,
    departure_m: w.dep ?? 0,
    spud_date: w.spud,
    completion_date: w.spud && w.status !== "drilling" ? addDays(w.spud, days) : null,
    total_depth_m: w.td,
    planned_depth_m: w.td,
    rig: w.rig,
    target: "Barail main sand",
    result: w.result,
    formation_tops: tops,
    casing: buildCasing(tops, w.td, w.spud, w.id),
    mud_program: mud,
    events,
    documents: buildDocs(w, events),
    risk_score: Math.min(0.97, riskRaw / 16),
    npt_total_h: npt,
    days_on_well: days,
  };
}

export const WELLS: Well[] = RAW.map(buildWell);
export const WELL_BY_ID: Record<string, Well> = Object.fromEntries(WELLS.map((w) => [w.id, w]));
export const ACTIVE_WELL = WELL_BY_ID[ACTIVE_WELL_ID];
export const ALL_EVENTS: DrillingEvent[] = WELLS.flatMap((w) => w.events);
export const ALL_DOCS: WellDocument[] = WELLS.flatMap((w) => w.documents);

export { mwAt };
