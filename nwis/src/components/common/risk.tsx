"use client";

import { cn } from "@/lib/utils";
import { EVENT_META, RISK_LABEL, riskLevel, STATUS_META, type RiskLevel } from "@/lib/event-meta";
import type { EventType, WellStatus } from "@/data/types";
import { useI18n } from "@/lib/i18n";

const LEVEL_CLS: Record<RiskLevel, string> = {
  low: "bg-risk-low-bg text-risk-low border-risk-low/30",
  med: "bg-risk-med-bg text-risk-med border-risk-med/40",
  high: "bg-risk-high-bg text-risk-high border-risk-high/40",
};

export function RiskBadge({ p, level, className, showPct = true }: { p?: number; level?: RiskLevel; className?: string; showPct?: boolean }) {
  const { lang } = useI18n();
  const lv = level ?? riskLevel(p ?? 0);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        LEVEL_CLS[lv],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {RISK_LABEL[lv][lang]}
      {showPct && p != null && <span className="tabular font-mono">{Math.round(p * 100)}%</span>}
    </span>
  );
}

export function EventChip({ type, className, compact }: { type: EventType; className?: string; compact?: boolean }) {
  const { lang } = useI18n();
  const m = EVENT_META[type];
  const Icon = m.icon;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", className)}
      style={{ color: m.color, background: `color-mix(in oklch, ${m.color} 12%, transparent)` }}
    >
      <Icon className="size-3.5" aria-hidden />
      {!compact && (lang === "hi" ? m.labelHi : m.label)}
    </span>
  );
}

export function StatusDot({ status, withLabel, className }: { status: WellStatus; withLabel?: boolean; className?: string }) {
  const { lang } = useI18n();
  const m = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span
        className={cn("size-2.5 rounded-full", status === "planned" && "border-2 bg-transparent!")}
        style={{ background: m.color, borderColor: m.color }}
        aria-hidden
      />
      {withLabel && <span>{lang === "hi" ? m.labelHi : m.label}</span>}
    </span>
  );
}

export function RiskMeter({ p, className }: { p: number; className?: string }) {
  const lv = riskLevel(p);
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)} role="meter" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", lv === "high" ? "bg-risk-high" : lv === "med" ? "bg-risk-med" : "bg-risk-low")}
        style={{ width: `${Math.max(4, Math.round(p * 1000) / 10)}%` }}
      />
    </div>
  );
}
