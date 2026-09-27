// Usage: node scripts/shot.mjs <path> <outName> [--dark] [--w=1440] [--h=900] [--wait=3000] [--eval="js"] [--full]
import { chromium } from "playwright";
const [, , path = "/", name = "shot", ...rest] = process.argv;
const opt = Object.fromEntries(rest.map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.length ? v.join("=") : true]; }));
const base = process.env.BASE ?? "http://localhost:3100";
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: +(opt.w ?? 1440), height: +(opt.h ?? 900) }, colorScheme: opt.dark ? "dark" : "light", deviceScaleFactor: 1 });
await ctx.addInitScript((d) => { try { sessionStorage.setItem("nwis.intro", "1"); if (d) localStorage.setItem("theme", "dark"); } catch {} }, !!opt.dark);
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`.slice(0, 300)); });
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`.slice(0, 400)));
const clean = path.replace(/^.*\/Git\//, "").replace(/^\/+/, "").replace(/^home$/, "");
await page.goto(base + "/" + clean, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(+(opt.wait ?? 3000));
if (opt.eval) { await page.evaluate(opt.eval); await page.waitForTimeout(+(opt.after ?? 1500)); }
if (opt.click) { for (const sel of String(opt.click).split("||")) { await page.click(sel, { timeout: 5000 }).catch((e) => logs.push("click fail " + sel)); await page.waitForTimeout(+(opt.after ?? 1200)); } }
await page.screenshot({ path: `shots/${name}.png`, fullPage: !!opt.full });
console.log(logs.slice(0, 15).join("\n") || "no console errors");
await browser.close();
