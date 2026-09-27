"use client";

import { useMemo } from "react";
import { ACTIVE_WELL } from "@/data/wells";
import { FORMATIONS } from "@/data/formations";
import { getOffsets, riskProfile } from "@/lib/risk";
import { EVENT_META } from "@/lib/event-meta";
import { useApp } from "@/store/app";
import { useI18n } from "@/lib/i18n";
import { useSize } from "@/hooks/use-size";
import type { EventType } from "@/data/types";

const ROWS: EventType[] = ["mud_loss", "stuck_pipe", "kick", "torque_spike", "tight_hole"];

/** Horizontal "risk along the remaining well path" chart for the active well. */
export function RiskRibbon({ from, to }: { from: number; to: number }) {
  const radiusKm = useApp((s) => s.radiusKm);
  const depth = useApp((s) => s.depth);
  const { lang, tx } = useI18n();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const profile = useMemo(() => riskProfile(ACTIVE_WELL, getOffsets(ACTIVE_WELL, radiusKm), from, to, 10), [radiusKm, from, to]);
  const labelW = 110;
  const W = Math.max(300, width);
  const x = (d: number) => labelW + ((d - from) / (to - from)) * (W - labelW - 8);
  const rowH = 22;
  const fmH = 26;
  const H = fmH + ROWS.length * rowH + 26;

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
      <svg width={W} height={H} role="img" aria-label="Predicted risk along the remaining well path">
        {/* formations */}
        {ACTIVE_WELL.formation_tops.map((t, i) => {
          const b = ACTIVE_WELL.formation_tops[i + 1]?.top_m ?? 5000;
          if (b < from || t.top_m > to) return null;
          const x1 = x(Math.max(from, t.top_m));
          const x2 = x(Math.min(to, b));
          return (
            <g key={t.id}>
              <rect x={x1} y={0} width={x2 - x1} height={fmH} fill={FORMATIONS[i].color} />
              {x2 - x1 > 60 && (
                <text x={x1 + 6} y={17} className="text-[11px] font-semibold" fill="rgba(0,0,0,.75)">
                  {tx(FORMATIONS[i].name, FORMATIONS[i].nameHi)}
                </text>
              )}
            </g>
          );
        })}
        <text x={0} y={17} className="fill-muted-foreground text-[11px] font-semibold">
          {lang === "hi" ? "संरचना" : "Formation"}
        </text>
        {ROWS.map((type, r) => {
          const y0 = fmH + 4 + r * rowH;
          return (
            <g key={type}>
              <text x={0} y={y0 + 14} className="text-[11px] font-medium" fill={EVENT_META[type].color}>
                {lang === "hi" ? EVENT_META[type].labelHi : EVENT_META[type].label}
              </text>
              <rect x={labelW} y={y0 + 2} width={W - labelW - 8} height={rowH - 6} rx={3} className="fill-muted" />
              {profile.map((p) =>
                p[type] >= 0.08 ? (
                  <rect
                    key={p.depth}
                    x={x(p.depth - 5)}
                    y={y0 + 2}
                    width={Math.max(1, x(p.depth + 5) - x(p.depth - 5))}
                    height={rowH - 6}
                    fill={p[type] >= 0.6 ? "#CE3A2C" : p[type] >= 0.35 ? "#D69614" : "#7FB38F"}
                    opacity={0.3 + p[type] * 0.7}
                  >
                    <title>{`${EVENT_META[type].label} ${Math.round(p[type] * 100)}% @ ${p.depth} m`}</title>
                  </rect>
                ) : null,
              )}
            </g>
          );
        })}
        {/* axis */}
        {Array.from({ length: Math.floor((to - from) / 250) + 1 }, (_, i) => from + i * 250).map((d) => (
          <text key={d} x={x(d)} y={H - 6} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
            {d}
          </text>
        ))}
        {depth >= from && depth <= to && (
          <g>
            <line x1={x(depth)} x2={x(depth)} y1={0} y2={H - 18} stroke="var(--live)" strokeWidth={2.5} />
            <rect x={x(depth) - 22} y={H - 20} width={44} height={16} rx={3} fill="var(--live)" />
            <text x={x(depth)} y={H - 8} textAnchor="middle" className="font-mono text-[10px] font-bold" fill="white">
              {Math.round(depth)}
            </text>
          </g>
        )}
      </svg>
      )}
    </div>
  );
}
