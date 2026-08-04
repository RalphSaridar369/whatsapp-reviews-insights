import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function ScoreHistogram({ data }: { data: { score: number; count: number }[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#2E3440" vertical={false} />
          <XAxis
            dataKey="score"
            tickFormatter={(v) => `${v}★`}
            stroke="#8B92A0"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#2E3440" }}
          />
          <YAxis stroke="#8B92A0" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "var(--card-background)" }}
            contentStyle={{
              background: "var(--card-background)",
              border: "1px solid #2E3440",
              borderRadius: 4,
              fontSize: 12,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
            labelFormatter={(v) => `${v} star`}
          />
          <Bar dataKey="count" fill="var(--avg)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
