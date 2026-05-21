"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/formatting/money";

const colors = ["#6f8c78", "#c7785b", "#557c96", "#d3aa5f", "#8b6f9f", "#6f7f89"];

export function SimplePieChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <p className="text-sm text-ink/55">No chart data yet.</p>;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={86} innerRadius={48}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBarChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <p className="text-sm text-ink/55">No chart data yet.</p>;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `₹${Math.round(Number(value) / 1000)}k`} />
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
          <Bar dataKey="value" fill="#6f8c78" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
