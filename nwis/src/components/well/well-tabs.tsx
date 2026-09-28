"use client";

import { useState } from "react";
import type { Well } from "@/data/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { ACTIVE_WELL } from "@/data/wells";
import { distanceKm, bearingDeg, compass } from "@/lib/geo";
import { EventChip, RiskMeter, StatusDot } from "@/components/common/risk";
import { DepthStrip } from "./depth-strip";
import { EventCard } from "./event-card";
import { CasingMud } from "./casing-mud";
import { TimeDepthChart } from "./time-depth-chart";
import { DocumentsList } from "./documents-list";
import { useApp } from "@/store/app";
import { EVENT_META } from "@/lib/event-meta";
import { cn } from "@/lib/utils";

export type WellTab = "overview" | "depth" | "timeline" | "casing" | "events" | "docs";

function Stat({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="rounded-md border bg-card px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-semibold", mono && "font-mono tabular")}>{value}</p>
    </div>
  );
}

export function WellOverview({ well }: { well: Well }) {
  const { t, lang } = useI18n();
  const liveDepth = useApp((s) => s.depth);
  const isActive = well.id === ACTIVE_WELL.id;
  const d = distanceKm(ACTIVE_WELL, well);
  const counts = well.events.reduce<Record<string, number>>((acc, e) => ((acc[e.type] = (acc[e.type] ?? 0) + 1), acc), {});
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label={t("status")} value={<StatusDot status={well.status} withLabel />} mono={false} />
        <Stat
          label={isActive ? t("bitDepth") : t("totalDepth")}
          value={`${Math.round(isActive ? liveDepth : well.total_depth_m).toLocaleString("en-IN")} m`}
        />
        {!isActive && <Stat label={`${t("distance")} (${lang === "hi" ? "रिग से" : "from rig"})`} value={`${d.toFixed(2)} km ${compass(bearingDeg(ACTIVE_WELL, well))}`} />}
        {isActive && <Stat label={lang === "hi" ? "नियोजित गहराई" : "Planned TD"} value={`${well.planned_depth_m.toLocaleString("en-IN")} m`} />}
        <Stat label={t("spud")} value={well.spud_date ?? "—"} />
        <Stat label={lang === "hi" ? "प्रोफ़ाइल" : "Profile"} value={well.profile} mono={false} />
        <Stat label={lang === "hi" ? "रिग" : "Rig"} value={well.rig} mono={false} />
        <Stat label={lang === "hi" ? "कुल NPT" : "Total NPT"} value={`${well.npt_total_h} h`} />
      </div>
      <div className="rounded-md border bg-card p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t("riskScore")}</span>
          <span className="font-mono font-semibold tabular">{Math.round(well.risk_score * 100)}/100</span>
        </div>
        <RiskMeter p={well.risk_score} className="mt-2" />
        <p className="mt-2 text-xs text-muted-foreground">
          {lang === "hi" ? "गंभीरता × NPT पर आधारित ऐतिहासिक कठिनाई" : "Historical drilling difficulty from event severity × NPT"}
        </p>
      </div>
      <div className="rounded-md border bg-card p-3">
        <p className="text-sm font-medium">{lang === "hi" ? "परिणाम" : "Result"}</p>
        <p className="text-sm text-muted-foreground">{well.result}</p>
        {Object.keys(counts).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(counts).map(([type, n]) => (
              <span key={type} className="inline-flex items-center gap-1">
                <EventChip type={type as keyof typeof EVENT_META} />
                <span className="text-xs text-muted-foreground">×{n}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function WellTabs({
  well,
  variant = "page",
  initialTab = "overview",
  initialEvent,
  initialDoc,
}: {
  well: Well;
  variant?: "page" | "panel";
  initialTab?: WellTab;
  initialEvent?: string;
  initialDoc?: string;
}) {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<WellTab>(initialTab);
  const [selEvent, setSelEvent] = useState<string | undefined>(initialEvent);
  const liveDepth = useApp((s) => s.depth);
  const isActive = well.id === ACTIVE_WELL.id;
  const panel = variant === "panel";

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as WellTab)} className="gap-3">
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <TabsList className="h-9">
          <TabsTrigger value="overview">{t("tab_overview")}</TabsTrigger>
          <TabsTrigger value="depth">{t("tab_depth")}</TabsTrigger>
          <TabsTrigger value="events">
            {t("tab_events")} <span className="rounded bg-muted px-1 text-[10px] tabular">{well.events.length}</span>
          </TabsTrigger>
          {!panel && <TabsTrigger value="timeline">{t("tab_timeline")}</TabsTrigger>}
          <TabsTrigger value="casing">{t("tab_casing")}</TabsTrigger>
          <TabsTrigger value="docs">{t("tab_docs")}</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview">
        <WellOverview well={well} />
      </TabsContent>

      <TabsContent value="depth">
        <div className={cn(!panel && "grid gap-4 lg:grid-cols-[minmax(360px,460px)_1fr]")}>
          <div className="rounded-lg border bg-card p-3">
            <DepthStrip
              well={well}
              height={panel ? 480 : 620}
              currentDepth={isActive ? liveDepth : undefined}
              selectedEventId={selEvent}
              onEventClick={(e) => {
                setSelEvent(e.id);
                if (panel) setTab("events");
              }}
            />
          </div>
          {!panel && (
            <div className="space-y-2">
              {selEvent ? (
                <EventCard event={well.events.find((e) => e.id === selEvent)!} />
              ) : (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  {lang === "hi" ? "विवरण देखने के लिए गहराई पट्टी पर किसी घटना पर क्लिक करें।" : "Click an event on the depth strip to see what happened and what was done."}
                </p>
              )}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="events">
        <div className={cn("grid gap-2", !panel && "md:grid-cols-2")}>
          {well.events.length === 0 && <p className="text-sm text-muted-foreground">{lang === "hi" ? "कोई घटना दर्ज नहीं।" : "No events recorded."}</p>}
          {[...well.events]
            .sort((a, b) => a.depth_m - b.depth_m)
            .map((e) => (
              <EventCard key={e.id} event={e} selected={e.id === selEvent} />
            ))}
        </div>
      </TabsContent>

      {!panel && (
        <TabsContent value="timeline">
          <div className="rounded-lg border bg-card p-4">
            <TimeDepthChart well={well} />
          </div>
        </TabsContent>
      )}

      <TabsContent value="casing">
        <div className="rounded-lg border bg-card p-3">
          <CasingMud well={well} />
        </div>
      </TabsContent>

      <TabsContent value="docs">
        <DocumentsList well={well} highlight={initialDoc} />
      </TabsContent>
    </Tabs>
  );
}
