"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

interface MonthPoint {
  key: string;
  label: string;
  spending: number;
  credits: number;
}

export function SpendingChart({ data }: { data: MonthPoint[] }) {
  return (
    <Card className="h-full">
      <div className="px-5 pt-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Monthly Activity</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Simulated spending vs credits</p>
      </div>
      <div className="h-56 px-3 pb-4 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v: number) => formatCompactCurrency(v)}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={62}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value)),
                name === "spending" ? "Simulated spending" : "Simulated credits",
              ]}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--color-slate-200)", fontSize: 13 }}
            />
            <Legend
              formatter={(value: string) =>
                value === "spending" ? "Spending (debits)" : "Credits"
              }
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="spending" name="spending" fill="#e27979" radius={[5, 5, 0, 0]} barSize={18} />
            <Bar dataKey="credits" name="credits" fill="#2f9e6f" radius={[5, 5, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}