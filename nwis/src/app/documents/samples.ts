import { WELL_BY_ID } from "@/data/wells";

export type Ent = "WELL" | "DATE" | "DEPTH" | "FORMATION" | "EVENT" | "VOLUME" | "RATE" | "MW" | "ACTION" | "NPT" | "CASING";

export const ENT_META: Record<Ent, { label: string; color: string }> = {
  WELL: { label: "Well", color: "#1F6FEB" },
  DATE: { label: "Date", color: "#6B7A8F" },
  DEPTH: { label: "Depth", color: "#0E8A7E" },
  FORMATION: { label: "Formation", color: "#8A6D1F" },
  EVENT: { label: "Event", color: "#D63B2F" },
  VOLUME: { label: "Volume", color: "#2F7FD8" },
  RATE: { label: "Rate", color: "#2F7FD8" },
  MW: { label: "Mud weight", color: "#8A4FD1" },
  ACTION: { label: "Action", color: "#2E8B57" },
  NPT: { label: "NPT", color: "#C27C0E" },
  CASING: { label: "Casing", color: "#5B6B80" },
};

export type Seg = string | { t: string; e: Ent; f?: string };
export interface SampleDoc {
  id: string;
  title: string;
  kind: string;
  year: string;
  quality: string;
  lines: Seg[][];
  record: { field: string; value: string; conf: number; ent: Ent }[];
  linksTo: { label: string; href: string };
}

const w7 = WELL_BY_ID["NWS-07"];
const loss = w7.events.find((e) => e.type === "mud_loss")!;
const w3 = WELL_BY_ID["NWS-03"];

export const SAMPLES: SampleDoc[] = [
  {
    id: "ddr",
    title: `DDR Day ${loss.day} — NWS-07`,
    kind: "Daily Drilling Report",
    year: loss.date.slice(0, 4),
    quality: "Scanned fax copy · 200 dpi · skewed 1.4°",
    lines: [
      [{ t: "DAILY DRILLING REPORT", e: "EVENT", f: "_title" }],
      ["Well: ", { t: "NWS-07", e: "WELL" }, "    Report No.: ", { t: String(loss.day), e: "DATE" }, "    Date: ", { t: loss.date.split("-").reverse().join("-"), e: "DATE" }],
      ["Rig: E-2000 #1    Hole size: 8½\"    Depth 06:00 hrs: ", { t: `${(loss.depth_m - 24).toLocaleString("en-IN")} m`, e: "DEPTH" }],
      ["—".repeat(46)],
      ["06:00–08:30  Drilled 8½\" hole from ", { t: `${loss.depth_m - 24} m`, e: "DEPTH" }, " to ", { t: `${loss.depth_m} m`, e: "DEPTH" }, " in ", { t: "Barail", e: "FORMATION" }, " sand. ROP 14 m/hr."],
      ["08:30        Observed ", { t: "partial loss of returns", e: "EVENT" }, " @ ", { t: `${loss.depth_m} m`, e: "DEPTH" }, ", loss rate ", { t: "18 bbl/hr", e: "RATE" }, "."],
      ["08:30–11:00  Stopped drilling. Total mud lost ", { t: "180 bbl", e: "VOLUME" }, ". Monitored well on trip tank."],
      ["11:00–15:30  ", { t: "Pumped 40 bbl LCM pill (CaCO3 F/M + fibre)", e: "ACTION" }, ", ", { t: "reduced MW 1.26 → 1.22 sg", e: "MW" }, "."],
      ["15:30–22:30  Waited on pill, regained full returns. Resumed drilling with flow rate cut 10%."],
      ["—".repeat(46)],
      ["NPT today: ", { t: "14 hrs", e: "NPT" }, " (lost circulation)    Mud: KCl-Polymer, ", { t: "1.22 sg", e: "MW" }],
      ["Remarks: Pre-treat with LCM before Barail top in future wells.  — Night DSV"],
    ],
    record: [
      { field: "Well", value: "NWS-07", conf: 0.99, ent: "WELL" },
      { field: "Date", value: loss.date, conf: 0.97, ent: "DATE" },
      { field: "Event type", value: "Mud loss (partial)", conf: 0.95, ent: "EVENT" },
      { field: "Depth", value: `${loss.depth_m} m MD`, conf: 0.98, ent: "DEPTH" },
      { field: "Formation", value: "Barail", conf: 0.93, ent: "FORMATION" },
      { field: "Loss rate / volume", value: "18 bbl/hr · 180 bbl", conf: 0.94, ent: "VOLUME" },
      { field: "Mitigation", value: "40 bbl LCM pill (CaCO₃ + fibre); flow −10%", conf: 0.91, ent: "ACTION" },
      { field: "Mud weight change", value: "1.26 → 1.22 sg", conf: 0.96, ent: "MW" },
      { field: "NPT", value: "14 h", conf: 0.98, ent: "NPT" },
      { field: "Lesson (from remarks)", value: "Pre-treat with LCM before Barail top", conf: 0.88, ent: "ACTION" },
    ],
    linksTo: { label: `Saved as event ${loss.id}`, href: `/wells/NWS-07?tab=events&event=${loss.id}` },
  },
  {
    id: "wcr",
    title: "WCR casing summary — NWS-03",
    kind: "Well Completion Report (p. 14)",
    year: w3.spud_date!.slice(0, 4),
    quality: "Photocopy of typed page · 150 dpi · faded",
    lines: [
      [{ t: "WELL COMPLETION REPORT", e: "EVENT", f: "_title" }, "  — Section 4: Casing & Cementing"],
      ["Well: ", { t: "NWS-03", e: "WELL" }, "     Spud: ", { t: w3.spud_date!.split("-").reverse().join("."), e: "DATE" }],
      ["—".repeat(46)],
      ...w3.casing.map((c) => [
        { t: c.size_label.padEnd(5), e: "CASING" as Ent },
        "  shoe @ ",
        { t: `${c.shoe_m} m`, e: "DEPTH" as Ent },
        `   TOC ${c.toc_m} m   cement: `,
        c.cement_result === "good" ? "good bond (CBL)" : { t: "partial bond — squeezed", e: "EVENT" as Ent },
      ]),
      ["—".repeat(46)],
      ["Remarks: String ", { t: "stuck at 3,111 m", e: "EVENT" }, " in ", { t: "Barail", e: "FORMATION" }, " coal. ", { t: "Jarred 38 times", e: "ACTION" }, "; fishing unsuccessful."],
      ["Well ", { t: "plugged & abandoned", e: "ACTION" }, ". Total NPT on problems: ", { t: "180 hrs", e: "NPT" }, "."],
    ],
    record: [
      { field: "Well", value: "NWS-03", conf: 0.99, ent: "WELL" },
      ...w3.casing.map((c) => ({ field: `${c.size_label} ${c.name}`, value: `shoe ${c.shoe_m} m · TOC ${c.toc_m} m · ${c.cement_result}`, conf: 0.9 + (c.shoe_m % 7) / 100, ent: "CASING" as Ent })),
      { field: "Event", value: "Stuck pipe @ 3,111 m (Barail coal)", conf: 0.92, ent: "EVENT" },
      { field: "Outcome", value: "Fishing failed → P&A", conf: 0.9, ent: "ACTION" },
      { field: "NPT", value: "180 h", conf: 0.95, ent: "NPT" },
    ],
    linksTo: { label: "Updated casing + events for NWS-03", href: "/wells/NWS-03?tab=casing" },
  },
];
