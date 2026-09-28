import { ACTIVE_WELL, ALL_EVENTS, WELL_BY_ID, WELLS } from "@/data/wells";
import { FORMATIONS } from "@/data/formations";
import type { DrillingEvent, EventType } from "@/data/types";
import { EVENT_META } from "./event-meta";
import { getOffsets, upcomingRisks } from "./risk";

/* ======================================================================
 * "Ask NWIS" — local retrieval + templated answer composer.
 * Parses entities (wells, formations, problem types, depth ranges) from a
 * question, retrieves matching knowledge-base records and composes a cited
 * answer. In production this is an LLM with RAG over the same index.
 * ====================================================================*/

export interface Source {
  n: number;
  label: string;
  href: string;
}
export interface Answer {
  intro: string;
  bullets: { text: string; cites: number[] }[];
  outro?: string;
  table?: { head: string[]; rows: string[][] };
  sources: Source[];
  followups: string[];
  parsed: string[]; // what NWIS understood (shown as chips)
}

const TYPE_WORDS: [RegExp, EventType][] = [
  [/\b(mud )?loss(es)?\b|lost circulation|losing/i, "mud_loss"],
  [/\bkick|influx|overpressure|well control|pit gain/i, "kick"],
  [/stuck|sticking|differential/i, "stuck_pipe"],
  [/tight|overpull|drag/i, "tight_hole"],
  [/torque|stick.?slip/i, "torque_spike"],
  [/cement|cbl|bond|squeeze/i, "cement_issue"],
  [/fish/i, "fishing"],
  [/balling|sticky clay/i, "bit_balling"],
  [/instab|slough|caving|collapse/i, "wellbore_instability"],
];

const HI_TERMS: [RegExp, string][] = [
  [/बरैल/g, "Barail"],
  [/टिपम/g, "Tipam"],
  [/कोपिली/g, "Kopili"],
  [/गिरुजन/g, "Girujan"],
  [/सिलहट/g, "Sylhet"],
  [/मड लॉस|मड हानि|नुकसान/g, "losses"],
  [/किक/g, "kick"],
  [/अटका|फँसा/g, "stuck"],
  [/टॉर्क/g, "torque"],
  [/सीमेंट/g, "cement"],
  [/मड वज़न|मड भार/g, "mud weight"],
  [/सारांश|इतिहास/g, "summary"],
  [/पास के|निकट/g, "nearby"],
  [/नीचे/g, "below"],
  [/मी\./g, "m"],
];

function parse(raw: string) {
  let q = raw;
  for (const [re, en] of HI_TERMS) q = q.replace(re, ` ${en} `);
  const within = q.match(/within\s*([\d.]+)\s*km/i);
  const radiusOverride = within ? Number(within[1]) : undefined;
  const wells = [...new Set((q.toUpperCase().match(/NWS-?\s?\d{1,2}/g) ?? []).map((w) => `NWS-${w.replace(/\D/g, "").padStart(2, "0")}`))].filter((w) => WELL_BY_ID[w]);
  const formations = FORMATIONS.filter((f) => new RegExp(f.name.split(" ")[0], "i").test(q));
  const types = TYPE_WORDS.filter(([re]) => re.test(q)).map(([, t]) => t);
  let minD: number | undefined;
  let maxD: number | undefined;
  const num = (s: string) => Number(s.replace(/,/g, ""));
  const below = q.match(/(below|deeper than|beyond|greater than|>)\s*([\d,]{3,5})/i);
  const above = q.match(/(above|shallower than|less than|<)\s*([\d,]{3,5})/i);
  const between = q.match(/between\s*([\d,]{3,5})\s*(m|metres|meters)?\s*(and|to|-)\s*([\d,]{3,5})/i);
  if (between) {
    minD = num(between[1]);
    maxD = num(between[4]);
  } else {
    if (below) minD = num(below[2]);
    if (above) maxD = num(above[2]);
  }
  const nearby = radiusOverride != null || /nearby|offset|near|around|close|radius|neighbo/i.test(q);
  const intent = /summar|history|tell me about|overview/i.test(q)
    ? "summary"
    : /mud weight|\bmw\b|density|sg\b/i.test(q)
      ? "mudweight"
      : /recommend|should|what to do|next|ahead|prepare|precaution/i.test(q)
        ? "advice"
        : /how many|count|number of|most|worst|highest npt/i.test(q)
          ? "count"
          : "events";
  return { wells, formations, types, minD, maxD, nearby, intent, radiusOverride };
}

function cite(ev: DrillingEvent, sources: Source[]) {
  const label = `${ev.wellId} · ${ev.source.doc}, p.${ev.source.page}`;
  let s = sources.find((x) => x.label === label);
  if (!s) {
    s = { n: sources.length + 1, label, href: `/wells/${ev.wellId}?tab=events&event=${ev.id}` };
    sources.push(s);
  }
  return s.n;
}

const fmt = (n: number) => n.toLocaleString("en-IN");

