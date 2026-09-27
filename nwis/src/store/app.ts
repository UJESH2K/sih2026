"use client";

import { create } from "zustand";
import type { EventType } from "@/data/types";
import { ACTIVE_WELL } from "@/data/wells";
import { getOffsets, upcomingRisks, type UpcomingRisk } from "@/lib/risk";
import { buildPrefill, mwPlanAt, PLANNED_TD, sampleAt, START_DEPTH, type LiveSample } from "@/lib/live";
import { riskLevel, type RiskLevel } from "@/lib/event-meta";

export type Lang = "en" | "hi";
export type Mode = "office" | "field";
export type Basemap = "streets" | "satellite";

export interface NwisAlert {
  id: string;
  kind: "predictive" | "realtime";
  type: EventType;
  level: RiskLevel;
  p: number;
  raisedAtDepth: number;
  targetDepth: number;
  formation: string;
  wells: string[];
  offsetsConsidered: number;
  recommendation: string;
  provenFix?: UpcomingRisk["provenFix"];
  signal?: string; // realtime signal description
  hours: number;
  status: "new" | "ack" | "applied";
}

export interface Layers {
  wells: boolean;
  rings: boolean;
  links: boolean;
  heat: boolean;
  trajectories: boolean;
  labels: boolean;
}

interface FlyRequest {
  lng: number;
  lat: number;
  zoom?: number;
  ts: number;
}

interface State {
  lang: Lang;
  mode: Mode;
  radiusKm: number;
  selectedWellId: string | null;
  highlightIds: string[];
  compareIds: string[];
  layers: Layers;
  basemap: Basemap;
  fly: FlyRequest | null;

  depth: number;
  running: boolean;
  speed: number; // multiplier
  history: LiveSample[];
  alerts: NwisAlert[];
  alertKeys: string[];
  mitigated: EventType[];
  mwOffset: number;

  setLang: (l: Lang) => void;
  setMode: (m: Mode) => void;
  setRadius: (r: number) => void;
  selectWell: (id: string | null) => void;
  setHighlight: (ids: string[]) => void;
  toggleCompare: (id: string) => void;
  setCompare: (ids: string[]) => void;
  toggleLayer: (k: keyof Layers) => void;
  setBasemap: (b: Basemap) => void;
  flyTo: (lng: number, lat: number, zoom?: number) => void;

  start: () => void;
  pause: () => void;
  setSpeed: (s: number) => void;
  reset: () => void;
  tick: (dtSec: number) => void;
  jumpTo: (depth: number) => void;
  ackAlert: (id: string) => void;
  applyAlert: (id: string) => void;
}

const BASE_MPS = 2.5; // metres per real second at 1×

const prefill = buildPrefill();

export const useApp = create<State>((set, get) => ({
  lang: "en",
  mode: "office",
  radiusKm: 5,
  selectedWellId: null,
  highlightIds: [],
  compareIds: ["NWS-04", "NWS-07", "NWS-15", "NWS-16"],
  layers: { wells: true, rings: true, links: true, heat: false, trajectories: true, labels: true },
  basemap: "streets",
  fly: null,

  depth: START_DEPTH,
  running: false,
  speed: 1,
  history: prefill,
  alerts: [],
  alertKeys: [],
  mitigated: [],
  mwOffset: 0,

  setLang: (lang) => set({ lang }),
  setMode: (mode) => set({ mode }),
  setRadius: (radiusKm) => set({ radiusKm }),
  selectWell: (selectedWellId) => set({ selectedWellId }),
  setHighlight: (highlightIds) => set({ highlightIds }),
  toggleCompare: (id) =>
    set((s) => ({
      compareIds: s.compareIds.includes(id) ? s.compareIds.filter((x) => x !== id) : [...s.compareIds, id].slice(-6),
    })),
  setCompare: (compareIds) => set({ compareIds }),
  toggleLayer: (k) => set((s) => ({ layers: { ...s.layers, [k]: !s.layers[k] } })),
  setBasemap: (basemap) => set({ basemap }),
  flyTo: (lng, lat, zoom) => set({ fly: { lng, lat, zoom, ts: Date.now() } }),

  start: () => set((s) => ({ running: s.depth < PLANNED_TD })),
  pause: () => set({ running: false }),
  setSpeed: (speed) => set({ speed }),
  reset: () =>
    set({
      depth: START_DEPTH,
      running: false,
      history: prefill,
      alerts: [],
      alertKeys: [],
      mitigated: [],
      mwOffset: 0,
    }),
  jumpTo: (target) => {
    const s = get();
    if (target <= s.depth) return;
    advance(set, get, target - s.depth);
  },
  tick: (dt) => {
    const s = get();
    if (!s.running) return;
    advance(set, get, BASE_MPS * s.speed * dt);
  },
  ackAlert: (id) => set((s) => ({ alerts: s.alerts.map((a) => (a.id === id && a.status === "new" ? { ...a, status: "ack" } : a)) })),
  applyAlert: (id) =>
    set((s) => {
      const a = s.alerts.find((x) => x.id === id);
      if (!a) return {};
      const extra: EventType[] = a.type === "stuck_pipe" ? ["torque_spike"] : a.type === "torque_spike" ? ["stuck_pipe"] : [];
      const mwOffset = a.type === "kick" ? s.mwOffset + 0.08 : a.type === "mud_loss" ? s.mwOffset - 0.02 : s.mwOffset;
      return {
        alerts: s.alerts.map((x) => (x.type === a.type ? { ...x, status: "applied" } : x)),
        mitigated: [...new Set([...s.mitigated, a.type, ...extra])],
        mwOffset,
      };
    }),
}));

