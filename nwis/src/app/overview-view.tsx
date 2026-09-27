"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileScan, Database, Rows3, BellRing, Play, Map, MessageSquareText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app";
import { useI18n } from "@/lib/i18n";
import { ACTIVE_WELL, ALL_DOCS, ALL_EVENTS, FIELD } from "@/data/wells";
import { formationAt, getOffsets, upcomingRisks } from "@/lib/risk";
import { EVENT_META } from "@/lib/event-meta";
import { RiskBadge, RiskMeter } from "@/components/common/risk";
import { AlertCard, useShowEvidence } from "@/components/alerts/alert-card";
import { RiskRibbon } from "@/components/overview/risk-ribbon";
import { PLANNED_TD } from "@/lib/live";

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-3xl font-bold tabular">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const STEPS = [
  { icon: FileScan, href: "/documents", en: ["Read the reports", "OCR + NLP extract depths, events, actions and NPT from WCRs and DDRs, including old scans."], hi: ["रिपोर्ट पढ़ें", "OCR + NLP पुरानी स्कैन रिपोर्टों से भी गहराई, घटनाएँ, कार्रवाई और NPT निकालते हैं।"] },
  { icon: Database, href: "/knowledge", en: ["Build institutional memory", "Every event, lesson and mitigation is searchable, with a link to its source page."], hi: ["संस्थागत स्मृति बनाएँ", "हर घटना, सीख और उपाय खोज योग्य — स्रोत पृष्ठ सहित।"] },
  { icon: Rows3, href: "/correlation", en: ["Correlate by formation", "Offset wells are aligned by formation tops, not raw depth, so like is compared with like."], hi: ["संरचना से सहसंबंध", "ऑफ़सेट कुएँ संरचना शीर्ष से संरेखित — सही तुलना।"] },
  { icon: BellRing, href: "/live", en: ["Alert ahead of the bit", "As the live well approaches a known trouble zone, NWIS warns early and says what worked before."], hi: ["बिट से पहले चेतावनी", "समस्या क्षेत्र आने से पहले NWIS चेतावनी और पिछला सफल उपाय बताता है।"] },
];

