export type WellStatus = "drilling" | "producing" | "suspended" | "abandoned" | "planned";

export type EventType =
  | "mud_loss"
  | "kick"
  | "stuck_pipe"
  | "tight_hole"
  | "torque_spike"
  | "cement_issue"
  | "fishing"
  | "bit_balling"
  | "wellbore_instability";

export type Severity = 1 | 2 | 3; // 1 low · 2 medium · 3 high

export interface FormationTop {
  id: string;
  top_m: number;
}

export interface CasingString {
  name: string;
  size_in: number;
  size_label: string;
  shoe_m: number;
  toc_m: number; // top of cement
  cement_result: "good" | "partial" | "poor";
  set_date: string;
}

export interface MudInterval {
  from_m: number;
  to_m: number;
  mw_sg: number;
  type: "WBM" | "KCl-Polymer" | "SOBM";
}

export interface DrillingEvent {
  id: string;
  wellId: string;
  type: EventType;
  depth_m: number;
  formation: string;
  date: string;
  day: number;
  severity: Severity;
  npt_hours: number;
  title: string;
  details: string;
  action: string;
  lesson: string;
  source: { doc: string; page: number; docId: string };
  confidence: number; // extraction confidence 0..1
}

export interface WellDocument {
  id: string;
  wellId: string;
  kind: "WCR" | "DDR" | "Mud Log" | "Cement Report" | "Survey" | "Casing Tally";
  title: string;
  pages: number;
  date: string;
  status: "extracted" | "processing" | "queued";
  fields: number;
  scanned: boolean;
}

export interface Well {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: WellStatus;
  purpose: "Development" | "Exploratory" | "Appraisal";
  profile: "Vertical" | "Deviated (J)" | "S-shape";
  azimuth_deg: number;
  departure_m: number;
  spud_date: string | null;
  completion_date: string | null;
  total_depth_m: number; // actual or planned
  planned_depth_m: number;
  rig: string;
  target: string;
  result: string;
  formation_tops: FormationTop[];
  casing: CasingString[];
  mud_program: MudInterval[];
  events: DrillingEvent[];
  documents: WellDocument[];
  risk_score: number; // 0..1
  npt_total_h: number;
  days_on_well: number;
}
