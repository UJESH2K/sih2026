"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, BookOpenCheck } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ACTIVE_WELL, ALL_EVENTS } from "@/data/wells";
import { FORMATIONS } from "@/data/formations";
import type { DrillingEvent, EventType, Severity } from "@/data/types";
import { EVENT_META, EVENT_TYPES } from "@/lib/event-meta";
import { EventCard } from "@/components/well/event-card";
import { getOffsets } from "@/lib/risk";
import { useApp } from "@/store/app";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Sort = "relevance" | "npt" | "depth" | "date";

const SYN: Record<string, string[]> = {
  loss: ["loss", "losses", "lost", "lcm", "returns"],
  stuck: ["stuck", "jar", "overpull", "freed"],
  kick: ["kick", "influx", "pit", "shut", "sidpp"],
};

function score(e: DrillingEvent, terms: string[]) {
  if (!terms.length) return 1;
  const hay = `${EVENT_META[e.type].label} ${e.formation} ${e.wellId} ${e.details} ${e.action} ${e.lesson} ${e.depth_m}`.toLowerCase();
  let s = 0;
  for (const t of terms) {
    const alts = Object.values(SYN).find((g) => g.some((x) => t.startsWith(x))) ?? [t];
    if (alts.some((a) => hay.includes(a))) s += EVENT_META[e.type].label.toLowerCase().includes(t) || e.formation.toLowerCase().includes(t) ? 3 : 1;
    else return 0;
  }
  return s;
}

function FacetButton({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
        active ? "bg-accent font-medium text-accent-foreground" : "hover:bg-muted",
        count === 0 && !active && "opacity-45",
      )}
    >
      <span className="flex min-w-0 items-center gap-2">{children}</span>
      <span className="font-mono text-xs text-muted-foreground tabular">{count}</span>
    </button>
  );
}