export function OverviewView() {
  const { t, tx, lang } = useI18n();
  const router = useRouter();
  const depth = useApp((s) => s.depth);
  const running = useApp((s) => s.running);
  const start = useApp((s) => s.start);
  const radiusKm = useApp((s) => s.radiusKm);
  const alerts = useApp((s) => s.alerts);
  const showEvidence = useShowEvidence();
  const [q, setQ] = useState("");
  const offsets = getOffsets(ACTIVE_WELL, radiusKm);
  const fm = formationAt(ACTIVE_WELL, depth);
  const next = upcomingRisks(ACTIVE_WELL, offsets, Math.floor(depth / 10) * 10, 400).filter((r) => r.p >= 0.3)[0];
  const pages = ALL_DOCS.reduce((s, d) => s + d.pages, 0);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {tx(FIELD.name, FIELD.nameHi)} · {FIELD.basin}
        </p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("appFull")}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-5" data-tour="overview-hero">
        {/* active well */}
        <section className="rounded-xl border bg-card p-5 lg:col-span-3">
          <div className="flex items-center gap-2 text-sm">
            <span className={`size-2.5 rounded-full ${running ? "bg-live animate-pulse" : "bg-muted-foreground/50"}`} />
            <span className="font-semibold">{ACTIVE_WELL.id}</span>
            <span className="text-muted-foreground">
              · {lang === "hi" ? "सक्रिय कुआँ" : "Active well"} · {ACTIVE_WELL.rig}
            </span>
          </div>
          <p className="mt-3 text-lg leading-snug sm:text-xl">
            {lang === "hi" ? "वर्तमान में" : "Currently at"}{" "}
            <span className="font-mono font-bold tabular">{Math.round(depth).toLocaleString("en-IN")} m</span>{" "}
            {lang === "hi" ? "पर," : "in"}{" "}
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <span className="size-3 rounded-sm" style={{ background: fm.color }} />
              {tx(fm.name, fm.nameHi)}
            </span>
            {lang === "hi" ? " में ड्रिलिंग।" : ", drilling the 8½\" section."}
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 m</span>
              <span>
                {lang === "hi" ? "लक्ष्य" : "Target"} {PLANNED_TD.toLocaleString("en-IN")} m
              </span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round((depth / PLANNED_TD) * 1000) / 10}%` }} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="lg"
              onClick={() => {
                if (!running) start();
                router.push("/live");
              }}
            >
              <Play /> {running ? t("nav_live") : t("start")}
            </Button>
            <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/map" />}>
              <Map /> {t("nav_map")}
            </Button>
          </div>
          <div className="mt-5 border-t pt-4">
            <p className="mb-2 text-sm font-semibold">
              {lang === "hi" ? "शेष कुआँ पथ पर अनुमानित जोखिम" : "Predicted risk along the rest of the well"}
            </p>
            <RiskRibbon from={2400} to={PLANNED_TD} />
          </div>
        </section>

        {/* next risk */}
        <section className="flex flex-col rounded-xl border bg-card p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-muted-foreground uppercase">{t("nextRisk")}</p>
          {next ? (
            <>
              <div className="mt-2 flex items-center justify-between gap-2">
                <h2 className="text-xl font-bold">{lang === "hi" ? EVENT_META[next.type].labelHi : EVENT_META[next.type].label}</h2>
                <RiskBadge p={next.p} className="text-sm" />
              </div>
              <RiskMeter p={next.p} className="mt-2" />
              <p className="mt-3 text-sm">
                <span className="font-mono font-semibold tabular">{next.peakDepth.toLocaleString("en-IN")} m</span> ·{" "}
                <b>{Math.round(next.distanceAhead)} m</b> {t("ahead")} · {next.formation}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {next.wellsWith.length} {t("of")} {next.offsetsConsidered} {t("offsetsHad")}.
              </p>
              <div className="mt-3 rounded-md bg-muted/70 p-3">
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t("recommendation")}</p>
                <p className="mt-0.5 text-sm leading-snug">{next.recommendation}</p>
                {next.provenFix && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    <b className="text-foreground">
                      {t("provenFix")} ({next.provenFix.wellId}):
                    </b>{" "}
                    {next.provenFix.action}
                  </p>
                )}
              </div>
              <div className="mt-auto pt-3">
                <Button variant="outline" className="w-full" onClick={() => showEvidence(next.wellsWith)}>
                  <Map /> {t("viewEvidence")}
                </Button>
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">{t("clearAhead")}</p>
          )}
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={lang === "hi" ? `${radiusKm} किमी में ऑफ़सेट कुएँ` : `Offset wells within ${radiusKm} km`} value={String(offsets.length)} sub={lang === "hi" ? "नक्शे पर त्रिज्या बदलें" : "Change radius on the map"} />
        <Kpi label={lang === "hi" ? "पढ़े गए दस्तावेज़" : "Reports read by AI"} value={String(ALL_DOCS.length)} sub={`${pages.toLocaleString("en-IN")} ${lang === "hi" ? "पृष्ठ" : "pages"}`} />
        <Kpi label={lang === "hi" ? "दर्ज घटनाएँ" : "Drilling events indexed"} value={String(ALL_EVENTS.length)} sub={lang === "hi" ? "हर एक स्रोत सहित" : "each linked to its source page"} />
        <Kpi
          label={lang === "hi" ? "ऐतिहासिक NPT" : "Historical NPT captured"}
          value={`${ALL_EVENTS.reduce((s, e) => s + e.npt_hours, 0)} h`}
          sub={lang === "hi" ? "सीखने योग्य समय हानि" : "lost time we can learn from"}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{lang === "hi" ? "NWIS कैसे काम करता है" : "How NWIS works"}</h2>
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const [title, body] = s[lang];
            return (
              <li key={s.href}>
                <Link href={s.href} className="group flex h-full flex-col rounded-lg border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                  </div>
                  <p className="mt-3 font-semibold">{title}</p>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{body}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {lang === "hi" ? "खोलें" : "Open"} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquareText className="size-5 text-primary" /> {t("nav_assistant")}
          </h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/assistant?q=${encodeURIComponent(q || "What problems did nearby wells face in the Barail formation?")}`);
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={lang === "hi" ? "जैसे: बरैल में पास के कुओं को क्या समस्याएँ आईं?" : "e.g. What problems did nearby wells face in the Barail?"}
              className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button type="submit" size="lg" aria-label="Ask">
              <Send />
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Which wells had stuck pipe in the Barail?", "Summarise NWS-07", "What mud weight worked for the Kopili?"].map((s) => (
              <button key={s} onClick={() => router.push(`/assistant?q=${encodeURIComponent(s)}`)} className="rounded-full border bg-background px-3 py-1 text-xs hover:bg-muted">
                {s}
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="flex items-center justify-between text-lg font-semibold">
            {lang === "hi" ? "हाल की चेतावनियाँ" : "Recent alerts"}
            <Link href="/live" className="text-sm font-medium text-primary hover:underline">
              {t("nav_live")} →
            </Link>
          </h2>
          <div className="mt-3 space-y-2">
            {alerts.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">{t("noAlerts")}</p>
            ) : (
              alerts.slice(0, 2).map((a) => <AlertCard key={a.id} alert={a} compact />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
