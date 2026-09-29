"use client";

import { useRouter } from "next/navigation";
import { Check, CheckCheck, MapPinned, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventChip, RiskBadge } from "@/components/common/risk";
import { useApp, type NwisAlert } from "@/store/app";
import { alertSummary, alertTitle } from "@/lib/alert-text";
import { useI18n } from "@/lib/i18n";
import { WELL_BY_ID } from "@/data/wells";
import { cn } from "@/lib/utils";

export function useShowEvidence() {
  const router = useRouter();
  return (wells: string[]) => {
    const st = useApp.getState();
    st.setHighlight(wells);
    const ws = wells.map((id) => WELL_BY_ID[id]).filter(Boolean);
    if (ws.length) {
      const lat = ws.reduce((s, w) => s + w.lat, 0) / ws.length;
      const lng = ws.reduce((s, w) => s + w.lng, 0) / ws.length;
      st.flyTo(lng, lat, 12.6);
    }
    router.push("/map");
  };
}

export function AlertCard({ alert, compact = false, className }: { alert: NwisAlert; compact?: boolean; className?: string }) {
  const { t, lang } = useI18n();
  const ack = useApp((s) => s.ackAlert);
  const apply = useApp((s) => s.applyAlert);
  const showEvidence = useShowEvidence();
  const high = alert.level === "high";

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-3 text-card-foreground",
        high && alert.status === "new" && "border-risk-high/50 ring-1 ring-risk-high/20",
        alert.status === "applied" && "opacity-80",
        className,
      )}
      aria-label={alertTitle(alert, lang)}
    >
      <header className="flex items-start gap-2">
        <div
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md",
            high ? "bg-risk-high-bg text-risk-high" : alert.level === "med" ? "bg-risk-med-bg text-risk-med" : "bg-risk-low-bg text-risk-low",
          )}
        >
          {alert.kind === "realtime" ? <Radio className="size-4" /> : <Sparkles className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-sm leading-tight font-semibold">{alertTitle(alert, lang)}</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {alert.kind === "realtime" ? t("realtime") : t("predictive")} · {t("bitDepth")} {Math.round(alert.raisedAtDepth).toLocaleString("en-IN")} m
          </p>
        </div>
        <RiskBadge level={alert.level} showPct={false} />
      </header>

      <p className="mt-2 text-sm leading-snug">{alertSummary(alert, lang)}</p>

      {!compact && (
        <>
          <div className="mt-2 rounded-md bg-muted/70 p-2.5">
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">{t("recommendation")}</p>
            <p className="mt-0.5 text-sm leading-snug">{alert.recommendation}</p>
            {alert.provenFix && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{t("provenFix")} ({alert.provenFix.wellId}, NPT {alert.provenFix.npt} h):</span>{" "}
                {alert.provenFix.action}
              </p>
            )}
          </div>
          {alert.wells.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="mr-1 text-xs text-muted-foreground">{t("evidence")}:</span>
              <EventChip type={alert.type} compact />
              {alert.wells.map((w) => (
                <span key={w} className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px]">
                  {w}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      <footer className="mt-3 flex flex-wrap gap-2">
        {alert.status === "applied" ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-risk-low">
            <CheckCheck className="size-4" /> {t("applied")}
          </span>
        ) : (
          <>
            <Button size="sm" onClick={() => apply(alert.id)}>
              <CheckCheck /> {t("apply")}
            </Button>
            {alert.status === "new" ? (
              <Button size="sm" variant="outline" onClick={() => ack(alert.id)}>
                <Check /> {t("acknowledge")}
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Check className="size-3.5" /> {t("acknowledged")}
              </span>
            )}
          </>
        )}
        {alert.wells.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => showEvidence(alert.wells)}>
            <MapPinned /> {t("viewEvidence")}
          </Button>
        )}
      </footer>
    </article>
  );
}
