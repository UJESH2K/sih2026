import type { NwisAlert } from "@/store/app";
import { EVENT_META, RISK_LABEL } from "./event-meta";

export function alertTitle(a: NwisAlert, lang: "en" | "hi") {
  const m = EVENT_META[a.type];
  const lvl = RISK_LABEL[a.level][lang].toUpperCase();
  if (a.kind === "realtime") {
    return lang === "hi" ? `${m.labelHi} के संकेत — अभी` : `${m.label} signature detected now`;
  }
  return lang === "hi"
    ? `${m.labelHi} जोखिम: ${lvl} (${Math.round(a.p * 100)}%)`
    : `${m.label} risk: ${lvl} (${Math.round(a.p * 100)}%)`;
}

export function alertSummary(a: NwisAlert, lang: "en" | "hi") {
  if (a.kind === "realtime") return a.signal ?? "";
  const ahead = Math.max(0, Math.round(a.targetDepth - a.raisedAtDepth));
  if (lang === "hi") {
    return `${a.formation} में ~${ahead} मी. आगे (${a.targetDepth.toLocaleString("en-IN")} मी.)। ${a.offsetsConsidered} में से ${a.wells.length} ऑफ़सेट कुओं में इस गहराई पर यह समस्या आई थी।`;
  }
  return `In ${a.formation}, ~${ahead} m ahead (${a.targetDepth.toLocaleString("en-IN")} m). ${a.wells.length} of ${a.offsetsConsidered} offset wells had this problem at the equivalent depth.`;
}

export const fmtM = (m: number) => `${Math.round(m).toLocaleString("en-IN")} m`;
