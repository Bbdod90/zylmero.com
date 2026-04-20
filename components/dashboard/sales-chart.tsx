"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "W1", pipeline: 14, won: 5 },
  { name: "W2", pipeline: 19, won: 7 },
  { name: "W3", pipeline: 17, won: 6 },
  { name: "W4", pipeline: 23, won: 8 },
  { name: "W5", pipeline: 27, won: 10 },
  { name: "W6", pipeline: 25, won: 9 },
];

export function SalesChart({
  title = "Pijplijn en gewonnen (trend)",
}: {
  title?: string;
}) {
  return (
    <div className="cf-dashboard-panel h-80 w-full rounded-2xl border border-border/60 p-5 sm:h-[22rem] sm:p-6 dark:border-white/[0.08]">
      {title ? (
        <p className="mb-4 text-sm font-medium tracking-tight text-muted-foreground">{title}</p>
      ) : null}
      <ResponsiveContainer width="100%" height={title ? "82%" : "88%"}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.38} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="pipeline"
            name="Open pijplijn"
            stroke="hsl(var(--primary))"
            fill="url(#g1)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="won"
            name="Gewonnen"
            stroke="hsl(var(--accent))"
            fill="transparent"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