type Setter = (partial: Partial<State>) => void;

function advance(set: Setter, get: () => State, metres: number) {
  const s = get();
  const target = Math.min(PLANNED_TD, s.depth + metres);
  const history = s.history.slice();
  const alerts = s.alerts.slice();
  const keys = new Set(s.alertKeys);
  const mitigated = new Set(s.mitigated);
  let last = history[history.length - 1];
  const offsets = getOffsets(ACTIVE_WELL, s.radiusKm);

  for (let d = Math.floor(s.depth) + 1; d <= Math.floor(target); d++) {
    const mw = +(mwPlanAt(d) + s.mwOffset).toFixed(2);
    const smp = sampleAt(d, mw, mitigated, last.hours, last.pitGain);
    history.push(smp);

    // --- real-time signal checks -------------------------------------
    const base = history.slice(-60, -10);
    const baseTorque = base.reduce((a, b) => a + b.torque, 0) / Math.max(1, base.length);
    const push = (key: string, a: Omit<NwisAlert, "id" | "hours" | "status">) => {
      if (keys.has(key)) return;
      keys.add(key);
      alerts.unshift({ ...a, id: key + "-" + d, hours: smp.hours, status: "new" });
    };
    if (smp.flowOut < smp.flowIn * 0.9 && !mitigated.has("mud_loss")) {
      push("rt-loss", {
        kind: "realtime", type: "mud_loss", level: "high", p: 0.92, raisedAtDepth: d, targetDepth: d, formation: smp.formation,
        wells: [], offsetsConsidered: offsets.length,
        recommendation: "Losses detected: reduce pump rate, spot LCM pill, monitor trip tank.",
        signal: `Flow-out ${Math.round(smp.flowOut)} lpm vs flow-in ${Math.round(smp.flowIn)} lpm (−${Math.round((1 - smp.flowOut / smp.flowIn) * 100)}%)`,
      });
    }
    if (base.length > 30 && smp.torque > baseTorque * 1.35 && !mitigated.has("torque_spike")) {
      push("rt-torque", {
        kind: "realtime", type: "torque_spike", level: "high", p: 0.85, raisedAtDepth: d, targetDepth: d, formation: smp.formation,
        wells: ["NWS-07"], offsetsConsidered: offsets.length,
        recommendation: "Torque signature matches pre-stuck-pipe pattern in NWS-07. Reduce WOB, drop RPM to 90, pump hi-vis sweep, keep pipe moving.",
        signal: `Torque ${smp.torque.toFixed(1)} kN·m vs 50 m baseline ${baseTorque.toFixed(1)} kN·m (+${Math.round((smp.torque / baseTorque - 1) * 100)}%)`,
      });
    }
    if (smp.pitGain > 4 && !mitigated.has("kick")) {
      push("rt-kick", {
        kind: "realtime", type: "kick", level: "high", p: 0.9, raisedAtDepth: d, targetDepth: d, formation: smp.formation,
        wells: [], offsetsConsidered: offsets.length,
        recommendation: "Possible influx: stop drilling, flow check, shut in if positive. Follow well-control procedure.",
        signal: `Pit gain ${smp.pitGain.toFixed(1)} bbl, background gas ${smp.gas.toFixed(1)}%`,
      });
    }

    // --- predictive look-ahead every 10 m -----------------------------
    if (d % 10 === 0) {
      for (const r of upcomingRisks(ACTIVE_WELL, offsets, d, 160)) {
        if (r.p < 0.4 || r.distanceAhead > 160 || r.distanceAhead < 5 || mitigated.has(r.type)) continue;
        // one predictive alert per hazard zone: skip if same type already raised within 250 m
        if (alerts.some((a) => a.kind === "predictive" && a.type === r.type && Math.abs(a.targetDepth - r.peakDepth) < 250)) continue;
        push(`pred-${r.type}-${r.formation}`, {
          kind: "predictive", type: r.type, level: riskLevel(r.p), p: r.p, raisedAtDepth: d, targetDepth: r.peakDepth,
          formation: r.formation, wells: r.wellsWith, offsetsConsidered: r.offsetsConsidered,
          recommendation: r.recommendation, provenFix: r.provenFix,
        });
      }
    }
    last = smp;
  }

  const trimmed = history.length > 2200 ? history.slice(-2200) : history;
  set({
    depth: target,
    history: trimmed,
    alerts,
    alertKeys: [...keys],
    running: target >= PLANNED_TD ? false : s.running,
  });
}

