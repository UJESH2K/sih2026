"use client";

import { useMemo, useState } from "react";
import { Lightbulb, Plus, X } from "lucide-react";
import { useApp } from "@/store/app";
import { useI18n } from "@/lib/i18n";
import { ACTIVE_WELL, WELL_BY_ID, topOf } from "@/data/wells";
import { FORMATIONS } from "@/data/formations";
import type { DrillingEvent, EventType, Well } from "@/data/types";
import { getOffsets, mapDepth } from "@/lib/risk";
import { EVENT_META, EVENT_TYPES } from "@/lib/event-meta";
import { EventChip } from "@/components/common/risk";
import { EventCard } from "@/components/well/event-card";
import { useSize } from "@/hooks/use-size";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Align = "formation" | "md";

interface Insight {
  type: EventType;
  formation: string;
  wells: string[];
  total: number;
  avgBelowTop: number;
  npt: number;
}

/** Simple pattern mining: which problem repeats near which formation top across the selected wells. */
function findInsights(wells: Well[]): Insight[] {
  const out: Insight[] = [];
  for (const f of FORMATIONS.slice(2, 7)) {
    for (const t of EVENT_TYPES) {
      const hits = wells.flatMap((w) =>
        w.events.filter((e) => e.type === t && e.formation === f.name).map((e) => ({ w: w.id, off: e.depth_m - topOf(w, f.id), npt: e.npt_hours })),
      );
      const ws = [...new Set(hits.map((h) => h.w))];
      if (ws.length >= 2)
        out.push({
          type: t,
          formation: f.name,
          wells: ws,
          total: wells.length,
          avgBelowTop: Math.round(hits.reduce((s, h) => s + h.off, 0) / hits.length),
          npt: hits.reduce((s, h) => s + h.npt, 0),
        });
    }
  }
  return out.sort((a, b) => b.wells.length - a.wells.length || b.npt - a.npt).slice(0, 4);
}