export function KnowledgeView() {
  const params = useSearchParams();
  const { lang, tx } = useI18n();
  const radiusKm = useApp((s) => s.radiusKm);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [types, setTypes] = useState<EventType[]>([]);
  const [fms, setFms] = useState<string[]>([]);
  const [sevs, setSevs] = useState<Severity[]>([]);
  const [depth, setDepth] = useState<[number, number]>([0, 4200]);
  const [nearOnly, setNearOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const near = useMemo(() => new Set(getOffsets(ACTIVE_WELL, radiusKm).map((o) => o.well.id)), [radiusKm]);
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1);

  const base = useMemo(
    () =>
      ALL_EVENTS.map((e) => ({ e, s: score(e, terms) })).filter(
        ({ e, s }) => s > 0 && e.depth_m >= depth[0] && e.depth_m <= depth[1] && (!nearOnly || near.has(e.wellId)),
      ),
    [terms.join(" "), depth, nearOnly, near], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const apply = (list: typeof base, skip?: "type" | "fm" | "sev") =>
    list.filter(
      ({ e }) =>
        (skip === "type" || !types.length || types.includes(e.type)) &&
        (skip === "fm" || !fms.length || fms.includes(e.formation)) &&
        (skip === "sev" || !sevs.length || sevs.includes(e.severity)),
    );
  const results = apply(base).sort((a, b) =>
    sort === "relevance" ? b.s - a.s || b.e.severity - a.e.severity : sort === "npt" ? b.e.npt_hours - a.e.npt_hours : sort === "depth" ? a.e.depth_m - b.e.depth_m : b.e.date.localeCompare(a.e.date),
  );
  const npt = results.reduce((s, r) => s + r.e.npt_hours, 0);
  const tCount = (t: EventType) => apply(base, "type").filter(({ e }) => e.type === t).length;
  const fCount = (f: string) => apply(base, "fm").filter(({ e }) => e.formation === f).length;
  const sCount = (s: Severity) => apply(base, "sev").filter(({ e }) => e.severity === s).length;
  const toggle = <T,>(arr: T[], set: (v: T[]) => void, v: T) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const anyFilter = types.length || fms.length || sevs.length || nearOnly || depth[0] > 0 || depth[1] < 4200 || q;

  const topLessons = useMemo(() => {
    const m = new Map<string, { lesson: string; type: EventType; wells: Set<string>; npt: number }>();
    for (const { e } of results) {
      const k = e.lesson;
      if (!m.has(k)) m.set(k, { lesson: e.lesson, type: e.type, wells: new Set(), npt: 0 });
      const x = m.get(k)!;
      x.wells.add(e.wellId);
      x.npt += e.npt_hours;
    }
    return [...m.values()].sort((a, b) => b.npt - a.npt).slice(0, 4);
  }, [results]);

  const filters = (
    <div className="space-y-4">
      <section>
        <h3 className="mb-1 px-2 text-xs font-semibold text-muted-foreground">{lang === "hi" ? "समस्या" : "Problem"}</h3>
        {EVENT_TYPES.map((t) => {
          const Icon = EVENT_META[t].icon;
          return (
            <FacetButton key={t} active={types.includes(t)} onClick={() => toggle(types, setTypes, t)} count={tCount(t)}>
              <Icon className="size-4 shrink-0" style={{ color: EVENT_META[t].color }} />
              <span className="truncate">{lang === "hi" ? EVENT_META[t].labelHi : EVENT_META[t].label}</span>
            </FacetButton>
          );
        })}
      </section>
      <section>
        <h3 className="mb-1 px-2 text-xs font-semibold text-muted-foreground">{lang === "hi" ? "संरचना" : "Formation"}</h3>
        {FORMATIONS.slice(2, 7).map((f) => (
          <FacetButton key={f.id} active={fms.includes(f.name)} onClick={() => toggle(fms, setFms, f.name)} count={fCount(f.name)}>
            <span className="size-3 shrink-0 rounded-sm" style={{ background: f.color }} />
            <span className="truncate">{tx(f.name, f.nameHi)}</span>
          </FacetButton>
        ))}
      </section>
      <section>
        <h3 className="mb-1 px-2 text-xs font-semibold text-muted-foreground">{lang === "hi" ? "गंभीरता" : "Severity"}</h3>
        {([3, 2, 1] as Severity[]).map((s) => (
          <FacetButton key={s} active={sevs.includes(s)} onClick={() => toggle(sevs, setSevs, s)} count={sCount(s)}>
            <span className={cn("size-2.5 rounded-full", s === 3 ? "bg-risk-high" : s === 2 ? "bg-risk-med" : "bg-risk-low")} />
            {s === 3 ? (lang === "hi" ? "गंभीर" : "Severe") : s === 2 ? (lang === "hi" ? "मध्यम" : "Moderate") : lang === "hi" ? "मामूली" : "Minor"}
          </FacetButton>
        ))}
      </section>
      <section className="px-2">
        <h3 className="mb-2 text-xs font-semibold text-muted-foreground">
          {lang === "hi" ? "गहराई" : "Depth"}: <span className="font-mono text-foreground">{depth[0]}–{depth[1]} m</span>
        </h3>
        <Slider min={0} max={4200} step={50} value={depth} onValueChange={(v) => setDepth(v as [number, number])} aria-label="Depth range" />
      </section>
      <label className="flex items-center justify-between gap-2 px-2 text-sm">
        {lang === "hi" ? `केवल ${radiusKm} किमी के भीतर` : `Only offsets within ${radiusKm} km`}
        <Switch checked={nearOnly} onCheckedChange={setNearOnly} />
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6">
      <h1 className="text-2xl font-bold tracking-tight">{lang === "hi" ? "ज्ञान खोज" : "Knowledge Search"}</h1>
      <p className="mt-1 text-muted-foreground">
        {lang === "hi"
          ? "सभी कुओं की घटनाएँ, की गई कार्रवाई और सीख — AI द्वारा रिपोर्टों से निकाली गई।"
          : "Every drilling event, the action taken and the lesson learned, extracted by AI from well reports."}
      </p>
      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "hi" ? "जैसे: stuck pipe coal, LCM, Kopili kick…" : "Try: stuck pipe coal · LCM pill · Kopili kick · squeeze"}
            className="h-12 w-full rounded-lg border bg-card pr-10 pl-11 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Search knowledge base"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 hover:bg-muted" aria-label="Clear">
              <X className="size-4" />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-1.5 rounded-lg border bg-card px-3 text-sm font-medium lg:hidden">
          <SlidersHorizontal className="size-4" /> {lang === "hi" ? "फ़िल्टर" : "Filters"}
        </button>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px]">
        <aside className={cn("rounded-lg border bg-card p-2 lg:block", showFilters ? "block" : "hidden")}>{filters}</aside>
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              <b className="tabular">{results.length}</b> {lang === "hi" ? "परिणाम" : "results"} ·{" "}
              <span className="text-muted-foreground">
                {npt} h NPT · {new Set(results.map((r) => r.e.wellId)).size} {lang === "hi" ? "कुएँ" : "wells"}
              </span>
              {anyFilter ? (
                <button
                  onClick={() => {
                    setTypes([]);
                    setFms([]);
                    setSevs([]);
                    setDepth([0, 4200]);
                    setNearOnly(false);
                    setQ("");
                  }}
                  className="ml-2 text-primary hover:underline"
                >
                  {lang === "hi" ? "सब साफ़ करें" : "Clear all"}
                </button>
              ) : null}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{lang === "hi" ? "क्रम" : "Sort"}</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-8 rounded-md border bg-card px-2 text-sm">
                <option value="relevance">{lang === "hi" ? "प्रासंगिकता" : "Relevance"}</option>
                <option value="npt">{lang === "hi" ? "सबसे अधिक NPT" : "Highest NPT"}</option>
                <option value="depth">{lang === "hi" ? "गहराई" : "Depth"}</option>
                <option value="date">{lang === "hi" ? "नवीनतम" : "Most recent"}</option>
              </select>
            </label>
          </div>
          {results.length === 0 ? (
            <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">{lang === "hi" ? "कोई परिणाम नहीं। फ़िल्टर हटाएँ।" : "No results. Try removing a filter."}</p>
          ) : (
            <div className="grid gap-3 2xl:grid-cols-2">
              {results.map(({ e }) => (
                <EventCard key={e.id} event={e} showWell />
              ))}
            </div>
          )}
        </section>
        <aside className="hidden xl:block">
          <div className="sticky top-4 rounded-lg border bg-card p-3">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <BookOpenCheck className="size-4 text-primary" /> {lang === "hi" ? "मुख्य सीख" : "Top lessons in these results"}
            </h2>
            <ul className="mt-2 space-y-2.5">
              {topLessons.map((l) => (
                <li key={l.lesson} className="border-l-2 pl-2.5 text-sm" style={{ borderColor: EVENT_META[l.type].color }}>
                  <p className="leading-snug">{l.lesson}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[...l.wells].join(", ")} · {l.npt} h NPT
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
