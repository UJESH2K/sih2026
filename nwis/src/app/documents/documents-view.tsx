"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileScan, FileUp, Loader2, ScanText, Tags, Table2, DatabaseZap, RotateCcw, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALL_DOCS } from "@/data/wells";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ENT_META, SAMPLES, type Seg } from "./samples";

const STAGES = [
  { icon: FileUp, en: "Upload", hi: "अपलोड" },
  { icon: ScanText, en: "OCR — read text", hi: "OCR — पाठ पढ़ना" },
  { icon: Tags, en: "NLP — find entities", hi: "NLP — तत्व पहचान" },
  { icon: Table2, en: "Structure record", hi: "संरचित रिकॉर्ड" },
  { icon: DatabaseZap, en: "Add to knowledge base", hi: "ज्ञान भंडार में जोड़ें" },
];

function Line({ segs, ocr, nlp }: { segs: Seg[]; ocr: boolean; nlp: boolean }) {
  return (
    <div className={cn("relative rounded-[2px] px-1 transition-colors", ocr && "outline outline-1 outline-sky-500/40")}>
      {segs.map((s, i) =>
        typeof s === "string" ? (
          <span key={i}>{s}</span>
        ) : (
          <span
            key={i}
            className={cn("relative rounded-[3px] transition-all duration-500", s.f === "_title" && "font-bold tracking-widest")}
            style={nlp && s.f !== "_title" ? { background: `${ENT_META[s.e].color}26`, boxShadow: `inset 0 -2px 0 ${ENT_META[s.e].color}` } : undefined}
          >
            {s.t}
            {nlp && s.f !== "_title" && (
              <sup className="ml-0.5 rounded px-0.5 font-sans text-[8px] font-bold text-white" style={{ background: ENT_META[s.e].color }}>
                {ENT_META[s.e].label.toUpperCase()}
              </sup>
            )}
          </span>
        ),
      )}
    </div>
  );
}

