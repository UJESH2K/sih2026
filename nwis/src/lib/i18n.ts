"use client";

import { useApp } from "@/store/app";

const DICT = {
  appName: { en: "NWIS", hi: "NWIS" },
  appFull: { en: "Nearby Wells Intelligence System", hi: "निकटवर्ती कुआँ इंटेलिजेंस सिस्टम" },
  companion: { en: "Decision support alongside eRTMAC", hi: "eRTMAC के साथ निर्णय सहायता" },

  nav_overview: { en: "Overview", hi: "अवलोकन" },
  nav_map: { en: "Nearby Wells Map", hi: "निकटवर्ती कुओं का नक्शा" },
  nav_live: { en: "Live Drilling", hi: "लाइव ड्रिलिंग" },
  nav_correlation: { en: "Offset Correlation", hi: "ऑफ़सेट सहसंबंध" },
  nav_knowledge: { en: "Knowledge Search", hi: "ज्ञान खोज" },
  nav_assistant: { en: "Ask NWIS", hi: "NWIS से पूछें" },
  nav_documents: { en: "Document AI", hi: "दस्तावेज़ AI" },
  nav_dashboard: { en: "Risk Dashboard", hi: "जोखिम डैशबोर्ड" },
  nav_wells: { en: "Well Records", hi: "कुआँ रिकॉर्ड" },
  nav_section_ops: { en: "Operations", hi: "संचालन" },
  nav_section_knowledge: { en: "Knowledge", hi: "ज्ञान" },
  nav_section_office: { en: "Office", hi: "कार्यालय" },

  field: { en: "Field", hi: "क्षेत्र" },
  activeWell: { en: "Active well", hi: "सक्रिय कुआँ" },
  depth: { en: "Depth", hi: "गहराई" },
  bitDepth: { en: "Bit depth", hi: "बिट गहराई" },
  formation: { en: "Formation", hi: "संरचना" },
  search: { en: "Search wells, events, lessons…", hi: "कुएँ, घटनाएँ, सीख खोजें…" },
  alerts: { en: "Alerts", hi: "चेतावनियाँ" },
  noAlerts: { en: "No alerts yet. Start the live replay to see proactive alerts.", hi: "अभी कोई चेतावनी नहीं। लाइव रीप्ले शुरू करें।" },
  modeField: { en: "Field", hi: "फ़ील्ड" },
  modeOffice: { en: "Office", hi: "ऑफ़िस" },
  modeHint: { en: "Field mode: bigger text, alerts first", hi: "फ़ील्ड मोड: बड़ा टेक्स्ट, पहले चेतावनियाँ" },
  theme: { en: "Theme", hi: "थीम" },
  language: { en: "Language", hi: "भाषा" },
  tour: { en: "Guided demo", hi: "निर्देशित डेमो" },

  radius: { en: "Search radius", hi: "खोज त्रिज्या" },
  wellsInRadius: { en: "wells within", hi: "कुएँ इस दूरी में" },
  nearestWells: { en: "Nearest offset wells", hi: "निकटतम ऑफ़सेट कुएँ" },
  layers: { en: "Map layers", hi: "नक्शे की परतें" },
  layer_wells: { en: "Wells (3D depth columns)", hi: "कुएँ (3D गहराई स्तंभ)" },
  layer_rings: { en: "Distance rings", hi: "दूरी के घेरे" },
  layer_links: { en: "Distance lines", hi: "दूरी रेखाएँ" },
  layer_heat: { en: "Problem density (hexagons)", hi: "समस्या घनत्व (षट्भुज)" },
  layer_trajectories: { en: "Well paths (deviated)", hi: "कुआँ पथ (विचलित)" },
  layer_labels: { en: "Well names", hi: "कुओं के नाम" },
  basemap: { en: "Base map", hi: "आधार नक्शा" },
  streets: { en: "Map", hi: "नक्शा" },
  satellite: { en: "Satellite", hi: "उपग्रह" },
  legend: { en: "Legend", hi: "संकेत" },
  columnHeight: { en: "Column height = total depth", hi: "स्तंभ ऊँचाई = कुल गहराई" },
  youAreHere: { en: "Active rig", hi: "सक्रिय रिग" },
  events: { en: "events", hi: "घटनाएँ" },
  npt: { en: "NPT", hi: "NPT" },
  openWell: { en: "Open full well record", hi: "पूरा कुआँ रिकॉर्ड खोलें" },
  addCompare: { en: "Add to correlation", hi: "सहसंबंध में जोड़ें" },
  inCompare: { en: "In correlation", hi: "सहसंबंध में" },
  distance: { en: "Distance", hi: "दूरी" },
  status: { en: "Status", hi: "स्थिति" },
  totalDepth: { en: "Total depth", hi: "कुल गहराई" },
  spud: { en: "Spud date", hi: "स्पड तिथि" },
  riskScore: { en: "Risk score", hi: "जोखिम स्कोर" },

  tab_overview: { en: "Overview", hi: "अवलोकन" },
  tab_depth: { en: "Depth strip", hi: "गहराई पट्टी" },
  tab_timeline: { en: "Timeline", hi: "समयरेखा" },
  tab_casing: { en: "Casing & Mud", hi: "केसिंग और मड" },
  tab_events: { en: "Events & Lessons", hi: "घटनाएँ और सीख" },
  tab_docs: { en: "Documents", hi: "दस्तावेज़" },

  start: { en: "Start live replay", hi: "लाइव रीप्ले शुरू करें" },
  resume: { en: "Resume", hi: "जारी रखें" },
  pause: { en: "Pause", hi: "रोकें" },
  reset: { en: "Reset", hi: "रीसेट" },
  speed: { en: "Speed", hi: "गति" },
  replayNote: { en: "Replay of recorded eRTMAC stream (synthetic)", hi: "eRTMAC स्ट्रीम का रीप्ले (कृत्रिम)" },
  nextRisk: { en: "Next risk ahead", hi: "आगे का अगला जोखिम" },
  lookahead: { en: "Look-ahead: risks in the next 200 m", hi: "आगे 200 मी. में जोखिम" },
  clearAhead: { en: "No significant offset-well risk in the next 200 m.", hi: "अगले 200 मी. में कोई बड़ा जोखिम नहीं।" },
  recommendation: { en: "Recommendation", hi: "सिफ़ारिश" },
  provenFix: { en: "What worked before", hi: "पहले क्या काम आया" },
  evidence: { en: "Evidence", hi: "प्रमाण" },
  viewEvidence: { en: "Show offset wells on map", hi: "नक्शे पर ऑफ़सेट कुएँ दिखाएँ" },
  acknowledge: { en: "Acknowledge", hi: "स्वीकारें" },
  apply: { en: "Apply recommendation", hi: "सिफ़ारिश लागू करें" },
  applied: { en: "Applied", hi: "लागू" },
  acknowledged: { en: "Acknowledged", hi: "स्वीकृत" },
  predictive: { en: "Predicted from offset wells", hi: "ऑफ़सेट कुओं से अनुमानित" },
  realtime: { en: "Detected in live data", hi: "लाइव डेटा में पाया गया" },
  ahead: { en: "ahead", hi: "आगे" },
  of: { en: "of", hi: "में से" },
  offsetsHad: { en: "offset wells had this problem here", hi: "ऑफ़सेट कुओं में यहाँ यह समस्या थी" },
  probability: { en: "Probability", hi: "संभावना" },
  low: { en: "Low", hi: "कम" },
  medium: { en: "Medium", hi: "मध्यम" },
  high: { en: "High", hi: "उच्च" },
  synthetic: { en: "Demo data — synthetic, for illustration only", hi: "डेमो डेटा — केवल उदाहरण हेतु" },
} as const;

export type TKey = keyof typeof DICT;

export function translate(lang: "en" | "hi", key: TKey) {
  return DICT[key][lang];
}

export function useI18n() {
  const lang = useApp((s) => s.lang);
  return {
    lang,
    t: (key: TKey) => DICT[key][lang],
    /** pick between an English and Hindi string */
    tx: (en: string, hi?: string) => (lang === "hi" && hi ? hi : en),
  };
}
