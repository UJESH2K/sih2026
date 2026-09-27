// Synthetic stratigraphy loosely modelled on the public Upper Assam Shelf
// succession (Alluvium → Dhekiajuli → Girujan → Tipam → Barail → Kopili →
// Sylhet → Basement). Depths are illustrative only — not real OIL data.

export interface Formation {
  id: string;
  name: string;
  nameHi: string;
  lithology: string;
  age: string;
  color: string; // band colour (works on light and dark)
  baseTop_m: number; // top depth at field reference point
  typicalRisks: string[];
}

export const FORMATIONS: Formation[] = [
  {
    id: "alluvium",
    name: "Alluvium",
    nameHi: "जलोढ़",
    lithology: "Unconsolidated sand, gravel, clay",
    age: "Recent",
    color: "#E9DFC2",
    baseTop_m: 0,
    typicalRisks: ["Shallow washouts", "Conductor settling"],
  },
  {
    id: "dhekiajuli",
    name: "Dhekiajuli",
    nameHi: "ढेकियाजुली",
    lithology: "Soft sandstone with clay",
    age: "Pliocene",
    color: "#DCC68E",
    baseTop_m: 320,
    typicalRisks: ["Seepage losses", "Hole enlargement"],
  },
  {
    id: "girujan",
    name: "Girujan Clay",
    nameHi: "गिरुजन क्ले",
    lithology: "Reactive mottled clay",
    age: "Miocene",
    color: "#A9BFA0",
    baseTop_m: 1080,
    typicalRisks: ["Bit balling", "Tight hole", "Swelling clays"],
  },
  {
    id: "tipam",
    name: "Tipam Sandstone",
    nameHi: "टिपम बलुआ पत्थर",
    lithology: "Coarse, permeable sandstone",
    age: "Miocene",
    color: "#F0CC6A",
    baseTop_m: 2080,
    typicalRisks: ["Mud losses", "Differential sticking"],
  },
  {
    id: "barail",
    name: "Barail",
    nameHi: "बरैल",
    lithology: "Sandstone, shale & coal seams",
    age: "Oligocene",
    color: "#9A9387",
    baseTop_m: 2890,
    typicalRisks: ["Losses at top", "Coal/shale sloughing", "Stuck pipe"],
  },
  {
    id: "kopili",
    name: "Kopili",
    nameHi: "कोपिली",
    lithology: "Dark shale, thin sands",
    age: "Late Eocene",
    color: "#7F9CC0",
    baseTop_m: 3530,
    typicalRisks: ["Overpressure / kicks", "Torque spikes"],
  },
  {
    id: "sylhet",
    name: "Sylhet Limestone",
    nameHi: "सिलहट चूना पत्थर",
    lithology: "Fractured limestone",
    age: "Eocene",
    color: "#A8CBE6",
    baseTop_m: 3860,
    typicalRisks: ["Fracture losses", "Hard drilling"],
  },
  {
    id: "basement",
    name: "Basement",
    nameHi: "आधार शैल",
    lithology: "Granite / gneiss",
    age: "Precambrian",
    color: "#C9907F",
    baseTop_m: 4200,
    typicalRisks: ["Very low ROP"],
  },
];

export const FORMATION_BY_ID = Object.fromEntries(FORMATIONS.map((f) => [f.id, f]));
