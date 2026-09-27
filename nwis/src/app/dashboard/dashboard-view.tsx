"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { ACTIVE_WELL, WELLS } from "@/data/wells";
import { FORMATIONS } from "@/data/formations";
import type { EventType } from "@/data/types";
import { EVENT_META, EVENT_TYPES } from "@/lib/event-meta";
import { getOffsets, upcomingRisks } from "@/lib/risk";
import { useApp } from "@/store/app";
import { useI18n } from "@/lib/i18n";
import { RiskMeter, StatusDot } from "@/components/common/risk";
import { cn } from "@/lib/utils";

const TIP = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--popover-foreground)" },
  cursor: { fill: "var(--muted)", opacity: 0.6 },
};
const AXIS = { fontSize: 11, fill: "var(--muted-foreground)" };
const STACK_TYPES: EventType[] = ["mud_loss", "kick", "tight_hole", "torque_spike", "stuck_pipe"];

function Card({ title, sub, children, className }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-4", className)}>
      <h2 className="font-semibold">{title}</h2>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function DashboardView() {
  const { lang, tx } = useI18n();
  const radiusKm = useApp((s) => s.radiusKm);
  const alerts = useApp((s) => s.alerts);
  const [scope, setScope] = useState<"field" | "radius">("field");
  const near = useMemo(() => new Set(getOffsets(ACTIVE_WELL, radiusKm).map((o) => o.well.id)), [radiusKm]);
  const wells = WELLS.filter((w) => w.status !== "planned" && w.id !== ACTIVE_WELL.id && (scope === "field" || near.has(w.id)));
  const events = wells.flatMap((w) => w.events);
  const npt = events.reduce((s, e) => s + e.npt_hours, 0);

  const byType = EVENT_TYPES.map((t) => ({
    type: t,
    name: lang === "hi" ? EVENT_META[t].labelHi : EVENT_META[t].label,
    npt: events.filter((e) => e.type === t).reduce((s, e) => s + e.npt_hours, 0),
    count: events.filter((e) => e.type === t).length,
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.npt - a.npt);

  const byFm = FORMATIONS.slice(2, 7).map((f) => {
    const row: Record<string, number | string> = { name: tx(f.name, f.nameHi).split(" ")[0] };
    for (const t of STACK_TYPES) row[t] = events.filter((e) => e.formation === f.name && e.type === t).length;
    row.other = events.filter((e) => e.formation === f.name && !STACK_TYPES.includes(e.type)).length;
    return row;
  });

  const bands = Array.from({ length: 9 }, (_, i) => 1000 + i * 350);
  const heatTypes: EventType[] = ["mud_loss", "stuck_pipe", "kick", "tight_hole", "torque_spike", "cement_issue", "bit_balling"];
  const heat = heatTypes.map((t) => bands.map((b) => events.filter((e) => e.type === t && e.depth_m >= b && e.depth_m < b + 350).length));
  const heatMax = Math.max(1, ...heat.flat());

  const years = [...new Set(wells.map((w) => w.spud_date!.slice(0, 4)))].sort();
  const trend = years.map((y) => {
    const ws = wells.filter((w) => w.spud_date!.startsWith(y));
    return { year: y, npt: Math.round(ws.reduce((s, w) => s + w.npt_total_h, 0) / ws.length), wells: ws.length };
  });

  // projected saving on the active well: expected NPT of upcoming risks × mitigation effectiveness (60%)
  const risks = upcomingRisks(ACTIVE_WELL, getOffsets(ACTIVE_WELL, radiusKm), 2650, 1300);
  const saving = Math.round(
    risks.reduce((s, r) => {
      const avg = r.evidence.reduce((a, e) => a + e.event.npt_hours, 0) / Math.max(1, r.evidence.length);
      return s + r.p * avg * 0.6;
    }, 0),
  );
  const worstFm = [...byFm].sort((a, b) => {
    const tot = (r: typeof a) => Object.entries(r).reduce((s, [k, v]) => (k === "name" ? s : s + (v as number)), 0);
    return tot(b) - tot(a);
  })[0];

  const kpis = [
    { l: lang === "hi" ? "विश्लेषित कुएँ" : "Wells analysed", v: String(wells.length), s: scope === "field" ? (lang === "hi" ? "पूरा क्षेत्र" : "whole field") : `≤ ${radiusKm} km` },
    { l: lang === "hi" ? "कुल NPT" : "Total NPT", v: `${npt} h`, s: `${(npt / 24).toFixed(0)} ${lang === "hi" ? "रिग दिन" : "rig-days"}` },
    { l: lang === "hi" ? "NWS-12 पर संभावित बचत" : "Projected NPT saving · NWS-12", v: `~${saving} h`, s: lang === "hi" ? "अग्रिम चेतावनी से" : "if alerts are acted on (60% effective)" },
    { l: lang === "hi" ? "सबसे जोखिम भरी संरचना" : "Highest-risk formation", v: String(worstFm.name), s: lang === "hi" ? "सबसे अधिक घटनाएँ" : "most recorded events" },
    { l: lang === "hi" ? "सक्रिय चेतावनियाँ" : "Active alerts", v: String(alerts.filter((a) => a.status !== "applied").length), s: lang === "hi" ? "लाइव ड्रिलिंग से" : "from Live Drilling" },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-6" data-tour="dashboard">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{lang === "hi" ? "जोखिम डैशबोर्ड" : "Risk Dashboard"}</h1>
          <p className="mt-1 text-muted-foreground">
            {lang === "hi" ? "योजना और प्रबंधन हेतु क्षेत्र-व्यापी दृश्य।" : "Field-wide view for planning, office engineers and management."}
          </p>
        </div>
        <div className="flex rounded-md border bg-muted p-0.5 text-sm" role="radiogroup" aria-label="Scope">
          {(["field", "radius"] as const).map((s) => (
            <button key={s} role="radio" aria-checked={scope === s} onClick={() => setScope(s)} className={cn("rounded px-3 py-1 font-medium", scope === s ? "bg-card shadow-xs" : "text-muted-foreground")}>
              {s === "field" ? (lang === "hi" ? "पूरा क्षेत्र" : "Whole field") : lang === "hi" ? `${radiusKm} किमी के भीतर` : `Within ${radiusKm} km of ${ACTIVE_WELL.id}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {kpis.map((k, i) => (
          <div key={k.l} className={cn("rounded-xl border bg-card p-4", i === 2 && "border-risk-low/40 bg-risk-low-bg")}>
            <p className="text-sm text-muted-foreground">{k.l}</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular">{k.v}</p>
            <p className="text-xs text-muted-foreground">{k.s}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title={lang === "hi" ? "कारण अनुसार NPT (घंटे)" : "NPT by cause (hours)"} sub={lang === "hi" ? "किस समस्या में सबसे अधिक समय गया" : "Where rig time was lost"}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={byType} layout="vertical" margin={{ left: 8, right: 40 }} barCategoryGap={6}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ ...AXIS, fill: "var(--foreground)" }} width={130} axisLine={false} tickLine={false} />
                <Tooltip {...TIP} formatter={(v, _n, p) => [`${v} h · ${(p.payload as { count: number }).count} events`, "NPT"]} />
                <Bar dataKey="npt" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  <LabelList dataKey="npt" position="right" style={{ fontSize: 11, fill: "var(--foreground)" }} formatter={(v) => `${v} h`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={lang === "hi" ? "संरचना अनुसार घटनाएँ" : "Events by formation"} sub={lang === "hi" ? "प्रकार अनुसार" : "Stacked by problem type"}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={byFm} margin={{ left: -10, right: 8 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ ...AXIS, fill: "var(--foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...TIP} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                {STACK_TYPES.map((t, i) => (
                  <Bar
                    key={t}
                    dataKey={t}
                    stackId="a"
                    name={lang === "hi" ? EVENT_META[t].labelHi : EVENT_META[t].label}
                    fill={EVENT_META[t].color}
                    stroke="var(--card)"
                    strokeWidth={2}
                    radius={i === STACK_TYPES.length - 1 ? [4, 4, 0, 0] : 0}
                  />
                ))}
                <Bar dataKey="other" stackId="a" name={lang === "hi" ? "अन्य" : "Other"} fill="#9aa3ad" stroke="var(--card)" strokeWidth={2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title={lang === "hi" ? "गहराई अनुसार समस्याएँ" : "Problems by depth band"} sub={lang === "hi" ? "प्रत्येक 350 मी. में घटनाओं की संख्या" : "Number of events per 350 m band — darker = more"}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-[2px] text-xs">
              <thead>
                <tr>
                  <th />
                  {bands.map((b) => (
                    <th key={b} className="pb-1 font-mono font-normal text-muted-foreground">
                      {b}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatTypes.map((t, r) => (
                  <tr key={t}>
                    <td className="pr-2 font-medium whitespace-nowrap">{lang === "hi" ? EVENT_META[t].labelHi : EVENT_META[t].label}</td>
                    {heat[r].map((v, c) => (
                      <td
                        key={c}
                        title={`${EVENT_META[t].label}: ${v} events, ${bands[c]}–${bands[c] + 350} m`}
                        className="h-8 rounded-[4px] text-center font-mono font-semibold tabular"
                        style={{
                          background: v ? `color-mix(in oklch, var(--chart-1) ${18 + (v / heatMax) * 82}%, var(--card))` : "var(--muted)",
                          color: v / heatMax > 0.5 ? "white" : "var(--foreground)",
                        }}
                      >
                        {v || ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted-foreground">{lang === "hi" ? "गहराई (मी.) — बैंड की शुरुआत" : "Depth (m), start of band"}</p>
          </div>
        </Card>

        <Card title={lang === "hi" ? "सीखने का वक्र: प्रति कुआँ NPT" : "Learning curve: NPT per well"} sub={lang === "hi" ? "स्पड वर्ष अनुसार औसत" : "Average NPT per well by spud year: is the field getting better?"}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ left: -10, right: 16, top: 10 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="year" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} unit=" h" />
                <Tooltip {...TIP} cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }} formatter={(v, _n, p) => [`${v} h (${(p.payload as { wells: number }).wells} well)`, "Avg NPT"]} />
                <Line dataKey="npt" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title={lang === "hi" ? "ध्यान देने योग्य कुएँ" : "Offset wells with the most difficult history"} sub={lang === "hi" ? "जोखिम स्कोर अनुसार" : "Ranked by risk score — review before planning nearby wells"}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b text-xs text-muted-foreground">
              <tr>
                <th className="py-2 text-left font-semibold">{lang === "hi" ? "कुआँ" : "Well"}</th>
                <th className="py-2 text-left font-semibold">{lang === "hi" ? "स्थिति" : "Status"}</th>
                <th className="py-2 text-left font-semibold">{lang === "hi" ? "सबसे बड़ी समस्या" : "Largest problem"}</th>
                <th className="py-2 text-right font-semibold">NPT</th>
                <th className="w-44 py-2 pl-4 text-left font-semibold">{lang === "hi" ? "जोखिम" : "Risk"}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...wells]
                .sort((a, b) => b.risk_score - a.risk_score)
                .slice(0, 6)
                .map((w) => {
                  const big = [...w.events].sort((a, b) => b.npt_hours - a.npt_hours)[0];
                  return (
                    <tr key={w.id}>
                      <td className="py-2">
                        <Link href={`/wells/${w.id}`} className="font-mono font-semibold text-primary hover:underline">
                          {w.id}
                        </Link>
                      </td>
                      <td className="py-2">
                        <StatusDot status={w.status} withLabel />
                      </td>
                      <td className="py-2">{big ? `${EVENT_META[big.type].label} @ ${big.depth_m} m (${big.formation})` : "—"}</td>
                      <td className="py-2 text-right font-mono tabular">{w.npt_total_h} h</td>
                      <td className="py-2 pl-4">
                        <div className="flex items-center gap-2">
                          <RiskMeter p={w.risk_score} />
                          <span className="w-7 font-mono text-xs tabular">{Math.round(w.risk_score * 100)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
