"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Bell, Menu, Moon, Search, Sun, Languages, HardHat, Building2, CirclePlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useApp } from "@/store/app";
import { useI18n } from "@/lib/i18n";
import { ACTIVE_WELL, FIELD } from "@/data/wells";
import { formationAt } from "@/lib/risk";
import { AlertCard } from "@/components/alerts/alert-card";
import { SidebarNav } from "./sidebar";
import { CommandSearch } from "./command-search";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { startTour } from "@/components/tour/tour";

function ActiveWellChip() {
  const { t, tx } = useI18n();
  const depth = useApp((s) => s.depth);
  const running = useApp((s) => s.running);
  const fm = formationAt(ACTIVE_WELL, depth);
  return (
    <Link
      href="/live"
      data-tour="active-chip"
      className="flex items-center gap-2.5 rounded-md border bg-card px-2.5 py-1 text-sm whitespace-nowrap hover:bg-muted"
    >
      <span className="relative flex size-2.5">
        {running && <span className="absolute inline-flex size-full rounded-full bg-live animate-pulse-ring" />}
        <span className={cn("relative inline-flex size-2.5 rounded-full", running ? "bg-live" : "bg-muted-foreground/50")} />
      </span>
      <span className="hidden text-muted-foreground 2xl:inline">{t("activeWell")}</span>
      <span className="font-semibold">{ACTIVE_WELL.id}</span>
      <span className="h-4 w-px bg-border" />
      <span className="font-mono tabular font-semibold">{Math.round(depth).toLocaleString("en-IN")} m</span>
      <span className="hidden items-center gap-1.5 text-muted-foreground md:flex">
        <span className="size-2.5 rounded-sm" style={{ background: fm.color }} />
        {tx(fm.name, fm.nameHi)}
      </span>
    </Link>
  );
}

function AlertsBell() {
  const { t } = useI18n();
  const alerts = useApp((s) => s.alerts);
  const fresh = alerts.filter((a) => a.status === "new").length;
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label={`${t("alerts")} (${fresh})`}>
            <Bell className="size-5" />
            {fresh > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-risk-high px-1 text-[10px] font-bold text-white tabular">
                {fresh}
              </span>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-[400px] max-w-[calc(100vw-24px)] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">{t("alerts")}</p>
          <Link href="/live" className="text-xs font-medium text-primary hover:underline">
            {t("nav_live")} →
          </Link>
        </div>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-2">
          {alerts.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">{t("noAlerts")}</p>
          ) : (
            alerts.map((a) => <AlertCard key={a.id} alert={a} compact />)
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ModeToggle() {
  const { t } = useI18n();
  const mode = useApp((s) => s.mode);
  const setMode = useApp((s) => s.setMode);
  return (
    <div role="radiogroup" aria-label="Mode" data-tour="mode" className="hidden items-center rounded-md border bg-muted p-0.5 sm:flex">
      {(["field", "office"] as const).map((m) => {
        const Icon = m === "field" ? HardHat : Building2;
        return (
          <Tooltip key={m}>
            <TooltipTrigger
              render={
                <button
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors",
                    mode === m ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {m === "field" ? t("modeField") : t("modeOffice")}
                </button>
              }
            />
            <TooltipContent>{m === "field" ? t("modeHint") : "Office mode: full analytics"}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function Topbar() {
  const { t, tx, lang } = useI18n();
  const setLang = useApp((s) => s.setLang);
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 sm:px-5">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
        <Menu className="size-5" />
      </Button>
      <Link href="/" className="flex items-center gap-2 lg:hidden">
        <Logo className="size-7" />
        <span className="hidden font-bold sm:inline">NWIS</span>
      </Link>

      <div className="hidden items-center gap-1.5 text-sm whitespace-nowrap xl:flex">
        <span className="text-muted-foreground">{tx(FIELD.name, FIELD.nameHi)}</span>
      </div>
      <div className="mx-1 hidden h-6 w-px bg-border xl:block" />
      <ActiveWellChip />

      <div className="flex-1" />

      <button
        onClick={() => setSearchOpen(true)}
        data-tour="search"
        className="hidden h-9 w-56 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground hover:bg-muted xl:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate text-left">{t("search")}</span>
        <kbd className="rounded border bg-muted px-1.5 font-mono text-[10px]">Ctrl K</kbd>
      </button>
      <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setSearchOpen(true)} aria-label={t("search")}>
        <Search className="size-5" />
      </Button>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="outline" size="sm" className="hidden gap-1.5 md:inline-flex" onClick={() => startTour()}>
              <CirclePlay /> {t("tour")}
            </Button>
          }
        />
        <TooltipContent>{tx("A 2-minute walkthrough of the platform", "प्लेटफ़ॉर्म का 2 मिनट का परिचय")}</TooltipContent>
      </Tooltip>

      <ModeToggle />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              aria-label={t("language")}
              className="gap-1.5 font-semibold"
            >
              <Languages className="size-4" />
              {lang === "en" ? "हिंदी" : "English"}
            </Button>
          }
        />
        <TooltipContent>{t("language")}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label={t("theme")}
            >
              <Sun className="size-5 dark:hidden" />
              <Moon className="hidden size-5 dark:block" />
            </Button>
          }
        />
        <TooltipContent>{t("theme")}</TooltipContent>
      </Tooltip>

      <AlertsBell />

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="flex h-14 items-center gap-2 border-b px-4">
            <Logo className="size-7" /> NWIS
          </SheetTitle>
          <div className="overflow-y-auto">
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
