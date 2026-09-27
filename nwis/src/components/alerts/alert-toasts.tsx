"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useApp } from "@/store/app";
import { alertSummary, alertTitle } from "@/lib/alert-text";

/** Raises a toast whenever the engine creates a new alert. */
export function AlertToasts() {
  const alerts = useApp((s) => s.alerts);
  const seen = useRef(new Set<string>());
  const router = useRouter();

  useEffect(() => {
    if (alerts.length === 0) {
      seen.current.clear();
      return;
    }
    const lang = useApp.getState().lang;
    for (const a of [...alerts].reverse()) {
      if (seen.current.has(a.id)) continue;
      seen.current.add(a.id);
      const fn = a.level === "high" ? toast.error : a.level === "med" ? toast.warning : toast.info;
      fn(alertTitle(a, lang), {
        description: alertSummary(a, lang),
        duration: 9000,
        action: { label: lang === "hi" ? "देखें" : "Review", onClick: () => router.push("/live") },
      });
    }
  }, [alerts, router]);

  return null;
}
