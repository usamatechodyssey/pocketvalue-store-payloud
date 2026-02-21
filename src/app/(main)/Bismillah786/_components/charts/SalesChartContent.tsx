// /src/app/Bismillah786/_components/charts/SalesChartContent.tsx (The Actual Chart Code)

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"; // ✅ Recharts is now only loaded here (lazy)

interface SalesChartProps {
  data: { name: string; sales: number }[];
}

// Custom Tooltip (Updated)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-secondary text-on-primary p-3 rounded-lg shadow-lg">
        <p className="label text-sm font-bold">{`${label}`}</p>
        <p className="intro text-brand-primary font-semibold">{`Sales: Rs. ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

// Component ka naam change kiya (content)
export default function SalesChartContent({ data }: SalesChartProps) { 
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface-base p-6 rounded-lg shadow-md border border-surface-border h-96 flex items-center justify-center">
        <p className="text-text-subtle">
          No sales data available for the last 7 days.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-base p-6 rounded-lg shadow-md border border-surface-border h-96">
      <h3 className="text-xl font-bold mb-6 text-text-primary">
        Sales (Last 7 Days)
      </h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: -15, bottom: 5 }}
          barSize={20}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-surface-border)"
          />
          <XAxis
            dataKey="name"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            stroke="var(--color-text-subtle)"
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            stroke="var(--color-text-subtle)"
            tickFormatter={(value: number) => `${value / 1000}k`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgb(var(--color-brand-primary) / 0.1)" }}
          />
          <Bar
            dataKey="sales"
            fill="var(--color-brand-primary)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}