export function answer(q: string, defaultRadiusKm = 5, currentDepth = 2650): Answer {
  const p = parse(q);
  const radiusKm = p.radiusOverride ?? defaultRadiusKm;
  const sources: Source[] = [];
  const parsed: string[] = [];
  p.wells.forEach((w) => parsed.push(`Well: ${w}`));
  p.formations.forEach((f) => parsed.push(`Formation: ${f.name}`));
  p.types.forEach((t) => parsed.push(`Problem: ${EVENT_META[t].label}`));
  if (p.minD) parsed.push(`Depth ≥ ${fmt(p.minD)} m`);
  if (p.maxD) parsed.push(`Depth ≤ ${fmt(p.maxD)} m`);
  if (p.nearby) parsed.push(`Offsets within ${radiusKm} km of ${ACTIVE_WELL.id}`);

  // ---- well summary ------------------------------------------------------
  if (p.intent === "summary" && p.wells.length) {
    const w = WELL_BY_ID[p.wells[0]];
    const evs = [...w.events].sort((a, b) => a.depth_m - b.depth_m);
    return {
      intro: `${w.id} is a ${w.purpose.toLowerCase()} well (${w.profile} profile, ${w.status}), spudded ${w.spud_date ?? "— (planned)"} with TD ${fmt(w.total_depth_m)} m. Result: ${w.result}. It recorded ${evs.length} drilling events with ${w.npt_total_h} h of NPT.`,
      bullets: evs.map((e) => ({
        text: `${EVENT_META[e.type].label} at ${fmt(e.depth_m)} m (${e.formation}): ${e.details} Action: ${e.action}`,
        cites: [cite(e, sources)],
      })),
      outro: evs.length ? `Key lesson: ${evs.sort((a, b) => b.npt_hours - a.npt_hours)[0].lesson}` : undefined,
      table: {
        head: ["Casing", "Shoe (m)", "Cement"],
        rows: w.casing.map((c) => [`${c.size_label} ${c.name}`, fmt(c.shoe_m), c.cement_result]),
      },
      sources,
      followups: [`Compare ${w.id} with ${ACTIVE_WELL.id}`, `What mud weight was used in ${w.id}?`, "Which wells had stuck pipe in the Barail?"],
      parsed,
    };
  }

  // ---- mud weight --------------------------------------------------------
  if (p.intent === "mudweight") {
    const fm = p.formations[0] ?? FORMATIONS.find((f) => f.id === "kopili")!;
    const offs = getOffsets(ACTIVE_WELL, radiusKm).map((o) => o.well);
    const rows = offs
      .filter((w) => w.total_depth_m > (w.formation_tops.find((t) => t.id === fm.id)?.top_m ?? 9e9))
      .map((w) => {
        const top = w.formation_tops.find((t) => t.id === fm.id)!.top_m;
        const mw = w.mud_program.find((m) => top + 20 >= m.from_m && top + 20 <= m.to_m)?.mw_sg ?? 0;
        const probs = w.events.filter((e) => e.formation === fm.name);
        return { w, mw, probs };
      });
    const trouble = rows.filter((r) => r.probs.some((e) => e.type === "kick" || e.type === "mud_loss"));
    const clean = rows.filter((r) => !r.probs.some((e) => e.type === "kick" || e.type === "mud_loss"));
    return {
      intro: `In the ${fm.name}, ${rows.length} offset wells within ${radiusKm} km give a usable mud-weight window. ${trouble.length} of them had losses or influx there.`,
      bullets: [
        ...trouble.slice(0, 5).map((r) => {
          const e = r.probs.find((x) => x.type === "kick" || x.type === "mud_loss")!;
          return { text: `${r.w.id}: entered at ${r.mw.toFixed(2)} sg, then ${EVENT_META[e.type].label.toLowerCase()} at ${fmt(e.depth_m)} m; ${e.action}`, cites: [cite(e, sources)] };
        }),
        ...(clean.length ? [{ text: `No losses/influx at ${clean.map((r) => `${r.w.id} (${r.mw.toFixed(2)} sg)`).join(", ")}.`, cites: [] }] : []),
      ],
      outro:
        fm.id === "kopili"
          ? "Suggested window: raise to 1.30–1.32 sg before the Kopili top; wells entering at ≤ 1.24 sg took kicks."
          : fm.id === "barail"
            ? "Suggested window: stay at or below 1.22 sg across the Barail top to avoid losses, and raise slowly for coal-seam stability once past the loss zone."
            : "Stay within the offset window and monitor ECD.",
      table: { head: ["Well", `MW entering ${fm.name} (sg)`, "Problems"], rows: rows.map((r) => [r.w.id, r.mw.toFixed(2), r.probs.map((e) => EVENT_META[e.type].short).join(", ") || "—"]) },
      sources,
      followups: ["What should we prepare for in the next 200 m?", `Which wells had kicks in the Kopili?`],
      parsed: parsed.length ? parsed : [`Formation: ${fm.name}`, "Topic: mud weight"],
    };
  }

  // ---- advice for active well --------------------------------------------
  if (p.intent === "advice" && !p.wells.length) {
    const horizon = Number(q.match(/next\s*([\d,]{2,4})\s*m/i)?.[1]?.replace(/,/g, "") ?? 300);
    const risks = upcomingRisks(ACTIVE_WELL, getOffsets(ACTIVE_WELL, radiusKm), currentDepth, horizon).filter((r) => r.p >= 0.2).slice(0, 3);
    return {
      intro: `${ACTIVE_WELL.id} is at ${fmt(Math.round(currentDepth))} m. Based on ${getOffsets(ACTIVE_WELL, radiusKm).length} offset wells within ${radiusKm} km, these are the main risks in the next ${horizon} m:`,
      bullets: risks.map((r) => ({
        text: `${EVENT_META[r.type].label} (${Math.round(r.p * 100)}%) around ${fmt(r.peakDepth)} m in ${r.formation}, seen in ${r.wellsWith.join(", ")}. ${r.recommendation}`,
        cites: r.evidence.slice(0, 3).map((e) => cite(e.event, sources)),
      })),
      outro: risks[0]?.provenFix ? `What worked before (${risks[0].provenFix.wellId}): ${risks[0].provenFix.action}` : undefined,
      sources,
      followups: ["What mud weight worked for the Kopili?", "Which wells had stuck pipe in the Barail?", "Summarise NWS-07"],
      parsed: parsed.length ? parsed : [`Active well ${ACTIVE_WELL.id}`, `Look-ahead ${horizon} m`],
    };
  }

  // ---- event search (default) ---------------------------------------------
  const nearIds = new Set(getOffsets(ACTIVE_WELL, radiusKm).map((o) => o.well.id));
  let evs = ALL_EVENTS.filter(
    (e) =>
      (!p.wells.length || p.wells.includes(e.wellId)) &&
      (!p.formations.length || p.formations.some((f) => f.name === e.formation)) &&
      (!p.types.length || p.types.includes(e.type)) &&
      (p.minD == null || e.depth_m >= p.minD) &&
      (p.maxD == null || e.depth_m <= p.maxD) &&
      (!p.nearby || nearIds.has(e.wellId)),
  );
  evs = evs.sort((a, b) => b.severity - a.severity || b.npt_hours - a.npt_hours);
  if (!evs.length) {
    return {
      intro: "I could not find matching records in the knowledge base. Try naming a formation (Barail, Tipam, Kopili…), a problem (losses, stuck pipe, kick…) or a well (NWS-07).",
      bullets: [],
      sources,
      followups: ["What problems did nearby wells face in the Barail formation?", "Which wells had stuck pipe below 3,000 m?", "Summarise NWS-07"],
      parsed,
    };
  }
  const byType = evs.reduce<Record<string, DrillingEvent[]>>((acc, e) => ((acc[e.type] ??= []).push(e), acc), {});
  const wellsHit = [...new Set(evs.map((e) => e.wellId))];
  const npt = evs.reduce((s, e) => s + e.npt_hours, 0);
  const scope = [
    p.types.length ? p.types.map((t) => EVENT_META[t].label.toLowerCase()).join(" / ") : "drilling problems",
    p.formations.length ? `in the ${p.formations.map((f) => f.name).join(" & ")}` : "",
    p.minD ? `below ${fmt(p.minD)} m` : "",
    p.maxD ? `above ${fmt(p.maxD)} m` : "",
    p.nearby ? `within ${radiusKm} km of ${ACTIVE_WELL.id}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const top = evs.slice(0, 7);
  const lessons = [...new Set(top.map((e) => e.lesson))].slice(0, 2);
  return {
    intro: `Found ${evs.length} records of ${scope} across ${wellsHit.length} well${wellsHit.length > 1 ? "s" : ""} (${npt} h NPT in total). Breakdown: ${Object.entries(byType)
      .map(([t, list]) => `${EVENT_META[t as EventType].label} ×${list.length}`)
      .join(", ")}.`,
    bullets: top.map((e) => ({
      text: `${e.wellId} at ${fmt(e.depth_m)} m (${e.formation}): ${e.details} Action: ${e.action} NPT ${e.npt_hours} h.`,
      cites: [cite(e, sources)],
    })),
    outro: lessons.length ? `Lessons learned: ${lessons.join(" ")}` : undefined,
    sources,
    followups: [
      p.types[0] === "stuck_pipe" ? "What torque signs came before stuck pipe?" : "Which wells had stuck pipe below 3,000 m?",
      "What should we prepare for in the next 200 m?",
      wellsHit[0] ? `Summarise ${wellsHit[0]}` : "Summarise NWS-07",
    ],
    parsed,
  };
}

export const SUGGESTED = [
  "What problems did nearby wells face in the Barail formation?",
  "Which wells had stuck pipe below 3,000 m?",
  "Summarise NWS-07's drilling history",
  "What mud weight worked for the Kopili?",
  "What should we prepare for in the next 200 m?",
  "Show kicks in wells within 3 km",
];

export const SUGGESTED_HI = [
  "बरैल संरचना में पास के कुओं को क्या समस्याएँ आईं? (Barail losses)",
  "3,000 मी. से नीचे किन कुओं में stuck pipe हुआ?",
  "Summarise NWS-07",
];

export { WELLS };
