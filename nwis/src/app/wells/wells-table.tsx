"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp } from "lucide-react";
import { ACTIVE_WELL, WELLS } from "@/data/wells";
import type { WellStatus } from "@/data/types";
import { distanceKm, compass, bearingDeg } from "@/lib/geo";
import { EventChip, RiskMeter, StatusDot } from "@/components/common/risk";
import { STATUS_META } from "@/lib/event-meta";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SortKey = "distance" | "risk" | "npt" | "td" | "spud";

export function WellsTable() {
  const { t, lang } = useI18n();
  const [sort, setSort] = useState<SortKey>("distance");
  const [status, setStatus] = useState<WellStatus | "all">("all");

  const rows = useMemo(() => {
    const list = WELLS.map((w) => ({ w, d: distanceKm(ACTIVE_WELL, w) })).filter((r) => status === "all" || r.w.status === status);
    const key: Record<SortKey, (r: (typeof list)[number]) => number> = {
      distance: (r) => r.d,
      risk: (r) => -r.w.risk_score,
      npt: (r) => -r.w.npt_total_h,
      td: (r) => -r.w.total_depth_m,
      spud: (r) => -(r.w.spud_date ? Date.parse(r.w.spud_date) : 0),
    };
    return list.sort((a, b) => key[sort](a) - key[sort](b));
  }, [sort, status]);

  const Th = ({ k, children, className }: { k?: SortKey; children: React.ReactNode; className?: string }) => (
    <th className={cn("px-3 py-2 text-left text-xs font-semibold text-muted-foreground", className)}>
      {k ? (
        <button onClick={() => setSort(k)} className={cn("inline-flex items-center gap-1 hover:text-foreground", sort === k && "text-foreground")}>
          {children} <ArrowDownUp className="size-3" />
        </button>
      ) : (
        children
      )}
    </th>
  );

  return (
    <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("nav_wells")}</h1>
      <p className="mt-1 text-muted-foreground">
        {lang === "hi" ? "हर कुएँ का इतिहास, घटनाएँ, केसिंग, मड और दस्तावेज़ — एक जगह।" : "Every well's history, events, casing, mud and documents in one place."}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {(["all", ...Object.keys(STATUS_META)] as (WellStatus | "all")[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn("rounded-full border px-3 py-1 text-sm", status === s ? "border-primary bg-accent font-medium text-accent-foreground" : "bg-card hover:bg-muted")}
          >
            {s === "all" ? (lang === "hi" ? "सभी" : "All") : lang === "hi" ? STATUS_META[s].labelHi : STATUS_META[s].label}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <Th>{lang === "hi" ? "कुआँ" : "Well"}</Th>
              <Th>{t("status")}</Th>
              <Th k="distance">{t("distance")}</Th>
              <Th k="td">{t("totalDepth")}</Th>
              <Th k="spud">{t("spud")}</Th>
              <Th>{lang === "hi" ? "मुख्य घटनाएँ" : "Key events"}</Th>
              <Th k="npt">NPT</Th>
              <Th k="risk" className="w-40">{t("riskScore")}</Th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(({ w, d }) => (
              <tr key={w.id} className={cn("group hover:bg-muted/50", w.id === ACTIVE_WELL.id && "bg-accent/40")}>
                <td className="px-3 py-2.5">
                  <Link href={`/wells/${w.id}`} className="font-mono font-semibold text-primary group-hover:underline">
                    {w.id}
                  </Link>
                  <p className="text-xs text-muted-foreground">{w.profile}</p>
                </td>
                <td className="px-3 py-2.5">
                  <StatusDot status={w.status} withLabel />
                </td>
                <td className="px-3 py-2.5 font-mono tabular">{w.id === ACTIVE_WELL.id ? "—" : `${d.toFixed(2)} km ${compass(bearingDeg(ACTIVE_WELL, w))}`}</td>
                <td className="px-3 py-2.5 font-mono tabular">{w.total_depth_m.toLocaleString("en-IN")} m</td>
                <td className="px-3 py-2.5 font-mono tabular">{w.spud_date ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(w.events.map((e) => e.type))].slice(0, 3).map((ty) => (
                      <EventChip key={ty} type={ty} />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono tabular">{w.npt_total_h} h</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <RiskMeter p={w.risk_score} className="w-20" />
                    <span className="font-mono text-xs tabular">{Math.round(w.risk_score * 100)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
