"use client";

import { FileScan, FileText, CheckCircle2, Loader2, Clock3 } from "lucide-react";
import type { Well } from "@/data/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function DocumentsList({ well, highlight }: { well: Well; highlight?: string }) {
  const { lang } = useI18n();
  if (well.documents.length === 0)
    return <p className="text-sm text-muted-foreground">{lang === "hi" ? "नियोजित कुआँ — अभी कोई रिपोर्ट नहीं।" : "Planned well — no reports yet."}</p>;
  return (
    <ul className="space-y-2">
      {well.documents.map((d) => {
        const Icon = d.scanned ? FileScan : FileText;
        return (
          <li
            key={d.id}
            id={d.id}
            className={cn("flex items-center gap-3 rounded-lg border bg-card p-3", highlight === d.id && "ring-2 ring-primary")}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
              <Icon className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{d.title}</p>
              <p className="text-xs text-muted-foreground">
                {d.kind} · {d.pages} {lang === "hi" ? "पृष्ठ" : "pages"} · {d.date}
                {d.scanned && (lang === "hi" ? " · स्कैन (OCR)" : " · scanned (OCR)")}
              </p>
            </div>
            <div className="text-right text-xs">
              {d.status === "extracted" ? (
                <span className="inline-flex items-center gap-1 font-medium text-risk-low">
                  <CheckCircle2 className="size-4" /> {lang === "hi" ? "AI द्वारा निकाला" : "AI-extracted"}
                </span>
              ) : d.status === "processing" ? (
                <span className="inline-flex items-center gap-1 font-medium text-risk-med">
                  <Loader2 className="size-4 animate-spin" /> {lang === "hi" ? "प्रोसेसिंग" : "Processing"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock3 className="size-4" /> {lang === "hi" ? "कतार में" : "Queued"}
                </span>
              )}
              <p className="mt-0.5 text-muted-foreground tabular">
                {d.fields} {lang === "hi" ? "फ़ील्ड" : "fields"}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
