"use client";

import { useMemo } from "react";
import type { LiveSample } from "@/lib/live";
import type { ProfileRow } from "@/lib/risk";
import { ACTIVE_WELL } from "@/data/wells";
import { FORMATIONS } from "@/data/formations";
import { EVENT_META } from "@/lib/event-meta";
import { useSize } from "@/hooks/use-size";
import { useI18n } from "@/lib/i18n";
import type { EventType } from "@/data/types";

interface Track {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  series: { get: (s: LiveSample) => number; color: string; name: string; dash?: string }[];
}

const TRACKS: Track[] = [
  { key: "rop", label: "ROP", unit: "m/h", min: 0, max: 40, series: [{ get: (s) => s.rop, color: "#2E8B57", name: "ROP" }] },
  { key: "torque", label: "Torque", unit: "kN·m", min: 8, max: 34, series: [{ get: (s) => s.torque, color: "#D9730D", name: "Torque" }] },
  { key: "spp", label: "SPP", unit: "bar", min: 180, max: 280, series: [{ get: (s) => s.spp, color: "#6B7A8F", name: "SPP" }] },
  {
    key: "flow",
    label: "Flow in / out",
    unit: "lpm",
    min: 1500,
    max: 2300,
    series: [
      { get: (s) => s.flowIn, color: "#8A94A6", name: "In", dash: "4 3" },
      { get: (s) => s.flowOut, color: "#2F7FD8", name: "Out" },
    ],
  },
  {
    key: "pit",
    label: "Pit gain / Gas",
    unit: "bbl · %",
    min: 0,
    max: 10,
    series: [
      { get: (s) => s.pitGain, color: "#D63B2F", name: "Pit" },
      { get: (s) => s.gas, color: "#9C2F6A", name: "Gas", dash: "3 2" },
    ],
  },
];

const RISK_COLS: EventType[] = ["mud_loss", "stuck_pipe", "kick"];

