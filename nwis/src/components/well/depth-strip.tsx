"use client";

import { FORMATIONS } from "@/data/formations";
import type { DrillingEvent, Well } from "@/data/types";
import { EVENT_META } from "@/lib/event-meta";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Vertical depth track: formation bands, casing shoes and event markers.
 * The most "engineering" view — reads like a mud log.
 */
export function DepthStrip({
  well,
  height = 520,
  maxDepth,
  currentDepth,
  onEventClick,
  selectedEventId,
  className,
}: {
  well: Well;
  height?: number;
  maxDepth?: number;
  currentDepth?: number;
  onEventClick?: (e: DrillingEvent) => void;
  selectedEventId?: string;
  className?: string;
}) {
  const { tx, lang } = useI18n();
  const td = maxDepth ?? Math.ceil((well.total_depth_m + 100) / 500) * 500;
  const y = (d: number) => (d / td) * height;
  const tops = well.formation_tops;
  const ticks = Array.from({ length: Math.floor(td / 500) + 1 }, (_, i) => i * 500);

  return (
    <div className={cn("flex gap-0 text-xs select-none", className)} style={{ height }} role="img" aria-label={`Depth strip for ${well.id}`}>
      {/* depth axis */}
      <div className="relative w-12 shrink-0 border-r">
        {ticks.map((t) => (
          <div key={t} className="absolute right-0 flex -translate-y-1/2 items-center gap-1 pr-1" style={{ top: y(t) }}>
            <span className="font-mono text-[10px] text-muted-foreground tabular">{t}</span>
            <span className="h-px w-1.5 bg-muted-foreground/60" />
          </div>
        ))}
      </div>

      {/* formation column */}
      <div className="relative w-28 shrink-0 overflow-hidden border-r">
        {tops.map((t, i) => {
          const f = FORMATIONS[i];
          const bottom = Math.min(tops[i + 1]?.top_m ?? td, td);
          if (t.top_m >= td) return null;
          const h = y(bottom) - y(t.top_m);
          return (
            <div
              key={t.id}
              className="absolute inset-x-0 border-b border-black/10 px-1.5 pt-0.5"
              style={{ top: y(t.top_m), height: h, background: f.color }}
              title={`${f.name}: ${t.top_m}–${bottom} m · ${f.lithology}`}
            >
              {h > 16 && <span className="text-[10px] leading-tight font-semibold text-black/75">{tx(f.name, f.nameHi)}</span>}
              {h > 30 && <span className="block font-mono text-[9px] text-black/55">{t.top_m} m</span>}
            </div>
          );
        })}
        {/* drilled / planned divider */}
        {currentDepth != null && (
          <>
            <div className="absolute inset-x-0 bg-background/70 backdrop-grayscale" style={{ top: y(currentDepth), bottom: 0 }} />
            <div className="absolute inset-x-0 h-0.5 bg-live" style={{ top: y(currentDepth) }} />
          </>
        )}
      </div>

      {/* wellbore + casing */}
      <div className="relative w-10 shrink-0 border-r">
        <div className="absolute top-0 left-1/2 w-1.5 -translate-x-1/2 rounded-b bg-muted-foreground/25" style={{ height: y(currentDepth ?? well.total_depth_m) }} />
        {well.casing.map((c, i) => (
          <Tooltip key={c.name}>
            <TooltipTrigger
              render={
                <div
                  className="absolute left-1/2 -translate-x-1/2 border-x-2 border-foreground/60"
                  style={{ top: 0, height: y(Math.min(c.shoe_m, currentDepth ?? c.shoe_m)), width: 10 + (well.casing.length - i) * 5 }}
                >
                  <span className="absolute -bottom-1 -left-[5px] border-t-[6px] border-r-[5px] border-t-transparent border-r-foreground/70" />
                  <span className="absolute -right-[5px] -bottom-1 border-t-[6px] border-l-[5px] border-t-transparent border-l-foreground/70" />
                </div>
              }
            />
            <TooltipContent>
              {c.size_label} {c.name} — shoe {c.shoe_m.toLocaleString("en-IN")} m · cement {c.cement_result}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* events */}
      <div className="relative min-w-40 flex-1">
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-dashed border-border" style={{ top: y(t) }} />
        ))}
        {spread(well.events, y).map(({ e, top }) => {
          const m = EVENT_META[e.type];
          const Icon = m.icon;
          return (
            <button
              key={e.id}
              onClick={() => onEventClick?.(e)}
              className={cn(
                "absolute left-1 flex max-w-[calc(100%-8px)] -translate-y-1/2 items-center gap-1 rounded border bg-card px-1 py-0.5 text-left transition hover:z-10 hover:shadow-md",
                selectedEventId === e.id && "z-10 ring-2 ring-primary",
              )}
              style={{ top, borderColor: m.color }}
              title={`${m.label} @ ${e.depth_m} m — ${e.details}`}
            >
              <span className="absolute top-1/2 -left-1 h-px w-1" style={{ background: m.color }} />
              <Icon className="size-3.5 shrink-0" style={{ color: m.color }} />
              <span className="truncate text-[11px] font-medium">{lang === "hi" ? m.labelHi : m.short}</span>
              <span className="font-mono text-[10px] text-muted-foreground tabular">{e.depth_m}</span>
            </button>
          );
        })}
        {currentDepth != null && (
          <div className="absolute inset-x-0 flex -translate-y-1/2 items-center gap-1" style={{ top: y(currentDepth) }}>
            <span className="h-0.5 flex-1 bg-live" />
            <span className="rounded bg-live px-1 font-mono text-[10px] font-semibold text-white tabular">{Math.round(currentDepth)} m</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Avoid overlapping labels by nudging markers apart. */
function spread(events: DrillingEvent[], y: (d: number) => number) {
  const sorted = [...events].sort((a, b) => a.depth_m - b.depth_m);
  const out: { e: DrillingEvent; top: number }[] = [];
  let lastTop = -100;
  for (const e of sorted) {
    const top = Math.max(y(e.depth_m), lastTop + 22);
    out.push({ e, top });
    lastTop = top;
  }
  return out;
}
