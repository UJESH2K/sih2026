import { WELL_BY_ID } from "../src/data/wells";
for (const id of process.argv.slice(2)) console.log(JSON.stringify(WELL_BY_ID[id].events.map(e=>({id:e.id,t:e.type,d:e.depth_m,det:e.details,act:e.action,npt:e.npt_hours,day:e.day,date:e.date})),null,1));
