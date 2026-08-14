"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { REVENUE_METRICS } from "@/constants/sample-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const data = REVENUE_METRICS.map((d) => ({
  date: format(new Date(d.date), "dd MMM"),
  revenue: d.totalRevenue,
  occupancy: d.occupancy,
}));

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-elevated border border-border rounded-lg p-3 shadow-toast text-xs">
      <p className="text-text-secondary mb-2 font-medium">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary capitalize">{p.name}:</span>
          <span className="text-text-primary font-semibold">
            {p.name === "revenue" ? formatCurrency(p.value) : `${p.value}%`}
          </span>
        </div>
      ))}
    </div>
  );
};

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Revenue & Occupancy — Last 8 Days</CardTitle>
          <div className="flex items-center gap-4 text-xs text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success inline-block" /> Occupancy
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F6EF7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOccupancy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D50" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#4A5A82", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4A5A82", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#4F6EF7" strokeWidth={2}
              fill="url(#gradRevenue)" dot={false} activeDot={{ r: 4, fill: "#4F6EF7" }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
