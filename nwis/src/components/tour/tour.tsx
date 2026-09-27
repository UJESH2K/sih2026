"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { create } from "zustand";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/store/app";

interface Step {
  route: string;
  target?: string;
  title: { en: string; hi: string };
  body: { en: string; hi: string };
  onEnter?: () => void;
}

const STEPS: Step[] = [
  {
    route: "/",
    target: "[data-tour=overview-hero]",
    title: { en: "One screen: where are we, what's next", hi: "एक स्क्रीन: हम कहाँ हैं, आगे क्या" },
    body: {
      en: "NWIS gives the drilling team the collective memory of every nearby well, and warns them before they reach the depth where those wells had trouble.",
      hi: "NWIS ड्रिलिंग टीम को हर निकटवर्ती कुएँ की सामूहिक स्मृति देता है और समस्या वाली गहराई से पहले चेतावनी देता है।",
    },
  },
  {
    route: "/map",
    target: "[data-tour=map-radius]",
    title: { en: "Nearby wells within your radius", hi: "आपकी त्रिज्या में निकटवर्ती कुएँ" },
    body: {
      en: "Drag the radius. Wells inside light up, and the list shows each one's distance and direction from the rig.",
      hi: "त्रिज्या बदलें — अंदर के कुएँ उभर आते हैं, सूची में दूरी और दिशा दिखती है।",
    },
    onEnter: () => useApp.getState().setRadius(5),
  },
  {
    route: "/map",
    target: "[data-tour=map-canvas]",
    title: { en: "Every well as a 3D depth column", hi: "हर कुआँ एक 3D गहराई स्तंभ" },
    body: {
      en: "Column height is total depth and colour is status. Click any well to see its history, events and documents.",
      hi: "स्तंभ ऊँचाई = कुल गहराई, रंग = स्थिति। इतिहास देखने के लिए किसी कुएँ पर क्लिक करें।",
    },
  },
  {
    route: "/live",
    target: "[data-tour=live-controls]",
    title: { en: "Live drilling with look-ahead", hi: "लाइव ड्रिलिंग और आगे की जानकारी" },
    body: {
      en: "We replay the eRTMAC stream. NWIS continuously compares the next 200 m with what happened in offset wells at the same formation depth.",
      hi: "eRTMAC स्ट्रीम का रीप्ले। NWIS अगले 200 मी. की तुलना ऑफ़सेट कुओं से करता है।",
    },
    onEnter: () => {
      const s = useApp.getState();
      if (!s.running) s.start();
      s.setSpeed(2);
    },
  },
  {
    route: "/live",
    target: "[data-tour=live-alerts]",
    title: { en: "Proactive alerts with evidence", hi: "प्रमाण सहित अग्रिम चेतावनी" },
    body: {
      en: "Each alert says what, where, how likely, and what worked before, with the source reports. Apply the recommendation and the live data responds.",
      hi: "हर चेतावनी बताती है — क्या, कहाँ, कितनी संभावना और पहले क्या काम आया।",
    },
  },
  {
    route: "/correlation",
    target: "[data-tour=correlation]",
    title: { en: "Offset correlation by formation", hi: "संरचना अनुसार ऑफ़सेट सहसंबंध" },
    body: {
      en: "Wells side by side, aligned by formation tops. You can see at a glance that everyone had losses at the Barail top.",
      hi: "कुएँ साथ-साथ, संरचना के अनुसार संरेखित — एक नज़र में पैटर्न दिखता है।",
    },
  },
  {
    route: "/assistant",
    target: "[data-tour=assistant]",
    title: { en: "Ask in plain language", hi: "सरल भाषा में पूछें" },
    body: {
      en: "Answers come from the knowledge base and every statement cites its source document and page.",
      hi: "उत्तर ज्ञान भंडार से, हर कथन स्रोत दस्तावेज़ और पृष्ठ सहित।",
    },
  },
  {
    route: "/documents",
    target: "[data-tour=documents]",
    title: { en: "Reports become structured data", hi: "रिपोर्ट → संरचित डेटा" },
    body: {
      en: "OCR and NLP read old scanned DDRs and WCRs, and extract depths, events, actions and NPT automatically.",
      hi: "OCR और NLP पुरानी स्कैन रिपोर्ट पढ़कर गहराई, घटनाएँ, कार्रवाई और NPT निकालते हैं।",
    },
  },
  {
    route: "/dashboard",
    target: "[data-tour=dashboard]",
    title: { en: "Office view: field-wide risk", hi: "कार्यालय दृश्य: क्षेत्र-व्यापी जोखिम" },
    body: {
      en: "NPT by cause, risk by formation, and the wells that need attention, for planning and management.",
      hi: "कारण अनुसार NPT, संरचना अनुसार जोखिम — योजना और प्रबंधन के लिए।",
    },
  },
];

const useTour = create<{ step: number | null; set: (n: number | null) => void }>((set) => ({
  step: null,
  set: (step) => set({ step }),
}));

export const startTour = () => useTour.getState().set(0);

export function Tour() {
  const { step, set } = useTour();
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useI18n();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const s = step != null ? STEPS[step] : null;

  useEffect(() => {
    if (!s) return;
    if (pathname !== s.route) router.push(s.route);
    s.onEnter?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    if (!s?.target) {
      setRect(null);
      return;
    }
    const measure = () => {
      const el = document.querySelector(s.target!);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    measure();
    const id = setInterval(measure, 300);
    window.addEventListener("resize", measure);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", measure);
    };
  }, [s, pathname]);

  useEffect(() => {
    if (step == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") set(null);
      if (e.key === "ArrowRight") set(step < STEPS.length - 1 ? step + 1 : null);
      if (e.key === "ArrowLeft" && step > 0) set(step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, set]);

  if (!s || step == null) return null;
  const last = step === STEPS.length - 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" role="dialog" aria-live="polite" aria-label="Guided demo">
      {rect && (
        <div
          className="absolute rounded-lg border-2 border-primary transition-all duration-300"
          style={{
            left: rect.left - 6,
            top: rect.top - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgb(10 20 30 / 0.38)",
          }}
        />
      )}
      <div className="pointer-events-auto absolute bottom-6 left-1/2 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 rounded-xl border bg-popover p-5 text-popover-foreground shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              {lang === "hi" ? "चरण" : "Step"} {step + 1} / {STEPS.length}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{s.title[lang]}</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => set(null)} aria-label="Close tour">
            <X />
          </Button>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body[lang]}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <Button variant="outline" size="sm" disabled={step === 0} onClick={() => set(step - 1)}>
            <ArrowLeft /> {lang === "hi" ? "पीछे" : "Back"}
          </Button>
          <Button size="sm" onClick={() => set(last ? null : step + 1)}>
            {last ? (lang === "hi" ? "समाप्त" : "Finish") : lang === "hi" ? "आगे" : "Next"} {!last && <ArrowRight />}
          </Button>
        </div>
      </div>
    </div>
  );
}