export function DepthTracks({
  history,
  depth,
  profile,
  above = 260,
  below = 200,
}: {
  history: LiveSample[];
  depth: number;
  profile: ProfileRow[];
  above?: number;
  below?: number;
}) {
  const [ref, { width, height }] = useSize<HTMLDivElement>();
  const { lang } = useI18n();
  const top = depth - above;
  const bottom = depth + below;
  const headerH = 44;
  const plotH = Math.max(100, height - headerH);
  const y = (d: number) => headerH + ((d - top) / (bottom - top)) * plotH;

  const axisW = 52;
  const fmW = 74;
  const riskW = 104;
  const trackW = Math.max(70, (width - axisW - fmW - riskW) / TRACKS.length);

  const visible = useMemo(() => history.filter((s) => s.depth >= top - 2 && s.depth <= depth), [history, top, depth]);
  const ticks = [];
  for (let d = Math.ceil(top / 50) * 50; d <= bottom; d += 50) ticks.push(d);

  return (
    <div ref={ref} className="relative h-full min-h-[420px] w-full overflow-hidden">
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Live drilling depth tracks with look-ahead risk">
          {/* look-ahead zone */}
          <rect x={0} y={y(depth)} width={width} height={y(bottom) - y(depth)} className="fill-muted/60" />
          <text x={axisW + fmW + 8} y={y(depth) + 16} className="fill-muted-foreground text-[11px] font-semibold">
            {lang === "hi" ? "आगे — ऑफ़सेट कुओं से अनुमानित" : "Ahead — predicted from offset wells"}
          </text>

          {/* depth axis */}
          {ticks.map((d) => (
            <g key={d}>
              <line x1={axisW} x2={width} y1={y(d)} y2={y(d)} className="stroke-border" strokeDasharray={d % 100 === 0 ? undefined : "2 4"} />
              <text x={axisW - 6} y={y(d) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[10px]">
                {d}
              </text>
            </g>
          ))}

          {/* formations */}
          {ACTIVE_WELL.formation_tops.map((t, i) => {
            const b = ACTIVE_WELL.formation_tops[i + 1]?.top_m ?? 5000;
            if (b < top || t.top_m > bottom) return null;
            const y1 = y(Math.max(t.top_m, top));
            const y2 = y(Math.min(b, bottom));
            return (
              <g key={t.id}>
                <rect x={axisW} y={y1} width={fmW} height={y2 - y1} fill={FORMATIONS[i].color} />
                {t.top_m >= top && (
                  <>
                    <line x1={axisW} x2={width} y1={y(t.top_m)} y2={y(t.top_m)} stroke={FORMATIONS[i].color} strokeWidth={2} />
                    <text x={width - 6} y={y(t.top_m) - 4} textAnchor="end" className="fill-foreground text-[10px] font-semibold">
                      {FORMATIONS[i].name} top · {t.top_m} m
                    </text>
                  </>
                )}
                <text x={axisW + 5} y={Math.max(y1 + 13, headerH + 13)} className="text-[10px] font-semibold" fill="rgba(0,0,0,.72)">
                  {lang === "hi" ? FORMATIONS[i].nameHi : FORMATIONS[i].name.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {/* parameter tracks */}
          {TRACKS.map((tr, i) => {
            const x0 = axisW + fmW + i * trackW;
            const sx = (v: number) => x0 + 4 + ((Math.min(tr.max, Math.max(tr.min, v)) - tr.min) / (tr.max - tr.min)) * (trackW - 8);
            return (
              <g key={tr.key}>
                <line x1={x0} x2={x0} y1={0} y2={height} className="stroke-border" />
                <text x={x0 + trackW / 2} y={16} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
                  {tr.label}
                </text>
                <text x={x0 + trackW / 2} y={30} textAnchor="middle" className="fill-muted-foreground text-[9px]">
                  {tr.min}–{tr.max} {tr.unit}
                </text>
                {tr.series.map((s) => (
                  <polyline
                    key={s.name}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={1.6}
                    strokeDasharray={s.dash}
                    strokeLinejoin="round"
                    points={visible.map((p) => `${sx(s.get(p)).toFixed(1)},${y(p.depth).toFixed(1)}`).join(" ")}
                  />
                ))}
                {visible.length > 0 &&
                  tr.series.map((s, k) => (
                    <text
                      key={s.name}
                      x={x0 + trackW - 4}
                      y={y(depth) - 6 - k * 12}
                      textAnchor="end"
                      className="font-mono text-[10px] font-semibold"
                      fill={s.color}
                    >
                      {s.get(visible[visible.length - 1]).toFixed(tr.key === "pit" ? 1 : 0)}
                    </text>
                  ))}
              </g>
            );
          })}

          {/* predicted risk columns */}
          {(() => {
            const x0 = axisW + fmW + TRACKS.length * trackW;
            const cw = (riskW - 8) / RISK_COLS.length;
            const rows = profile.filter((r) => r.depth >= top - 10 && r.depth <= bottom + 10);
            return (
              <g>
                <line x1={x0} x2={x0} y1={0} y2={height} className="stroke-border" />
                <text x={x0 + riskW / 2} y={16} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
                  {lang === "hi" ? "अनुमानित जोखिम" : "Predicted risk"}
                </text>
                {RISK_COLS.map((t, k) => (
                  <text key={t} x={x0 + 4 + k * cw + cw / 2} y={30} textAnchor="middle" className="text-[9px] font-semibold" fill={EVENT_META[t].color}>
                    {EVENT_META[t].short}
                  </text>
                ))}
                {rows.map((r) =>
                  RISK_COLS.map((t, k) => {
                    const p = r[t];
                    if (p < 0.05) return null;
                    return (
                      <rect
                        key={`${r.depth}-${t}`}
                        x={x0 + 4 + k * cw + 1}
                        y={y(r.depth - 5)}
                        width={cw - 2}
                        height={Math.max(1, y(r.depth + 5) - y(r.depth - 5))}
                        fill={p >= 0.6 ? "#CE3A2C" : p >= 0.35 ? "#D69614" : "#2E8B57"}
                        opacity={0.25 + p * 0.75}
                      />
                    );
                  }),
                )}
              </g>
            );
          })()}

          {/* bit position */}
          <line x1={axisW} x2={width} y1={y(depth)} y2={y(depth)} stroke="var(--live)" strokeWidth={2.5} />
          <g transform={`translate(${axisW - 50}, ${y(depth) - 10})`}>
            <rect width={48} height={20} rx={4} fill="var(--live)" />
            <text x={24} y={14} textAnchor="middle" className="font-mono text-[11px] font-bold" fill="white">
              {Math.round(depth)}
            </text>
          </g>
          <line x1={0} x2={width} y1={headerH} y2={headerH} className="stroke-border" />
        </svg>
      )}
    </div>
  );
}
