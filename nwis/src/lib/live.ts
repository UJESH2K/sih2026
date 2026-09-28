import { ACTIVE_WELL, topOf } from "@/data/wells";
import type { EventType } from "@/data/types";
import { formationAt } from "./risk";

export interface LiveSample {
  depth: number;
  rop: number; // m/h
  wob: number; // t
  rpm: number;
  torque: number; // kN·m
  spp: number; // bar
  mw: number; // sg
  flowIn: number; // lpm
  flowOut: number; // lpm
  pitGain: number; // bbl (cumulative)
  gas: number; // %
  formation: string;
  hours: number; // simulated rig hours since start of section
}

export const START_DEPTH = 2650;
export const PREFILL_FROM = 2300;
export const PLANNED_TD = ACTIVE_WELL.planned_depth_m;

const TOP_BARAIL = topOf(ACTIVE_WELL, "barail");
const TOP_KOPILI = topOf(ACTIVE_WELL, "kopili");
const TOP_SYLHET = topOf(ACTIVE_WELL, "sylhet");

/** Scripted problem zones for the replay (aligned with offset evidence). */
export const ZONES = {
  loss: { from: TOP_BARAIL + 12, to: TOP_BARAIL + 48 },
  torque: { from: TOP_BARAIL + 190, to: TOP_BARAIL + 235 },
  kick: { from: TOP_KOPILI + 45, to: TOP_KOPILI + 95 },
};

const noise = (d: number, f: number, a: number) => Math.sin(d * f) * a + Math.sin(d * f * 2.7 + 1.3) * a * 0.5;
const bump = (d: number, from: number, to: number) => {
  if (d < from || d > to) return 0;
  const x = (d - from) / (to - from);
  return Math.sin(Math.PI * x);
};

const ROP_BY_FM: Record<string, number> = {
  alluvium: 40, dhekiajuli: 32, girujan: 20, tipam: 24, barail: 13, kopili: 9, sylhet: 6, basement: 3,
};

export function sampleAt(depth: number, mw: number, mitigated: Set<EventType>, prevHours: number, prevPit: number, stepM = 1): LiveSample {
  const fm = formationAt(ACTIVE_WELL, depth);
  const rop = Math.max(2, (ROP_BY_FM[fm.id] ?? 15) + noise(depth, 0.09, 2.4) - bump(depth, ZONES.torque.from, ZONES.torque.to) * 5);
  const lossB = bump(depth, ZONES.loss.from, ZONES.loss.to);
  const torqueB = bump(depth, ZONES.torque.from, ZONES.torque.to);
  const kickB = bump(depth, ZONES.kick.from, ZONES.kick.to);
  const fmTorque = fm.id === "barail" ? 1.8 : fm.id === "kopili" ? 2.6 : fm.id === "sylhet" ? 3.4 : 0;
  const torque =
    11 + (depth / 1000) * 1.1 + fmTorque + noise(depth, 0.21, 0.7) + torqueB * (mitigated.has("stuck_pipe") || mitigated.has("torque_spike") ? 3 : 9) * (0.7 + 0.3 * Math.abs(Math.sin(depth * 1.7)));
  const flowIn = 2150 + noise(depth, 0.05, 10);
  const lossRate = lossB * (mitigated.has("mud_loss") ? 70 : 420);
  const flowOut = flowIn * 0.992 - lossRate + noise(depth, 0.33, 12);
  const kickRate = kickB * (mitigated.has("kick") ? 0.08 : 0.9);
  const pitGain = Math.max(0, prevPit + kickRate * stepM - (kickB === 0 ? prevPit * 0.02 : 0));
  const gas = 0.35 + (fm.id === "kopili" ? 0.9 : fm.id === "barail" ? 0.4 : 0) + kickB * (mitigated.has("kick") ? 0.6 : 3.8) + Math.abs(noise(depth, 0.4, 0.15));
  const spp = 148 + depth * 0.028 + noise(depth, 0.12, 2) - lossB * (mitigated.has("mud_loss") ? 1 : 8);
  return {
    depth,
    rop,
    wob: 14 + noise(depth, 0.07, 1.5) + (fm.id === "sylhet" ? 3 : 0),
    rpm: 118 + noise(depth, 0.03, 5) - (mitigated.has("torque_spike") ? 25 : 0) * torqueB,
    torque,
    spp,
    mw,
    flowIn,
    flowOut,
    pitGain,
    gas,
    formation: fm.name,
    hours: prevHours + stepM / rop,
  };
}

export function mwPlanAt(depth: number) {
  return depth < TOP_BARAIL - 40 ? 1.16 : depth < TOP_KOPILI ? 1.22 : 1.3;
}

export function buildPrefill(): LiveSample[] {
  const out: LiveSample[] = [];
  let h = 0;
  let pit = 0;
  for (let d = PREFILL_FROM; d <= START_DEPTH; d++) {
    const s = sampleAt(d, mwPlanAt(d), new Set(), h, pit);
    h = s.hours;
    pit = s.pitGain;
    out.push(s);
  }
  // shift hours so current = 0
  const last = out[out.length - 1].hours;
  return out.map((s) => ({ ...s, hours: s.hours - last }));
}

export { TOP_BARAIL, TOP_KOPILI, TOP_SYLHET };
