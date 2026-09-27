import {
  LayoutDashboard,
  Map,
  Activity,
  Rows3,
  Search,
  MessageSquareText,
  ScanText,
  BarChart3,
  Database,
  type LucideIcon,
} from "lucide-react";
import type { TKey } from "@/lib/i18n";

export interface NavItem {
  href: string;
  label: TKey;
  icon: LucideIcon;
  section: "nav_section_ops" | "nav_section_knowledge" | "nav_section_office";
  field: boolean; // visible in Field mode
  desc: { en: string; hi: string };
}

export const NAV: NavItem[] = [
  { href: "/", label: "nav_overview", icon: LayoutDashboard, section: "nav_section_ops", field: true, desc: { en: "Status of the active well at a glance", hi: "सक्रिय कुएँ की स्थिति एक नज़र में" } },
  { href: "/map", label: "nav_map", icon: Map, section: "nav_section_ops", field: true, desc: { en: "Offset wells around the rig on a 3D map", hi: "रिग के आसपास के कुएँ 3D नक्शे पर" } },
  { href: "/live", label: "nav_live", icon: Activity, section: "nav_section_ops", field: true, desc: { en: "Live parameters, look-ahead risk and alerts", hi: "लाइव मान, आगे का जोखिम और चेतावनियाँ" } },
  { href: "/correlation", label: "nav_correlation", icon: Rows3, section: "nav_section_ops", field: false, desc: { en: "Compare wells side by side by formation", hi: "संरचना के अनुसार कुओं की तुलना" } },
  { href: "/assistant", label: "nav_assistant", icon: MessageSquareText, section: "nav_section_knowledge", field: true, desc: { en: "Ask questions in plain language", hi: "सरल भाषा में प्रश्न पूछें" } },
  { href: "/knowledge", label: "nav_knowledge", icon: Search, section: "nav_section_knowledge", field: false, desc: { en: "Search all past events and lessons", hi: "सभी पिछली घटनाएँ और सीख खोजें" } },
  { href: "/wells", label: "nav_wells", icon: Database, section: "nav_section_knowledge", field: false, desc: { en: "Every well's history, casing, mud and documents", hi: "हर कुएँ का इतिहास और दस्तावेज़" } },
  { href: "/documents", label: "nav_documents", icon: ScanText, section: "nav_section_office", field: false, desc: { en: "Turn scanned reports into structured data", hi: "स्कैन रिपोर्ट को संरचित डेटा में बदलें" } },
  { href: "/dashboard", label: "nav_dashboard", icon: BarChart3, section: "nav_section_office", field: false, desc: { en: "Field-wide risk and NPT analytics", hi: "पूरे क्षेत्र का जोखिम और NPT विश्लेषण" } },
];
