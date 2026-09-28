"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, MessageSquareText, Search } from "lucide-react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { NAV } from "./nav";
import { useI18n } from "@/lib/i18n";
import { ALL_EVENTS, WELLS } from "@/data/wells";
import { EVENT_META, STATUS_META } from "@/lib/event-meta";

export function CommandSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    setQ("");
    router.push(href);
  };

  const events = useMemo(() => ALL_EVENTS.slice().sort((a, b) => b.severity - a.severity), []);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search NWIS" description={t("search")}>
      <Command>
        <CommandInput placeholder={t("search")} value={q} onValueChange={setQ} />
        <CommandList className="max-h-[60vh]">
          <CommandEmpty>No results.</CommandEmpty>
          {q.trim().length > 1 && (
            <CommandGroup heading={lang === "hi" ? "कार्रवाई" : "Actions"}>
              <CommandItem value={`search-knowledge ${q}`} onSelect={() => go(`/knowledge?q=${encodeURIComponent(q)}`)}>
                <Search /> {lang === "hi" ? "ज्ञान भंडार में खोजें:" : "Search knowledge base for"} “{q}”
              </CommandItem>
              <CommandItem value={`ask ${q}`} onSelect={() => go(`/assistant?q=${encodeURIComponent(q)}`)}>
                <MessageSquareText /> {lang === "hi" ? "NWIS से पूछें:" : "Ask NWIS:"} “{q}”
              </CommandItem>
            </CommandGroup>
          )}
          <CommandGroup heading={lang === "hi" ? "पृष्ठ" : "Pages"}>
            {NAV.map((n) => {
              const Icon = n.icon;
              return (
                <CommandItem key={n.href} value={`page ${t(n.label)} ${n.desc.en}`} onSelect={() => go(n.href)}>
                  <Icon /> {t(n.label)}
                  <span className="ml-auto truncate text-xs text-muted-foreground">{n.desc[lang]}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandGroup heading={lang === "hi" ? "कुएँ" : "Wells"}>
            {WELLS.map((w) => (
              <CommandItem key={w.id} value={`well ${w.id} ${w.status} ${w.result}`} onSelect={() => go(`/wells/${w.id}`)}>
                <Database />
                <span className="font-mono">{w.id}</span>
                <span className="text-xs text-muted-foreground">{STATUS_META[w.status].label}</span>
                <span className="ml-auto truncate text-xs text-muted-foreground">{w.result}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={lang === "hi" ? "घटनाएँ" : "Drilling events"}>
            {events.map((e) => {
              const m = EVENT_META[e.type];
              const Icon = m.icon;
              return (
                <CommandItem
                  key={e.id}
                  value={`event ${m.label} ${e.formation} ${e.wellId} ${e.depth_m} ${e.details}`}
                  onSelect={() => go(`/wells/${e.wellId}?tab=events&event=${e.id}`)}
                >
                  <Icon style={{ color: m.color }} />
                  {m.label} · {e.wellId} @ {e.depth_m.toLocaleString("en-IN")} m
                  <span className="ml-auto text-xs text-muted-foreground">{e.formation}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
