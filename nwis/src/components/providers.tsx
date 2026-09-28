"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useApp, type Lang, type Mode } from "@/store/app";
import { AlertToasts } from "@/components/alerts/alert-toasts";

/** Drives the live replay clock for the whole app (persists across pages). */
function SimulationDriver() {
  const running = useApp((s) => s.running);
  const tick = useApp((s) => s.tick);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!running) {
      last.current = null;
      return;
    }
    let raf = 0;
    const loop = (t: number) => {
      if (last.current != null) tick(Math.min(0.25, (t - last.current) / 1000));
      last.current = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, tick]);
  return null;
}

/** Persists language + field/office mode per viewer. */
function PrefsSync() {
  const lang = useApp((s) => s.lang);
  const mode = useApp((s) => s.mode);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const l = localStorage.getItem("nwis.lang") as Lang | null;
      const m = localStorage.getItem("nwis.mode") as Mode | null;
      if (l === "en" || l === "hi") useApp.getState().setLang(l);
      if (m === "field" || m === "office") useApp.getState().setMode(m);
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "hi" ? "hi" : "en";
    document.documentElement.dataset.mode = mode;
    if (!loaded.current) return;
    try {
      localStorage.setItem("nwis.lang", lang);
      localStorage.setItem("nwis.mode", mode);
    } catch {}
  }, [lang, mode]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <TooltipProvider delay={250}>
        {children}
        <SimulationDriver />
        <PrefsSync />
        <AlertToasts />
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  );
}
