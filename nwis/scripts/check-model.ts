import { ACTIVE_WELL, WELLS, topOf } from "../src/data/wells";
import { getOffsets, upcomingRisks } from "../src/lib/risk";
const off = getOffsets(ACTIVE_WELL, 5);
console.log("tops", ACTIVE_WELL.formation_tops.map(t=>t.id+":"+t.top_m).join(" "));
console.log("offsets", off.map(o=>`${o.well.id} ${o.distanceKm.toFixed(2)}km ${o.compass}`).join(" | "));
for (const d of [2650, 2750, 2850, 3000, 3100, 3400, 3500]) {
  console.log(d, upcomingRisks(ACTIVE_WELL, off, d, 160).slice(0,4).map(r=>`${r.type} ${(r.p*100).toFixed(0)}% @${r.peakDepth} ${r.wellsWith.join(",")}`).join(" ; "));
}
console.log("events", WELLS.reduce((s,w)=>s+w.events.length,0));
