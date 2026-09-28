"use client";

import { useMemo } from "react";
import { Pause, Play, RotateCcw, SkipForward, Clock, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import { useI18n } from "@/lib/i18n";
import { ACTIVE_WELL } from "@/data/wells";
import { formationAt, getOffsets, riskProfile, upcomingRisks } from "@/lib/risk";
import { PLANNED_TD, PREFILL_FROM } from "@/lib/live";
import { DepthTracks } from "@/components/live/depth-tracks";
import { AlertCard, useShowEvidence } from "@/components/alerts/alert-card";
import { EventChip, RiskBadge, RiskMeter } from "@/components/common/risk";
import { cn } from "@/lib/utils";

function Controls() {
  const { t, tx, lang } = useI18n();
  const { depth, running, speed, start, pause, reset, setSpeed, jumpTo, radiusKm, mitigated } = useApp();
  const hist = useApp((s) => s.history);
  const last = hist[hist.length - 1];
  const fm = formationAt(ACTIVE_WELL, depth);
  const progress = (depth - PREFILL_FROM) / (PLANNED_TD - PREFILL_FROM);

  const skip = () => {
    const risks = upcomingRisks(ACTIVE_WELL, getOffsets(ACTIVE_WELL, radiusKm), depth + 1, 900).filter(
      (r) => r.p >= 0.4 && !mitigated.includes(r.type) && r.distanceAhead > 160,
    );
    const target = risks.length ? Math.min(...risks.map((r) => r.peakDepth)) - 165 : depth + 100;
    jumpTo(Math.max(depth + 5, target));
  };

  return (
    <section className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b bg-card px-4 py-3" data-tour="live-controls">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
          <span className={cn("size-2 rounded-full", running ? "bg-live animate-pulse" : "bg-muted-foreground/50")} />
          {ACTIVE_WELL.id} · {running ? (lang === "hi" ? "ड्रिलिंग" : "Drilling") : lang === "hi" ? "रुका हुआ" : "Paused"}
        </p>
        <p className="font-mono text-3xl leading-tight font-bold tabular">
          {Math.round(depth).toLocaleString("en-IN")}
          <span className="ml-1 text-base font-medium text-muted-foreground">m MD</span>
        </p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{t("formation")}</p>
        <p className="flex items-center gap-1.5 font-semibold">
          <span className="size-3 rounded-sm" style={{ background: fm.color }} /> {tx(fm.name, fm.nameHi)}
        </p>
        <p className="text-xs text-muted-foreground">{fm.lithology}</p>
      </div>
      <div className="hidden min-w-40 flex-1 md:block">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{lang === "hi" ? "8½\" सेक्शन प्रगति" : "8½\" section progress"}</span>
          <span className="font-mono tabular">
            {Math.round(depth)} / {PLANNED_TD} m
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" /> {lang === "hi" ? "रिग घंटे" : "Rig hours on section"}: <span className="font-mono tabular">{last.hours.toFixed(1)} h</span>
          <span className="mx-1">·</span>
          <Radio className="size-3" /> {t("replayNote")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {running ? (
          <Button onClick={pause} size="lg" variant="outline">
            <Pause /> {t("pause")}
          </Button>
        ) : (
          <Button onClick={start} size="lg" disabled={depth >= PLANNED_TD}>
            <Play /> {depth > 2651 ? t("resume") : t("start")}
          </Button>
        )}
        <Button onClick={skip} size="lg" variant="outline" title={lang === "hi" ? "अगले जोखिम क्षेत्र से पहले जाएँ" : "Jump to just before the next risk zone"}>
          <SkipForward /> {lang === "hi" ? "अगले जोखिम तक" : "Skip to next risk"}
        </Button>
        <div className="flex items-center rounded-md border bg-muted p-0.5" role="radiogroup" aria-label={t("speed")}>
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={speed === s}
              onClick={() => setSpeed(s)}
              className={cn("rounded px-2 py-1 font-mono text-xs font-semibold", speed === s ? "bg-card shadow-xs" : "text-muted-foreground")}
            >
              {s}×
            </button>
          ))}
        </div>
        <Button onClick={reset} size="lg" variant="ghost" aria-label={t("reset")}>
          <RotateCcw /> <span className="hidden xl:inline">{t("reset")}</span>
        </Button>
      </div>
    </section>
  );
}

