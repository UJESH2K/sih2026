"use client";

import Link from "next/link";
import { FileText, Clock, Gauge } from "lucide-react";
import type { DrillingEvent } from "@/data/types";
import { EventChip } from "@/components/common/risk";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SEV = {
  1: { en: "Minor", hi: "मामूली", cls: "text-risk-low" },
  2: { en: "Moderate", hi: "मध्यम", cls: "text-risk-med" },
  3: { en: "Severe", hi: "गंभीर", cls: "text-risk-high" },
} as const;

export function EventCard({
  event,
  showWell = false,
  selected = false,
  className,
}: {
  event: DrillingEvent;
  showWell?: boolean;
  selected?: boolean;
  className?: string;
}) {
  const { lang } = useI18n();
  const sev = SEV[event.severity];
  return (
    <article
      id={event.id}
      className={cn("rounded-lg border bg-card p-3", selected && "ring-2 ring-primary", className)}
    >
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <EventChip type={event.type} />
        <span className="font-mono text-sm font-semibold tabular">@ {event.depth_m.toLocaleString("en-IN")} m</span>
        <span className="text-sm text-muted-foreground">({event.formation})</span>
        {showWell && (
          <Link href={`/wells/${event.wellId}`} className="ml-auto rounded border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium hover:bg-accent">
            {event.wellId}
          </Link>
        )}
      </header>
      <p className="mt-2 text-sm leading-snug">{event.details}</p>
      <dl className="mt-2 space-y-1.5 text-sm">
        <div className="rounded-md bg-muted/70 px-2.5 py-1.5">
          <dt className="text-[11px] font-semibold tracking-wide text-muted-foreground">{lang === "hi" ? "की गई कार्रवाई" : "Action taken"}</dt>
          <dd className="leading-snug">{event.action}</dd>
        </div>
        <div className="rounded-md border border-primary/20 bg-accent/60 px-2.5 py-1.5">
          <dt className="text-[11px] font-semibold tracking-wide text-accent-foreground">{lang === "hi" ? "सीख" : "Lesson learned"}</dt>
          <dd className="leading-snug">{event.lesson}</dd>
        </div>
      </dl>
      <footer className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className={cn("inline-flex items-center gap-1 font-semibold", sev.cls)}>
          <Gauge className="size-3.5" /> {sev[lang]}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" /> NPT {event.npt_hours} h
        </span>
        <span>{event.date}</span>
        <Link
          href={`/wells/${event.wellId}?tab=docs&doc=${event.source.docId}`}
          className="ml-auto inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 font-medium text-foreground hover:bg-muted"
          title={lang === "hi" ? "स्रोत दस्तावेज़" : "Source document"}
        >
          <FileText className="size-3.5 text-primary" />
          {event.source.doc}, p.{event.source.page}
          <span className="text-muted-foreground">· {Math.round(event.confidence * 100)}%</span>
        </Link>
      </footer>
    </article>
  );
}
