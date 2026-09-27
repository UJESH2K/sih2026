"use client";

import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import type { Well } from "@/data/types";
import { benchmarkCurve, timeDepth } from "@/lib/time-depth";
import { EVENT_META } from "@/lib/event-meta";
import { useI18n } from "@/lib/i18n";
import type { EventType } from "@/data/types";

export function TimeDepthChart({ well, height = 380 }: { well: Well; height?: number }) {
  const { lang } = useI18n();
  const actual = timeDepth(well);
  const bench = benchmarkCurve(well);
  const events = actual.filter((p) => p.kind === "event");
  const npt = well.npt_total_h;

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">{lang === "hi" ? "कुल दिन" : "Days on well"}</p>
          <p className="font-mono font-semibold tabular">{actual[actual.length - 1].day.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{lang === "hi" ? "बेंचमार्क" : "Benchmark (no NPT)"}</p>
          <p className="font-mono font-semibold tabular">{bench[bench.length - 1].day.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">NPT</p>
          <p className="font-mono font-semibold text-risk-high tabular">{npt} h</p>
        </div>
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 8, right: 16, bottom: 20, left: 8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="day"
              domain={[0, "dataMax"]}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              label={{ value: lang === "hi" ? "दिन" : "Days", position: "insideBottom", offset: -10, fontSize: 11, fill: "var(--muted-foreground)" }}
              allowDuplicatedCategory={false}
            />
            <YAxis
              type="number"
              dataKey="depth"
              reversed
              domain={[0, "dataMax"]}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              width={48}
              label={{ value: lang === "hi" ? "गहराई (मी.)" : "Depth (m)", angle: -90, position: "insideLeft", fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => [n === "depth" ? `${v} m` : v, n]}
              labelFormatter={(l) => `Day ${Number(l).toFixed(1)}`}
            />
            <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
            <Line data={bench} dataKey="depth" name={lang === "hi" ? "बेंचमार्क" : "Benchmark"} stroke="var(--muted-foreground)" strokeDasharray="5 4" dot={false} strokeWidth={1.5} isAnimationActive={false} />
            <Line data={actual} dataKey="depth" name={lang === "hi" ? "वास्तविक" : "Actual"} stroke="var(--chart-1)" dot={false} strokeWidth={2.5} isAnimationActive={false} />
            <Scatter
              data={events}
              dataKey="depth"
              name={lang === "hi" ? "NPT घटनाएँ" : "NPT events"}
              fill="var(--risk-high)"
              shape={(p: { cx?: number; cy?: number; payload?: { eventType?: string } }) => (
                <circle cx={p.cx} cy={p.cy} r={6} fill={EVENT_META[(p.payload?.eventType ?? "kick") as EventType].color} stroke="white" strokeWidth={1.5} />
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
