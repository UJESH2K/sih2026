import {
  Droplets,
  TriangleAlert,
  Lock,
  MoveVertical,
  RotateCw,
  Layers,
  Anchor,
  CircleDot,
  Mountain,
  type LucideIcon,
} from "lucide-react";
import type { EventType, WellStatus } from "@/data/types";

export interface EventMeta {
  label: string;
  labelHi: string;
  short: string;
  icon: LucideIcon;
  color: string; // hex, for map + charts
}

export const EVENT_META: Record<EventType, EventMeta> = {
  mud_loss: { label: "Mud loss", labelHi: "मड लॉस", short: "Loss", icon: Droplets, color: "#2a78d6" },
  kick: { label: "Kick / influx", labelHi: "किक", short: "Kick", icon: TriangleAlert, color: "#eb6834" },
  stuck_pipe: { label: "Stuck pipe", labelHi: "अटका पाइप", short: "Stuck", icon: Lock, color: "#4a3aa7" },
  tight_hole: { label: "Tight hole", labelHi: "टाइट होल", short: "Tight", icon: MoveVertical, color: "#1baf7a" },
  torque_spike: { label: "Torque spike", labelHi: "टॉर्क स्पाइक", short: "Torque", icon: RotateCw, color: "#eda100" },
  cement_issue: { label: "Cementing issue", labelHi: "सीमेंटिंग समस्या", short: "Cement", icon: Layers, color: "#e87ba4" },
  fishing: { label: "Fishing", labelHi: "फिशिंग", short: "Fishing", icon: Anchor, color: "#8a5a44" },
  bit_balling: { label: "Bit balling", labelHi: "बिट बॉलिंग", short: "Balling", icon: CircleDot, color: "#008300" },
  wellbore_instability: { label: "Wellbore instability", labelHi: "कुआँ अस्थिरता", short: "Instab.", icon: Mountain, color: "#7d8793" },
};

export const EVENT_TYPES = Object.keys(EVENT_META) as EventType[];

export const STATUS_META: Record<WellStatus, { label: string; labelHi: string; color: string; rgb: [number, number, number] }> = {
  drilling: { label: "Drilling now", labelHi: "ड्रिलिंग जारी", color: "#1F6FEB", rgb: [31, 111, 235] },
  producing: { label: "Producing", labelHi: "उत्पादनरत", color: "#2E8B57", rgb: [46, 139, 87] },
  suspended: { label: "Suspended", labelHi: "निलंबित", color: "#C98A0B", rgb: [201, 138, 11] },
  abandoned: { label: "Abandoned", labelHi: "परित्यक्त", color: "#7C8591", rgb: [124, 133, 145] },
  planned: { label: "Planned", labelHi: "नियोजित", color: "#8E7CC3", rgb: [142, 124, 195] },
};

export type RiskLevel = "low" | "med" | "high";
export function riskLevel(p: number): RiskLevel {
  return p >= 0.6 ? "high" : p >= 0.35 ? "med" : "low";
}
export const RISK_RGB: Record<RiskLevel, [number, number, number]> = {
  low: [46, 139, 87],
  med: [214, 150, 20],
  high: [206, 58, 44],
};
export const RISK_LABEL: Record<RiskLevel, { en: string; hi: string }> = {
  low: { en: "Low", hi: "कम" },
  med: { en: "Medium", hi: "मध्यम" },
  high: { en: "High", hi: "उच्च" },
};
