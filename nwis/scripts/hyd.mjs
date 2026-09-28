import { chromium } from "playwright";
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
p.on("console", (m) => { if (m.type()==="error") console.log(m.text().slice(0, 2500)); });
await p.goto("http://localhost:3100/" + (process.argv[2]||""), { waitUntil: "networkidle" }); await p.waitForTimeout(2000); await b.close();
