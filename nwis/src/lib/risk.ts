import { FORMATIONS } from "@/data/formations";
import { WELLS } from "@/data/wells";
import type { DrillingEvent, EventType, Well } from "@/data/types";
import { bearingDeg, compass, distanceKm } from "./geo";
import { EVENT_TYPES } from "./event-meta";

/* =====================================================================
 * NWIS offset-risk model (demo implementation)
 * ---------------------------------------------------------------------
 * 1. Formation-relative depth alignment: every depth in the active well
 *    is expressed as (formation, fraction-through-formation) and mapped
 *    to the equivalent depth in each offset well.
 * 2. Evidence: offset events within ±window of the equivalent depth.
 * 3. Weighting: inverse-distance (exp decay, 3.5 km length scale) ×
 *    severity × depth proximity.
 * 4. Probability: noisy-OR over all evidence  p = 1 − Π(1 − wᵢ).
 * This is explainable by construction — every % links to its evidence.
 * ===================================================================*/

export interface Offset {
  well: Well;
  distanceKm: number;
  bearing: number;
  compass: string;
}

export function getOffsets(active: Well, radiusKm: number, includePlanned = false): Offset[] {
  return WELLS.filter((w) => w.id !== active.id && (includePlanned || w.status !== "planned"))
    .map((w) => {
      const b = bearingDeg(active, w);
      return { well: w, distanceKm: distanceKm(active, w), bearing: b, compass: compass(b) };
    })
    .filter((o) => o.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function formationIndexAt(well: Well, d: number) {
  let idx = 0;
  for (let i = 0; i < well.formation_tops.length; i++) if (d >= well.formation_tops[i].top_m) idx = i;
  return idx;
}

function thickness(well: Well, i: number) {
  const next = well.formation_tops[i + 1];
  return next ? next.top_m - well.formation_tops[i].top_m : 400;
}

/** Map a depth in `from` to the formation-equivalent depth in `to`. */
export function mapDepth(from: Well, to: Well, d: number) {
  const i = formationIndexAt(from, d);
  const rel = (d - from.formation_tops[i].top_m) / thickness(from, i);
  return to.formation_tops[i].top_m + rel * thickness(to, i);
}

export function formationAt(well: Well, d: number) {
  return FORMATIONS[formationIndexAt(well, d)];
}

export interface Evidence {
  event: DrillingEvent;
  offset: Offset;
  equivDepth: number; // in active well coordinates
  weight: number;
}

export interface RiskPoint {
  type: EventType;
  p: number;
  evidence: Evidence[];
}

const WINDOW = 70;

export function riskAt(active: Well, offsets: Offset[], d: number, window = WINDOW): RiskPoint[] {
  const acc: Record<string, { q: number; ev: Evidence[] }> = {};
  for (const t of EVENT_TYPES) acc[t] = { q: 1, ev: [] };
  for (const o of offsets) {
    for (const e of o.well.events) {
      const eq = mapDepth(o.well, active, e.depth_m);
      const dz = Math.abs(eq - d);
      if (dz > window) continue;
      const w = Math.exp(-o.distanceKm / 3.5) * (0.2 + 0.07 * e.severity) * (1 - (dz / window) * 0.45);
      acc[e.type].q *= 1 - w;
      acc[e.type].ev.push({ event: e, offset: o, equivDepth: eq, weight: w });
    }
  }
  return EVENT_TYPES.map((t) => ({ type: t, p: 1 - acc[t].q, evidence: acc[t].ev.sort((a, b) => b.weight - a.weight) }));
}

export type ProfileRow = { depth: number } & Record<EventType, number> & { max: number };

export function riskProfile(active: Well, offsets: Offset[], from: number, to: number, step = 10): ProfileRow[] {
  const rows: ProfileRow[] = [];
  for (let d = from; d <= to; d += step) {
    const r = riskAt(active, offsets, d);
    const row = { depth: d, max: 0 } as ProfileRow;
    for (const x of r) {
      row[x.type] = x.p;
      row.max = Math.max(row.max, x.p);
    }
    rows.push(row);
  }
  return rows;
}

export interface UpcomingRisk {
  type: EventType;
  p: number;
  peakDepth: number;
  distanceAhead: number;
  formation: string;
  wellsWith: string[];
  offsetsConsidered: number;
  evidence: Evidence[];
  recommendation: string;
  provenFix?: { wellId: string; action: string; npt: number };
}

const RECS: Record<EventType, string> = {
  mud_loss: "Pre-treat active system with sized LCM (CaCO₃ fine/medium, 15–20 ppb), keep MW ≤ 1.22 sg and reduce flow rate ~10% through the zone.",
  kick: "Raise MW to 1.30–1.32 sg before the Kopili top, perform flow checks at every connection and keep trip-tank monitoring active.",
  stuck_pipe: "Keep pipe moving, minimise connection time, wiper trip every 150 m and keep a jar in the BHA; avoid long static periods.",
  tight_hole: "Plan reaming passes, monitor drag trend per stand and add shale inhibitor.",
  torque_spike: "Reduce WOB, drop RPM to ~90, add 2% lubricant. Watch for stick-slip — an early sign of sticking.",
  cement_issue: "Condition mud (YP < 15), use a spacer train and centralisers across the shoe interval.",
  fishing: "Keep fishing tools on location; set a 24 h decision point for sidetrack evaluation.",
  bit_balling: "Use KCl-polymer mud with anti-balling additive; maximise flow rate.",
  wellbore_instability: "Increase MW 0.03–0.04 sg, add asphaltic inhibitor, minimise open-hole time.",
};

export function upcomingRisks(active: Well, offsets: Offset[], depth: number, horizon = 220): UpcomingRisk[] {
  const best: Record<string, { p: number; d: number; ev: Evidence[] }> = {};
  for (let d = depth; d <= depth + horizon; d += 10) {
    for (const r of riskAt(active, offsets, d)) {
      if (!best[r.type] || r.p > best[r.type].p) best[r.type] = { p: r.p, d, ev: r.evidence };
    }
  }
  const considered = offsets.filter((o) => o.well.status !== "planned").length;
  return Object.entries(best)
    .filter(([, v]) => v.p > 0.05)
    .map(([type, v]) => {
      const t = type as EventType;
      const wellsWith = [...new Set(v.ev.map((e) => e.event.wellId))];
      const fix = [...v.ev].sort((a, b) => a.event.npt_hours - b.event.npt_hours)[0];
      return {
        type: t,
        p: v.p,
        peakDepth: v.d,
        distanceAhead: v.d - depth,
        formation: formationAt(active, v.d).name,
        wellsWith,
        offsetsConsidered: considered,
        evidence: v.ev,
        recommendation: RECS[t],
        provenFix: fix ? { wellId: fix.event.wellId, action: fix.event.action, npt: fix.event.npt_hours } : undefined,
      };
    })
    .sort((a, b) => b.p - a.p);
}

export const RECOMMENDATIONS = RECS;