export function DocumentsView() {
  const { lang } = useI18n();
  const [docIdx, setDocIdx] = useState(0);
  const [stage, setStage] = useState(-1); // -1 idle
  const [lines, setLines] = useState(0);
  const [dropped, setDropped] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const doc = SAMPLES[docIdx];

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);

  const run = () => {
    clear();
    setStage(0);
    setLines(0);
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    at(600, () => setStage(1));
    doc.lines.forEach((_, i) => at(700 + i * 170, () => setLines(i + 1)));
    const ocrEnd = 900 + doc.lines.length * 170;
    at(ocrEnd, () => setStage(2));
    at(ocrEnd + 1500, () => setStage(3));
    at(ocrEnd + 2600, () => setStage(4));
  };
  const reset = () => {
    clear();
    setStage(-1);
    setLines(0);
  };

  const scanned = ALL_DOCS.filter((d) => d.scanned).length;
  const pages = ALL_DOCS.reduce((s, d) => s + d.pages, 0);
  const fields = ALL_DOCS.reduce((s, d) => s + d.fields, 0);

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6" data-tour="documents">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{lang === "hi" ? "दस्तावेज़ AI" : "Document AI"}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            {lang === "hi"
              ? "पुरानी स्कैन की गई DDR और WCR रिपोर्टें OCR और NLP से पढ़ी जाती हैं और खोज योग्य रिकॉर्ड बनती हैं।"
              : "Old scanned DDRs and WCRs are read with OCR and NLP, and every depth, event, action and NPT becomes a searchable record linked back to its page."}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            [ALL_DOCS.length, lang === "hi" ? "दस्तावेज़" : "documents"],
            [pages.toLocaleString("en-IN"), lang === "hi" ? "पृष्ठ" : "pages"],
            [fields.toLocaleString("en-IN"), lang === "hi" ? "फ़ील्ड निकाले" : "fields extracted"],
          ].map(([v, l]) => (
            <div key={String(l)} className="rounded-lg border bg-card px-4 py-2">
              <p className="font-mono text-xl font-bold tabular">{v}</p>
              <p className="text-xs text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* pipeline */}
      <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STAGES.map((s, i) => {
          const Icon = s.icon;
          const done = stage > i || stage === 4;
          const active = stage === i && stage !== 4;
          return (
            <li
              key={s.en}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm transition-colors",
                done && "border-risk-low/40 bg-risk-low-bg",
                active && "border-primary ring-2 ring-primary/20",
              )}
            >
              {done ? <CheckCircle2 className="size-5 text-risk-low" /> : active ? <Loader2 className="size-5 animate-spin text-primary" /> : <Icon className="size-5 text-muted-foreground" />}
              <span className="font-medium">
                <span className="mr-1 font-mono text-xs text-muted-foreground">{i + 1}</span>
                {s[lang]}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 grid gap-4 xl:grid-cols-[260px_1fr_1fr]">
        {/* sample picker + drop zone */}
        <aside className="space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f) {
                setDropped(f.name);
                run();
              }
            }}
            className={cn("rounded-lg border-2 border-dashed bg-card p-4 text-center text-sm transition-colors", drag && "border-primary bg-accent")}
          >
            <FileUp className="mx-auto size-7 text-muted-foreground" />
            <p className="mt-2 font-medium">{lang === "hi" ? "PDF / स्कैन यहाँ छोड़ें" : "Drop a PDF or scan here"}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "hi" ? "डेमो में नमूना पृष्ठ प्रोसेस होगा" : "In this demo, the sample page is processed"}
            </p>
            <label className="mt-2 inline-block cursor-pointer text-xs font-medium text-primary hover:underline">
              {lang === "hi" ? "फ़ाइल चुनें" : "or choose a file"}
              <input
                type="file"
                className="sr-only"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setDropped(f.name);
                    run();
                  }
                }}
              />
            </label>
            {dropped && <p className="mt-2 truncate font-mono text-xs">{dropped}</p>}
          </div>
          <p className="text-xs font-semibold text-muted-foreground">{lang === "hi" ? "नमूना दस्तावेज़" : "Sample documents"}</p>
          {SAMPLES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setDocIdx(i);
                reset();
              }}
              className={cn("flex w-full items-start gap-2.5 rounded-lg border bg-card p-3 text-left transition", docIdx === i ? "border-primary ring-2 ring-primary/20" : "hover:bg-muted")}
            >
              <FileScan className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <span>
                <span className="block text-sm font-medium">{s.title}</span>
                <span className="block text-xs text-muted-foreground">
                  {s.kind} · {s.year}
                </span>
                <span className="block text-[11px] text-muted-foreground">{s.quality}</span>
              </span>
            </button>
          ))}
          <div className="flex gap-2">
            <Button size="lg" className="flex-1" onClick={run} disabled={stage >= 0 && stage < 4}>
              <Play /> {lang === "hi" ? "निष्कर्षण चलाएँ" : "Run extraction"}
            </Button>
            <Button size="lg" variant="outline" onClick={reset} aria-label="Reset">
              <RotateCcw />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {scanned} {lang === "hi" ? "पुराने स्कैन दस्तावेज़ OCR से पढ़े गए" : "legacy scanned documents in this field were read with OCR"}
          </p>
        </aside>

        {/* scanned page */}
        <section className="min-w-0">
          <p className="mb-2 text-sm font-semibold">{lang === "hi" ? "मूल स्कैन" : "Original scan"}</p>
          <div className="relative overflow-hidden rounded-lg border bg-[#f4efe2] p-5 shadow-inner dark:bg-[#d9d2c0]">
            <div
              className="origin-top-left font-mono text-[12.5px] leading-[1.9] text-[#2b2a26]"
              style={{ transform: "rotate(-0.6deg)", filter: "contrast(1.05)", textShadow: "0 0 0.6px rgba(0,0,0,.4)" }}
            >
              {doc.lines.map((l, i) => (
                <Line key={i} segs={l} ocr={stage >= 1 && i < lines} nlp={stage >= 2} />
              ))}
            </div>
            {stage === 1 && <div className="animate-scanline absolute inset-x-0 h-8 bg-gradient-to-b from-sky-400/0 via-sky-400/30 to-sky-400/0" />}
            <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(#000 0.6px, transparent 0.6px)", backgroundSize: "5px 5px" }} />
          </div>
          {stage >= 2 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(ENT_META).map(([k, m]) => (
                <span key={k} className="inline-flex items-center gap-1 text-[11px]">
                  <span className="size-2 rounded-sm" style={{ background: m.color }} /> {m.label}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* extracted */}
        <section className="min-w-0">
          <p className="mb-2 text-sm font-semibold">{lang === "hi" ? "निकाला गया संरचित रिकॉर्ड" : "Extracted structured record"}</p>
          <div className="rounded-lg border bg-card">
            {stage < 3 ? (
              <div className="flex h-72 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
                {stage < 0 ? (
                  <>
                    <Table2 className="size-8" />
                    {lang === "hi" ? "“निष्कर्षण चलाएँ” दबाएँ" : "Press “Run extraction” to see the page become data."}
                  </>
                ) : (
                  <>
                    <Loader2 className="size-8 animate-spin text-primary" />
                    {stage === 1 ? (lang === "hi" ? "पाठ पढ़ा जा रहा है…" : "Reading text (OCR)…") : lang === "hi" ? "तत्व पहचाने जा रहे हैं…" : "Tagging depths, events, actions (NLP)…"}
                  </>
                )}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{lang === "hi" ? "फ़ील्ड" : "Field"}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{lang === "hi" ? "मान" : "Value"}</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">{lang === "hi" ? "विश्वास" : "Confidence"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {doc.record.map((r, i) => (
                    <tr key={r.field} className="animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 70}ms`, animationFillMode: "backwards" }}>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-2 rounded-sm" style={{ background: ENT_META[r.ent].color }} />
                          {r.field}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-medium">{r.value}</td>
                      <td className={cn("px-3 py-2 text-right font-mono text-xs tabular", r.conf < 0.9 ? "text-risk-med" : "text-risk-low")}>{Math.round(r.conf * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {stage >= 3 && (
            <p className="mt-2 text-xs text-muted-foreground">
              {lang === "hi" ? "90% से कम विश्वास वाले फ़ील्ड समीक्षा हेतु चिह्नित।" : "Fields below 90% confidence are flagged for a quick human check before they are used in alerts."}
            </p>
          )}
          {stage === 4 && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-risk-low/40 bg-risk-low-bg p-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-risk-low">
                <CheckCircle2 className="size-5" /> {doc.linksTo.label}
              </span>
              <Link href={doc.linksTo.href} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                {lang === "hi" ? "देखें" : "View"} <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
