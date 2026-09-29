"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bot, FileText, Send, Sparkles, User, ShieldCheck, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { answer, SUGGESTED, type Answer } from "@/lib/assistant";
import { useApp } from "@/store/app";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Msg {
  id: number;
  role: "user" | "bot";
  text?: string;
  answer?: Answer;
}

/** Reveals an answer progressively (streaming effect). */
function useReveal(total: number, active: boolean) {
  const [n, setN] = useState(active ? 0 : total);
  useEffect(() => {
    if (!active) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(total);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 3;
      setN(Math.min(total, i));
      if (i >= total) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [total, active]);
  return n;
}

function Cites({ cites, sources }: { cites: number[]; sources: Answer["sources"] }) {
  return (
    <>
      {cites.map((c) => {
        const s = sources.find((x) => x.n === c);
        return (
          <Link
            key={c}
            href={s?.href ?? "#"}
            title={s?.label}
            className="ml-0.5 inline-flex h-4 min-w-4 -translate-y-0.5 items-center justify-center rounded bg-accent px-1 font-mono text-[10px] font-bold text-accent-foreground hover:bg-primary hover:text-primary-foreground"
          >
            {c}
          </Link>
        );
      })}
    </>
  );
}

function BotAnswer({ a, animate, onFollow }: { a: Answer; animate: boolean; onFollow: (q: string) => void }) {
  const { lang } = useI18n();
  const words = [a.intro, ...a.bullets.map((b) => b.text), a.outro ?? ""].join(" ").split(" ").length;
  const n = useReveal(words, animate);
  const done = n >= words;
  let budget = n;
  const take = (s: string) => {
    const w = s.split(" ");
    const out = w.slice(0, Math.max(0, budget)).join(" ");
    budget -= w.length;
    return out;
  };
  const intro = take(a.intro);
  const bullets = a.bullets.map((b) => ({ ...b, shown: take(b.text) }));
  const outro = a.outro ? take(a.outro) : "";

  return (
    <div className="space-y-3">
      {a.parsed.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{lang === "hi" ? "समझा गया:" : "Understood as:"}</span>
          {a.parsed.map((p) => (
            <span key={p} className="rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium">
              {p}
            </span>
          ))}
        </div>
      )}
      <p className="leading-relaxed">{intro}</p>
      {bullets.some((b) => b.shown) && (
        <ul className="space-y-1.5">
          {bullets
            .filter((b) => b.shown)
            .map((b, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  {b.shown}
                  {b.shown.length === b.text.length && <Cites cites={b.cites} sources={a.sources} />}
                </span>
              </li>
            ))}
        </ul>
      )}
      {outro && <p className="rounded-md border-l-4 border-primary bg-accent/50 px-3 py-2 text-sm leading-relaxed">{outro}</p>}
      {done && a.table && (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                {a.table.head.map((h) => (
                  <th key={h} className="px-3 py-1.5 text-left text-xs font-semibold text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {a.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className={cn("px-3 py-1.5", j > 0 && "font-mono tabular")}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {done && a.sources.length > 0 && (
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5" /> {lang === "hi" ? "स्रोत" : "Sources"} ({a.sources.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {a.sources.map((s) => (
              <Link key={s.n} href={s.href} className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs hover:bg-muted">
                <span className="font-mono font-bold text-primary">{s.n}</span>
                <FileText className="size-3.5 text-muted-foreground" />
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      {done && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {a.followups.map((f) => (
            <button key={f} onClick={() => onFollow(f)} className="rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-medium text-primary hover:bg-accent">
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AssistantView() {
  const { lang } = useI18n();
  const params = useSearchParams();
  const radius = useApp((s) => s.radiusKm);
  const depth = useApp((s) => s.depth);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const idRef = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const asked = useRef<string | null>(null);

  const ask = (q: string) => {
    if (!q.trim() || thinking) return;
    setMsgs((m) => [...m, { id: ++idRef.current, role: "user", text: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { id: ++idRef.current, role: "bot", answer: answer(q, radius, depth) }]);
      setThinking(false);
    }, 650);
  };

  useEffect(() => {
    const q = params.get("q");
    if (q && asked.current !== q) {
      asked.current = q;
      ask(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, thinking]);

  const lastBot = [...msgs].reverse().find((m) => m.role === "bot")?.id;

  return (
    <div className="flex h-full flex-col" data-tour="assistant">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
          {msgs.length === 0 && (
            <div className="pt-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Sparkles className="size-6" />
              </div>
              <h1 className="mt-3 text-2xl font-bold">{lang === "hi" ? "NWIS से पूछें" : "Ask NWIS"}</h1>
              <p className="mx-auto mt-1 max-w-lg text-muted-foreground">
                {lang === "hi"
                  ? "पिछले कुओं के अनुभव के बारे में सरल भाषा में पूछें। हर उत्तर स्रोत रिपोर्ट और पृष्ठ के साथ आता है।"
                  : "Ask about past wells in plain language. Every answer comes from the knowledge base and cites the source report and page."}
              </p>
              <div className="mx-auto mt-6 grid max-w-2xl gap-2 sm:grid-cols-2">
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="rounded-lg border bg-card p-3 text-left text-sm transition hover:border-primary/50 hover:bg-accent/40">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m) => (
            <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
              <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground")}>
                {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div className={cn("min-w-0 rounded-xl px-4 py-3", m.role === "user" ? "max-w-[80%] bg-primary text-primary-foreground" : "flex-1 border bg-card")}>
                {m.role === "user" ? <p>{m.text}</p> : <BotAnswer a={m.answer!} animate={m.id === lastBot} onFollow={ask} />}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Bot className="size-4" />
              </div>
              <div className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  {lang === "hi" ? "ज्ञान भंडार खोजा जा रहा है" : "Searching 90 reports and 49 events"}
                  <span className="animate-pulse">…</span>
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
      <div className="border-t bg-background/95 p-3 backdrop-blur">
        <form
          className="mx-auto flex max-w-3xl gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === "hi" ? "प्रश्न लिखें… (हिंदी या English)" : "Ask about wells, formations, problems, depths…"}
            className="h-11 flex-1 rounded-lg border bg-card px-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Question"
          />
          <Button type="button" variant="outline" size="icon-lg" className="size-11" title={lang === "hi" ? "आवाज़ (जल्द)" : "Voice input (planned for rig use)"} disabled>
            <Mic />
          </Button>
          <Button type="submit" size="lg" className="h-11 px-4" disabled={!input.trim() || thinking}>
            <Send /> <span className="hidden sm:inline">{lang === "hi" ? "पूछें" : "Ask"}</span>
          </Button>
        </form>
        <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-muted-foreground">
          {lang === "hi" ? "उत्तर केवल NWIS ज्ञान भंडार से — स्रोत हमेशा दिखाए जाते हैं।" : "Answers are grounded only in the NWIS knowledge base, and sources are always shown."}
        </p>
      </div>
    </div>
  );
}
