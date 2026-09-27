import type { Well } from "@/data/types";
import { formationAt } from "./risk";

const ROP: Record<string, number> = { alluvium: 40, dhekiajuli: 32, girujan: 20, tipam: 24, barail: 13, kopili: 9, sylhet: 6, basement: 3 };

export interface TDPoint {
  day: number;
  depth: number;
  label?: string;
  kind?: "event" | "casing";
  eventType?: string;
  npt?: number;
}

/** Days-vs-depth curve reconstructed from DDRs (flat steps = NPT / casing runs). */
export function timeDepth(well: Well, uptoDepth?: number): TDPoint[] {
  const end = uptoDepth ?? well.total_depth_m;
  const pts: TDPoint[] = [{ day: 0, depth: 0 }];
  let day = 0;
  const events = [...well.events].sort((a, b) => a.depth_m - b.depth_m);
  const shoes = well.casing.filter((c) => c.shoe_m > 60);
  let ei = 0;
  let ci = 0;
  for (let d = 25; d <= end; d += 25) {
    const fm = formationAt(well, d);
    day += 25 / ((ROP[fm.id] ?? 15) * 24 * 0.42);
    while (ei < events.length && events[ei].depth_m <= d) {
      const e = events[ei++];
      pts.push({ day: +day.toFixed(2), depth: d });
      day += e.npt_hours / 24;
      pts.push({ day: +day.toFixed(2), depth: d, label: e.title, kind: "event", eventType: e.type, npt: e.npt_hours });
    }
    while (ci < shoes.length && shoes[ci].shoe_m <= d) {
      const c = shoes[ci++];
      pts.push({ day: +day.toFixed(2), depth: d });
      day += 1.6;
      pts.push({ day: +day.toFixed(2), depth: d, label: `${c.size_label} casing`, kind: "casing" });
    }
    pts.push({ day: +day.toFixed(2), depth: d });
  }
  return pts;
}

/** Field "technical limit" style benchmark: best offset performance, no NPT. */
export function benchmarkCurve(well: Well): TDPoint[] {
  const pts: TDPoint[] = [{ day: 0, depth: 0 }];
  let day = 0;
  for (let d = 25; d <= well.total_depth_m; d += 25) {
    const fm = formationAt(well, d);
    day += 25 / ((ROP[fm.id] ?? 15) * 24 * 0.5);
    pts.push({ day: +day.toFixed(2), depth: d });
  }
  return pts;
}
