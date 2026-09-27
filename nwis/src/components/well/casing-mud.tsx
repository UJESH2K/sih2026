"use client";

import type { Well } from "@/data/types";
import { FORMATIONS } from "@/data/formations";
import { useI18n } from "@/lib/i18n";

/** Wellbore schematic (nested casing strings) + mud weight vs depth, same depth scale. */
export function CasingMud({ well, height = 460 }: { well: Well; height?: number }) {
  const { lang } = useI18n();
  const td = Math.ceil((well.total_depth_m + 100) / 500) * 500;
  const y = (d: number) => 16 + (d / td) * (height - 32);
  const ticks = Array.from({ length: Math.floor(td / 500) + 1 }, (_, i) => i * 500);
  const W = 180;
  const cx = 110;
  const mwMin = 1.0;
  const mwMax = 1.45;
  const mx = (mw: number) => 210 + ((mw - mwMin) / (mwMax - mwMin)) * 170;

  const mwPath = well.mud_program
    .map((m, i) => `${i === 0 ? "M" : "L"}${mx(m.mw_sg)},${y(m.from_m)} L${mx(m.mw_sg)},${y(m.to_m)}`)
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 400 ${height}`} className="h-auto w-full max-w-[520px] min-w-[360px]" role="img" aria-label={`Casing and mud program for ${well.id}`}>
        {/* formation shading */}
        {well.formation_tops.map((t, i) => {
          const bottom = Math.min(well.formation_tops[i + 1]?.top_m ?? td, td);
          if (t.top_m >= td) return null;
          return <rect key={t.id} x={44} y={y(t.top_m)} width={W - 8} height={y(bottom) - y(t.top_m)} fill={FORMATIONS[i].color} opacity={0.35} />;
        })}
        {/* depth ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={40} x2={392} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="2 3" />
            <text x={36} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[9px]">
              {t}
            </text>
          </g>
        ))}
        {/* open hole */}
        <rect x={cx - 5} y={y(0)} width={10} height={y(well.total_depth_m) - y(0)} className="fill-muted-foreground/25" />
        {/* casing strings */}
        {well.casing.map((c, i) => {
          const half = 8 + (well.casing.length - 1 - i) * 7;
          const col = c.cement_result === "good" ? "#8a8f98" : c.cement_result === "partial" ? "#d49a1a" : "#d0432f";
          return (
            <g key={c.name}>
              {/* cement sheath */}
              <rect x={cx - half - 4} y={y(c.toc_m)} width={4} height={y(c.shoe_m) - y(c.toc_m)} fill={col} opacity={0.35} />
              <rect x={cx + half} y={y(c.toc_m)} width={4} height={y(c.shoe_m) - y(c.toc_m)} fill={col} opacity={0.35} />
              <line x1={cx - half} x2={cx - half} y1={y(0)} y2={y(c.shoe_m)} className="stroke-foreground" strokeWidth={2} />
              <line x1={cx + half} x2={cx + half} y1={y(0)} y2={y(c.shoe_m)} className="stroke-foreground" strokeWidth={2} />
              <path d={`M${cx - half},${y(c.shoe_m)} l-6,0 l6,-7 z M${cx + half},${y(c.shoe_m)} l6,0 l-6,-7 z`} className="fill-foreground" />
              <text x={cx + half + 8} y={y(c.shoe_m) + 3} className="fill-foreground text-[9px] font-semibold">
                {c.size_label} @ {c.shoe_m.toLocaleString("en-IN")}
              </text>
            </g>
          );
        })}
        {/* mud weight panel */}
        <text x={295} y={10} textAnchor="middle" className="fill-muted-foreground text-[9px] font-semibold uppercase">
          {lang === "hi" ? "मड वज़न (sg)" : "Mud weight (sg)"}
        </text>
        {[1.1, 1.2, 1.3, 1.4].map((v) => (
          <g key={v}>
            <line x1={mx(v)} x2={mx(v)} y1={y(0)} y2={y(td)} className="stroke-border" />
            <text x={mx(v)} y={height - 4} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        <path d={mwPath} fill="none" stroke="var(--chart-1)" strokeWidth={2.5} />
        {well.mud_program.map((m) => (
          <text key={m.from_m} x={mx(m.mw_sg) + 5} y={(y(m.from_m) + y(m.to_m)) / 2} className="fill-foreground font-mono text-[9px]">
            {m.mw_sg.toFixed(2)} · {m.type}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 bg-[#8a8f98]/50" /> {lang === "hi" ? "सीमेंट अच्छा" : "Cement good"}</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 bg-[#d49a1a]/50" /> {lang === "hi" ? "आंशिक" : "Partial bond"}</span>
        <span className="inline-flex items-center gap-1"><span className="h-0.5 w-4 bg-chart-1" /> MW</span>
      </div>
    </div>
  );
}