export function CorrelationView() {
  const { lang, tx } = useI18n();
  const compareIds = useApp((s) => s.compareIds);
  const toggleCompare = useApp((s) => s.toggleCompare);
  const radiusKm = useApp((s) => s.radiusKm);
  const depth = useApp((s) => s.depth);
  const [align, setAlign] = useState<Align>("formation");
  const [range, setRange] = useState<[number, number]>([1800, 4000]);
  const [types, setTypes] = useState<EventType[]>([]);
  const [sel, setSel] = useState<DrillingEvent | null>(null);
  const [ref, { width, height }] = useSize<HTMLDivElement>();

  const offsets = getOffsets(ACTIVE_WELL, radiusKm);
  const wells = [ACTIVE_WELL, ...compareIds.map((id) => WELL_BY_ID[id]).filter(Boolean)];
  const offsetWells = wells.slice(1);
  const insights = useMemo(() => findInsights(offsetWells), [compareIds.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const [top, bottom] = range;
  const headerH = 58;
  const plotH = Math.max(300, height - headerH - 10);
  const y = (d: number) => headerH + ((d - top) / (bottom - top)) * plotH;
  // in formation mode, express each well's depth in active-well-equivalent depth
  const toY = (w: Well, d: number) => y(align === "formation" && w.id !== ACTIVE_WELL.id ? mapDepth(w, ACTIVE_WELL, d) : d);
  const axisW = 54;
  const gap = Math.max(26, Math.min(70, (width - axisW) / wells.length / 3));
  const colW = Math.max(90, (width - axisW - gap * (wells.length - 1) - 8) / wells.length);
  const xOf = (i: number) => axisW + i * (colW + gap);
  const ticks: number[] = [];
  for (let d = Math.ceil(top / 100) * 100; d <= bottom; d += 100) ticks.push(d);
  const show = (e: DrillingEvent) => types.length === 0 || types.includes(e.type);

  return (
    <div className="flex h-full flex-col">
      <header className="space-y-3 border-b bg-card px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{lang === "hi" ? "ऑफ़सेट सहसंबंध" : "Offset Correlation"}</h1>
            <p className="text-sm text-muted-foreground">
              {lang === "hi"
                ? "कुएँ साथ-साथ। संरचना शीर्ष से संरेखित — ताकि एक जैसी चट्टान की तुलना हो।"
                : "Wells side by side, aligned by formation tops so the same rock is compared, not just the same depth."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border bg-muted p-0.5 text-sm" role="radiogroup" aria-label="Alignment">
              {(["formation", "md"] as Align[]).map((a) => (
                <button
                  key={a}
                  role="radio"
                  aria-checked={align === a}
                  onClick={() => setAlign(a)}
                  className={cn("rounded px-2.5 py-1 font-medium", align === a ? "bg-card" : "text-muted-foreground")}
                >
                  {a === "formation" ? (lang === "hi" ? "संरचना संरेखण" : "Align by formation") : lang === "hi" ? "मापी गहराई" : "Measured depth"}
                </button>
              ))}
            </div>
            <div className="flex rounded-md border bg-muted p-0.5 text-sm">
              {([
                [[1800, 4000], lang === "hi" ? "लक्ष्य क्षेत्र" : "Target zone"],
                [[0, 4200], lang === "hi" ? "पूरा कुआँ" : "Full well"],
              ] as [[number, number], string][]).map(([r, label]) => (
                <button
                  key={label}
                  onClick={() => setRange(r)}
                  className={cn("rounded px-2.5 py-1 font-medium", range[0] === r[0] ? "bg-card" : "text-muted-foreground")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">{lang === "hi" ? "कुएँ:" : "Wells:"}</span>
          <span className="rounded-md border border-primary/40 bg-accent px-2 py-1 font-mono text-xs font-semibold">{ACTIVE_WELL.id} ●</span>
          {offsetWells.map((w) => (
            <span key={w.id} className="inline-flex items-center gap-1 rounded-md border bg-background py-1 pr-1 pl-2 font-mono text-xs font-semibold">
              {w.id}
              <button onClick={() => toggleCompare(w.id)} className="rounded p-0.5 hover:bg-muted" aria-label={`Remove ${w.id}`}>
                <X className="size-3" />
              </button>
            </span>
          ))}
          <Popover>
            <PopoverTrigger className="inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-xs font-medium hover:bg-muted">
              <Plus className="size-3.5" /> {lang === "hi" ? "कुआँ जोड़ें" : "Add well"}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1">
              <p className="px-2 py-1 text-xs text-muted-foreground">
                {lang === "hi" ? `${radiusKm} किमी के भीतर` : `Within ${radiusKm} km`}
              </p>
              {offsets.map((o) => (
                <button
                  key={o.well.id}
                  onClick={() => toggleCompare(o.well.id)}
                  className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <span className="font-mono">
                    {compareIds.includes(o.well.id) ? "✓ " : ""}
                    {o.well.id}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {o.distanceKm.toFixed(1)} km · {o.well.events.length} ev
                  </span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <span className="mx-2 h-5 w-px bg-border" />
          <span className="mr-1 text-xs font-medium text-muted-foreground">{lang === "hi" ? "घटनाएँ:" : "Show:"}</span>
          {(["mud_loss", "stuck_pipe", "kick", "torque_spike", "tight_hole", "cement_issue"] as EventType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))}
              className={cn("rounded-md border transition", types.length && !types.includes(t) ? "opacity-40" : "", types.includes(t) && "ring-2 ring-primary/40")}
            >
              <EventChip type={t} />
            </button>
          ))}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[1fr_360px]">
        <div className="min-h-[560px] rounded-lg border bg-card" data-tour="correlation">
          <div ref={ref} className="h-full min-h-[560px] w-full">
            {width > 0 && (
              <svg width={width} height={height} role="img" aria-label="Formation-aligned offset well correlation">
                {/* depth axis */}
                {ticks.map((d) => (
                  <g key={d}>
                    <line x1={axisW} x2={width} y1={y(d)} y2={y(d)} className="stroke-border" strokeDasharray={d % 500 === 0 ? undefined : "2 5"} />
                    <text x={axisW - 6} y={y(d) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
                      {d}
                    </text>
                  </g>
                ))}
                <text x={6} y={headerH - 8} className="fill-muted-foreground text-[10px] font-semibold">
                  {align === "formation" ? `${ACTIVE_WELL.id}-eq. m` : "MD m"}
                </text>

                {/* connecting formation bands between neighbouring tracks */}
                {wells.slice(0, -1).map((w, i) => {
                  const n = wells[i + 1];
                  const x1 = xOf(i) + colW;
                  const x2 = xOf(i + 1);
                  return FORMATIONS.map((f, k) => {
                    const a0 = toY(w, w.formation_tops[k].top_m);
                    const a1 = toY(w, w.formation_tops[k + 1]?.top_m ?? 5000);
                    const b0 = toY(n, n.formation_tops[k].top_m);
                    const b1 = toY(n, n.formation_tops[k + 1]?.top_m ?? 5000);
                    return <path key={`${w.id}-${f.id}`} d={`M${x1},${a0} L${x2},${b0} L${x2},${b1} L${x1},${a1} Z`} fill={f.color} opacity={0.4} />;
                  });
                })}

                {/* tracks */}
                {wells.map((w, i) => {
                  const x0 = xOf(i);
                  const isActive = w.id === ACTIVE_WELL.id;
                  const o = offsets.find((o) => o.well.id === w.id);
                  return (
                    <g key={w.id}>
                      <text x={x0 + colW / 2} y={20} textAnchor="middle" className={cn("font-mono text-[13px] font-bold", isActive ? "fill-primary" : "fill-foreground")}>
                        {w.id}
                      </text>
                      <text x={x0 + colW / 2} y={36} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                        {isActive ? (lang === "hi" ? "सक्रिय · ड्रिलिंग" : "Active · drilling") : o ? `${o.distanceKm.toFixed(1)} km ${o.compass}` : ""}
                      </text>
                      <clipPath id={`clip-${w.id}`}>
                        <rect x={x0} y={headerH} width={colW} height={plotH} />
                      </clipPath>
                      <g clipPath={`url(#clip-${w.id})`}>
                        {FORMATIONS.map((f, k) => {
                          const y0 = toY(w, w.formation_tops[k].top_m);
                          const y1 = toY(w, w.formation_tops[k + 1]?.top_m ?? 5000);
                          return (
                            <g key={f.id}>
                              <rect x={x0} y={y0} width={colW} height={Math.max(0, y1 - y0)} fill={f.color} />
                              {y1 - y0 > 18 && y0 > headerH - 10 && (
                                <text x={x0 + 4} y={Math.max(y0, headerH) + 12} className="text-[9px] font-semibold" fill="rgba(0,0,0,.6)">
                                  {tx(f.name, f.nameHi)} · {w.formation_tops[k].top_m}
                                </text>
                              )}
                            </g>
                          );
                        })}
                        {/* TD / undrilled */}
                        {isActive ? (
                          <>
                            <rect x={x0} y={y(depth)} width={colW} height={Math.max(0, y(bottom) - y(depth))} fill="url(#hatch)" />
                            <line x1={x0 - 4} x2={x0 + colW + 4} y1={y(depth)} y2={y(depth)} stroke="var(--live)" strokeWidth={3} />
                          </>
                        ) : (
                          <rect x={x0} y={toY(w, w.total_depth_m)} width={colW} height={Math.max(0, y(bottom) - toY(w, w.total_depth_m))} className="fill-card" />
                        )}
                        {/* events */}
                        {w.events.filter(show).map((e) => {
                          const m = EVENT_META[e.type];
                          const ey = toY(w, e.depth_m);
                          return (
                            <g key={e.id} className="cursor-pointer" onClick={() => setSel(e)}>
                              <rect x={x0 + 3} y={ey - 9} width={colW - 6} height={18} rx={4} fill="white" stroke={m.color} strokeWidth={sel?.id === e.id ? 2.5 : 1.2} />
                              <circle cx={x0 + 12} cy={ey} r={4.5} fill={m.color} />
                              <text x={x0 + 21} y={ey + 3.5} className="text-[10px] font-semibold" fill="#1b2533">
                                {m.short} · {e.depth_m}
                              </text>
                              <title>{`${m.label} @ ${e.depth_m} m (${e.formation}) — ${e.details}`}</title>
                            </g>
                          );
                        })}
                      </g>
                      <rect x={x0} y={headerH} width={colW} height={plotH} fill="none" className={isActive ? "stroke-primary" : "stroke-border"} strokeWidth={isActive ? 2 : 1} />
                    </g>
                  );
                })}
                <defs>
                  <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="8" height="8" fill="var(--card)" opacity={0.65} />
                    <line x1="0" y1="0" x2="0" y2="8" stroke="var(--muted-foreground)" strokeWidth="1" opacity={0.35} />
                  </pattern>
                </defs>
              </svg>
            )}
          </div>
        </div>

        <aside className="space-y-3">
          <section className="rounded-lg border bg-card p-3">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Lightbulb className="size-4 text-risk-med" /> {lang === "hi" ? "पाए गए पैटर्न" : "Patterns found"}
            </h2>
            <ul className="mt-2 space-y-2">
              {insights.length === 0 && <li className="text-sm text-muted-foreground">{lang === "hi" ? "और कुएँ जोड़ें।" : "Add more wells to find repeated patterns."}</li>}
              {insights.map((ins) => (
                <li key={ins.type + ins.formation} className="rounded-md bg-muted/60 p-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <EventChip type={ins.type} />
                    <span className="font-semibold">
                      {ins.wells.length}/{ins.total} {lang === "hi" ? "कुएँ" : "wells"}
                    </span>
                  </div>
                  <p className="mt-1 leading-snug">
                    {lang === "hi"
                      ? `${ins.formation} शीर्ष से औसतन ${ins.avgBelowTop} मी. नीचे ${EVENT_META[ins.type].labelHi}। कुल NPT ${ins.npt} घं.`
                      : `${EVENT_META[ins.type].label} on average ${ins.avgBelowTop >= 0 ? `${ins.avgBelowTop} m below` : `${-ins.avgBelowTop} m above`} the ${ins.formation} top. Total NPT ${ins.npt} h.`}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{ins.wells.join(", ")}</p>
                </li>
              ))}
            </ul>
          </section>
          {sel ? (
            <EventCard event={sel} showWell />
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              {lang === "hi" ? "विवरण के लिए किसी घटना पर क्लिक करें।" : "Click any event marker to see what happened, what was done and the source report."}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