function Tiles() {
  const hist = useApp((s) => s.history);
  const mode = useApp((s) => s.mode);
  const { lang } = useI18n();
  const cur = hist[hist.length - 1];
  const prev = hist[Math.max(0, hist.length - 31)];
  const baseTorque = hist.slice(-60, -10).reduce((a, b) => a + b.torque, 0) / Math.max(1, Math.min(50, hist.length - 10));
  const lossPct = (1 - cur.flowOut / cur.flowIn) * 100;
  const tiles = [
    { k: "ROP", v: cur.rop.toFixed(1), u: "m/h", d: cur.rop - prev.rop, warn: false },
    { k: "WOB", v: cur.wob.toFixed(1), u: "t", d: cur.wob - prev.wob, warn: false },
    { k: "RPM", v: cur.rpm.toFixed(0), u: "", d: cur.rpm - prev.rpm, warn: false },
    { k: lang === "hi" ? "टॉर्क" : "Torque", v: cur.torque.toFixed(1), u: "kN·m", d: cur.torque - prev.torque, warn: cur.torque > baseTorque * 1.3 },
    { k: "SPP", v: cur.spp.toFixed(0), u: "bar", d: cur.spp - prev.spp, warn: false },
    { k: "MW", v: cur.mw.toFixed(2), u: "sg", d: cur.mw - prev.mw, warn: false },
    { k: lang === "hi" ? "फ़्लो आउट/इन" : "Flow out/in", v: `${(100 - lossPct).toFixed(0)}%`, u: "", d: 0, warn: lossPct > 8 },
    { k: lang === "hi" ? "पिट गेन" : "Pit gain", v: cur.pitGain.toFixed(1), u: "bbl", d: cur.pitGain - prev.pitGain, warn: cur.pitGain > 3 },
  ];
  return (
    <div className={cn("grid gap-2", mode === "field" ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-4 xl:grid-cols-8")}>
      {tiles.map((t) => (
        <div key={t.k} className={cn("rounded-md border bg-card px-3 py-2", t.warn && "border-risk-high bg-risk-high-bg")}>
          <p className={cn("text-[11px] font-medium text-muted-foreground", t.warn && "text-risk-high")}>{t.k}</p>
          <p className={cn("font-mono text-lg leading-tight font-bold tabular", t.warn && "text-risk-high")}>
            {t.v}
            <span className="ml-1 text-[11px] font-normal text-muted-foreground">{t.u}</span>
          </p>
          {t.d !== 0 && (
            <p className="font-mono text-[10px] text-muted-foreground tabular">
              {t.d > 0 ? "▲" : "▼"} {Math.abs(t.d).toFixed(Math.abs(t.d) < 1 ? 2 : 1)} / 30 m
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function LookAhead() {
  const { t, lang } = useI18n();
  const depth = useApp((s) => s.depth);
  const radiusKm = useApp((s) => s.radiusKm);
  const mitigated = useApp((s) => s.mitigated);
  const showEvidence = useShowEvidence();
  const bucket = Math.floor(depth / 10) * 10;
  const risks = useMemo(
    () => upcomingRisks(ACTIVE_WELL, getOffsets(ACTIVE_WELL, radiusKm), bucket, 200).filter((r) => r.p >= 0.15).slice(0, 4),
    [bucket, radiusKm],
  );
  return (
    <section className="rounded-lg border bg-card">
      <header className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-semibold">{t("lookahead")}</h2>
        <span className="text-xs text-muted-foreground">
          {getOffsets(ACTIVE_WELL, radiusKm).length} {lang === "hi" ? "ऑफ़सेट" : "offsets"} · {radiusKm} km
        </span>
      </header>
      {risks.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">{t("clearAhead")}</p>
      ) : (
        <ul className="divide-y">
          {risks.map((r) => (
            <li key={r.type} className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <EventChip type={r.type} />
                <div className="flex items-center gap-2">
                  {mitigated.includes(r.type) && <span className="text-[11px] font-medium text-risk-low">✓ {t("applied")}</span>}
                  <RiskBadge p={r.p} />
                </div>
              </div>
              <RiskMeter p={r.p} className="mt-2" />
              <p className="mt-1.5 text-sm">
                <span className="font-mono font-semibold tabular">{r.peakDepth.toLocaleString("en-IN")} m</span>
                <span className="text-muted-foreground">
                  {" "}
                  · +{Math.round(r.distanceAhead)} m {t("ahead")} · {r.formation}
                </span>
              </p>
              <button onClick={() => showEvidence(r.wellsWith)} className="mt-0.5 text-left text-xs text-primary hover:underline">
                {r.wellsWith.length} {t("of")} {r.offsetsConsidered} {t("offsetsHad")}: {r.wellsWith.join(", ")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AlertFeed() {
  const { t, lang } = useI18n();
  const alerts = useApp((s) => s.alerts);
  return (
    <section data-tour="live-alerts" className="flex min-h-0 flex-col">
      <h2 className="mb-2 flex items-center justify-between text-sm font-semibold">
        {t("alerts")}
        <span className="text-xs font-normal text-muted-foreground">
          {alerts.length} {lang === "hi" ? "कुल" : "total"}
        </span>
      </h2>
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">{t("noAlerts")}</p>
        ) : (
          alerts.map((a) => <AlertCard key={a.id} alert={a} />)
        )}
      </div>
    </section>
  );
}

export function LiveView() {
  const history = useApp((s) => s.history);
  const depth = useApp((s) => s.depth);
  const radiusKm = useApp((s) => s.radiusKm);
  const { lang } = useI18n();
  const profile = useMemo(() => riskProfile(ACTIVE_WELL, getOffsets(ACTIVE_WELL, radiusKm), PREFILL_FROM, PLANNED_TD, 10), [radiusKm]);

  return (
    <div className="flex min-h-full flex-col">
      <Controls />
      <div className="grid flex-1 gap-4 p-4 xl:grid-cols-[1fr_400px]">
        <div className="flex min-w-0 flex-col gap-3">
          <Tiles />
          <div className="h-[640px] rounded-lg border bg-card xl:h-[calc(100dvh-270px)] xl:min-h-[560px]">
            <DepthTracks history={history} depth={depth} profile={profile} />
          </div>
          <p className="text-xs text-muted-foreground">
            {lang === "hi"
              ? "ऊपर: ड्रिल किया गया (eRTMAC रीप्ले)। नीली रेखा: बिट। नीचे का धूसर क्षेत्र: आगे के 200 मी. — दाएँ स्तंभ में ऑफ़सेट कुओं से अनुमानित जोखिम।"
              : "Above the blue line: drilled (eRTMAC replay). Grey zone: the next 200 m. The right-hand column shows risk predicted from offset wells at the formation-equivalent depth."}
          </p>
        </div>
        <aside className="flex min-w-0 flex-col gap-4">
          <LookAhead />
          <AlertFeed />
        </aside>
      </div>
    </div>
  );
}

