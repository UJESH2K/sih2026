"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Layers as LayersIcon, MapPin, Satellite, Map as MapIcon, X, RotateCcw, Radar, Activity } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useApp, type Layers } from "@/store/app";
import { useI18n, type TKey } from "@/lib/i18n";
import { ACTIVE_WELL, WELL_BY_ID } from "@/data/wells";
import { getOffsets, upcomingRisks, formationAt } from "@/lib/risk";
import { EVENT_META, STATUS_META } from "@/lib/event-meta";
import { EventChip, RiskBadge, StatusDot } from "@/components/common/risk";
import { WellTabs } from "@/components/well/well-tabs";
import { cn } from "@/lib/utils";
import { resetIntro } from "@/components/map/well-map";
import type { WellStatus } from "@/data/types";

const WellMap = dynamic(() => import("@/components/map/well-map").then((m) => m.WellMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface text-sm text-muted-foreground">
      <Radar className="mr-2 size-5 animate-spin" /> Loading map…
    </div>
  ),
});

const LAYER_KEYS: (keyof Layers)[] = ["wells", "rings", "links", "heat", "trajectories", "labels"];

function RadiusCard() {
  const { t, lang } = useI18n();
  const radius = useApp((s) => s.radiusKm);
  const setRadius = useApp((s) => s.setRadius);
  const offsets = getOffsets(ACTIVE_WELL, radius);
  const withEvents = offsets.filter((o) => o.well.events.length > 0).length;
  return (
    <section className="rounded-lg border bg-card p-3" data-tour="map-radius">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{t("radius")}</h2>
        <span className="font-mono text-lg font-bold text-primary tabular">{radius.toFixed(1)} km</span>
      </div>
      <Slider
        className="mt-3"
        min={0.5}
        max={10}
        step={0.5}
        value={[radius]}
        onValueChange={(v) => setRadius(Array.isArray(v) ? v[0] : (v as number))}
        aria-label={t("radius")}
      />
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>0.5</span>
        <span>5</span>
        <span>10 km</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {[1, 3, 5, 8].map((r) => (
          <button
            key={r}
            onClick={() => setRadius(r)}
            className={cn(
              "flex-1 rounded border py-1 text-xs font-medium transition-colors",
              radius === r ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted",
            )}
          >
            {r} km
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm">
        <span className="font-semibold tabular">{offsets.length}</span> {t("wellsInRadius")} {radius} km
        <span className="text-muted-foreground">
          {" "}
          · {withEvents} {lang === "hi" ? "में दर्ज घटनाएँ" : "with recorded events"}
        </span>
      </p>
    </section>
  );
}

function NearestList() {
  const { t, lang } = useI18n();
  const radius = useApp((s) => s.radiusKm);
  const selectWell = useApp((s) => s.selectWell);
  const selected = useApp((s) => s.selectedWellId);
  const flyTo = useApp((s) => s.flyTo);
  const highlight = useApp((s) => s.highlightIds);
  const offsets = getOffsets(ACTIVE_WELL, radius, true);
  return (
    <section className="rounded-lg border bg-card">
      <h2 className="border-b px-3 py-2 text-sm font-semibold">{t("nearestWells")}</h2>
      <ul className="divide-y">
        {offsets.length === 0 && <li className="p-3 text-sm text-muted-foreground">{lang === "hi" ? "त्रिज्या बढ़ाएँ" : "Increase the radius to include wells."}</li>}
        {offsets.map((o) => {
          const w = o.well;
          const types = [...new Set(w.events.map((e) => e.type))];
          return (
            <li key={w.id}>
              <button
                onClick={() => {
                  selectWell(w.id);
                  flyTo(w.lng, w.lat, 13.2);
                }}
                className={cn(
                  "flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted",
                  selected === w.id && "bg-accent",
                  highlight.includes(w.id) && "border-l-4 border-l-risk-high",
                )}
              >
                <StatusDot status={w.status} className="mt-1.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-sm font-semibold">{w.id}</span>
                    <span className="font-mono text-xs text-muted-foreground tabular">
                      {o.distanceKm.toFixed(1)} km {o.compass}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {types.length === 0 ? (
                      <span className="text-xs text-muted-foreground">{w.status === "planned" ? STATUS_META.planned.label : lang === "hi" ? "कोई घटना नहीं" : "No events"}</span>
                    ) : (
                      types.slice(0, 3).map((ty) => <EventChip key={ty} type={ty} className="text-[11px]" />)
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LayersCard() {
  const { t } = useI18n();
  const layers = useApp((s) => s.layers);
  const toggle = useApp((s) => s.toggleLayer);
  return (
    <section className="rounded-lg border bg-card p-3">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <LayersIcon className="size-4" /> {t("layers")}
      </h2>
      <ul className="space-y-2">
        {LAYER_KEYS.map((k) => (
          <li key={k}>
            <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
              {t(`layer_${k}` as TKey)}
              <Switch checked={layers[k]} onCheckedChange={() => toggle(k)} />
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Legend() {
  const { t, lang } = useI18n();
  return (
    <div className="rounded-lg border bg-card/95 p-3 text-xs shadow-sm backdrop-blur">
      <p className="mb-1.5 font-semibold">{t("legend")}</p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
        {(Object.keys(STATUS_META) as WellStatus[]).map((s) => (
          <li key={s}>
            <StatusDot status={s} withLabel />
          </li>
        ))}
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-[#8e5ac8]" /> {lang === "hi" ? "कुआँ पथ" : "Well path"}
        </li>
      </ul>
      <p className="mt-1.5 text-muted-foreground">{t("columnHeight")}</p>
    </div>
  );
}

function LiveMini() {
  const { t, tx, lang } = useI18n();
  const depth = useApp((s) => s.depth);
  const running = useApp((s) => s.running);
  const radius = useApp((s) => s.radiusKm);
  const start = useApp((s) => s.start);
  const setHighlight = useApp((s) => s.setHighlight);
  const next = upcomingRisks(ACTIVE_WELL, getOffsets(ACTIVE_WELL, radius), depth, 200)[0];
  const fm = formationAt(ACTIVE_WELL, depth);
  return (
    <div className="w-[300px] rounded-lg border bg-card/95 p-3 shadow-md backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
          <Activity className="size-3.5" /> {ACTIVE_WELL.id} · {t("bitDepth")}
        </p>
        {!running && (
          <Button size="xs" variant="outline" onClick={start}>
            ▶ {t("start")}
          </Button>
        )}
      </div>
      <p className="mt-1 font-mono text-2xl font-bold tabular">
        {Math.round(depth).toLocaleString("en-IN")} <span className="text-sm font-medium text-muted-foreground">m</span>
      </p>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="size-2.5 rounded-sm" style={{ background: fm.color }} /> {tx(fm.name, fm.nameHi)}
      </p>
      {next && next.p > 0.3 && (
        <button
          onClick={() => setHighlight(next.wellsWith)}
          className="mt-2 w-full rounded-md border bg-muted/60 p-2 text-left hover:bg-muted"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">{t("nextRisk")}</span>
            <RiskBadge p={next.p} />
          </div>
          <p className="mt-1 text-sm">
            {lang === "hi" ? EVENT_META[next.type].labelHi : EVENT_META[next.type].label} @ {next.peakDepth.toLocaleString("en-IN")} m
            <span className="text-muted-foreground"> (+{Math.round(next.distanceAhead)} m)</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {next.wellsWith.length}/{next.offsetsConsidered} {t("offsetsHad")} — {lang === "hi" ? "नक्शे पर दिखाएँ" : "tap to show on map"}
          </p>
        </button>
      )}
      <Link href="/live" className="mt-2 flex items-center justify-end gap-1 text-xs font-medium text-primary hover:underline">
        {t("nav_live")} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

export function MapView() {
  const { t, lang } = useI18n();
  const selected = useApp((s) => s.selectedWellId);
  const selectWell = useApp((s) => s.selectWell);
  const basemap = useApp((s) => s.basemap);
  const setBasemap = useApp((s) => s.setBasemap);
  const highlight = useApp((s) => s.highlightIds);
  const setHighlight = useApp((s) => s.setHighlight);
  const compareIds = useApp((s) => s.compareIds);
  const toggleCompare = useApp((s) => s.toggleCompare);
  const well = selected ? WELL_BY_ID[selected] : null;

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* left control column */}
      <aside className="order-2 flex w-full shrink-0 flex-col gap-3 overflow-y-auto border-r bg-surface p-3 scrollbar-thin lg:order-1 lg:w-80">
        <RadiusCard />
        <NearestList />
        <LayersCard />
      </aside>

      {/* map */}
      <div className="relative order-1 h-[62vh] min-h-[420px] flex-1 lg:order-2 lg:h-auto" data-tour="map-canvas">
        <WellMap />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="flex rounded-md border bg-card p-0.5 shadow-sm">
            {(["streets", "satellite"] as const).map((b) => {
              const Icon = b === "streets" ? MapIcon : Satellite;
              return (
                <button
                  key={b}
                  onClick={() => setBasemap(b)}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium",
                    basemap === b ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" /> {t(b)}
                </button>
              );
            })}
          </div>
          {highlight.length > 0 && (
            <div className="flex max-w-[320px] items-center gap-2 rounded-md border border-risk-high/40 bg-card px-2.5 py-1.5 text-xs shadow-sm">
              <MapPin className="size-4 shrink-0 text-risk-high" />
              <span>
                <b>{lang === "hi" ? "प्रमाण कुएँ:" : "Evidence wells:"}</b> {highlight.join(", ")}
              </span>
              <button onClick={() => setHighlight([])} className="ml-auto rounded p-0.5 hover:bg-muted" aria-label="Clear highlight">
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="absolute bottom-8 left-3 hidden sm:block">
          <LiveMini />
        </div>
        <div className="absolute right-3 bottom-8 hidden w-64 md:block">
          <Legend />
          <button
            onClick={() => {
              resetIntro();
              location.reload();
            }}
            className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" /> {lang === "hi" ? "परिचय फिर चलाएँ" : "Replay intro"}
          </button>
        </div>
      </div>

      {/* well panel */}
      <AnimatePresence>
        {well && (
          <motion.aside
            key={well.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="order-3 flex w-full shrink-0 flex-col border-l bg-background lg:w-[440px]"
            aria-label={`${well.id} details`}
          >
            <header className="flex items-start gap-3 border-b p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-mono text-xl font-bold">{well.id}</h2>
                  <StatusDot status={well.status} withLabel />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{well.result}</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => selectWell(null)} aria-label="Close">
                <X />
              </Button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <WellTabs key={well.id} well={well} variant="panel" />
            </div>
            <footer className="flex gap-2 border-t p-3">
              <Button render={<Link href={`/wells/${well.id}`} />} className="flex-1">
                {t("openWell")} <ArrowRight />
              </Button>
              {well.id !== ACTIVE_WELL.id && well.status !== "planned" && (
                <Button variant="outline" onClick={() => toggleCompare(well.id)}>
                  {compareIds.includes(well.id) ? `✓ ${t("inCompare")}` : t("addCompare")}
                </Button>
              )}
            </footer>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
