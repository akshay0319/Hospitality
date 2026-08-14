"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { IndianRupee, TrendingUp, BedDouble, Percent, Download } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui-kit";
import { analyticsService } from "@/lib/services/analytics.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TrendPoint { date: string; revenue: number; occupancy: number; adr: number; revpar: number; roomsSold: number; }
interface Channel { channel: string; bookings: number; revenue: number; }
interface GuestStats { total: number; vip: number; returning: number; newGuests: number; loyaltyBreakdown: { tier: string; count: number }[]; }

const CHANNEL_LABEL: Record<string, string> = {
  DIRECT: "Direct", BOOKING_COM: "Booking.com", AIRBNB: "Airbnb", EXPEDIA: "Expedia",
  AGODA: "Agoda", MAKEMYTRIP: "MakeMyTrip", GOIBIBO: "Goibibo", PHONE: "Phone", WALK_IN: "Walk-in", OTHER: "Other",
};
const TIER_COLOR: Record<string, string> = {
  PLATINUM: "oklch(0.65 0.22 295)", GOLD: "oklch(0.75 0.16 70)", SILVER: "oklch(0.72 0.13 210)", BRONZE: "oklch(0.55 0.08 60)",
};
const tip = { background: "oklch(0.24 0.05 265)", border: "1px solid oklch(0.35 0.08 265)", borderRadius: 8, fontSize: 11 };

function exportCsv(rows: TrendPoint[]) {
  const head = "date,revenue,occupancy,adr,revpar,roomsSold";
  const body = rows.map((r) => `${r.date},${r.revenue},${r.occupancy},${r.adr},${r.revpar},${r.roomsSold}`).join("\n");
  const url = URL.createObjectURL(new Blob([head + "\n" + body], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = "revenue-trend.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const { data: trend } = useQuery({ queryKey: ["an-trend"], queryFn: () => analyticsService.getRevenueTrend(30) as Promise<TrendPoint[]>, retry: false });
  const { data: channels } = useQuery({ queryKey: ["an-channels"], queryFn: () => analyticsService.getChannelBreakdown(30) as Promise<Channel[]>, retry: false });
  const { data: guests } = useQuery({ queryKey: ["an-guests"], queryFn: () => analyticsService.getGuestStats() as Promise<GuestStats>, retry: false });

  const t = trend ?? [];
  const totalRevenue = t.reduce((s, d) => s + d.revenue, 0);
  const avgOcc = t.length ? t.reduce((s, d) => s + d.occupancy, 0) / t.length : 0;
  const avgAdr = t.filter((d) => d.adr > 0);
  const adr = avgAdr.length ? avgAdr.reduce((s, d) => s + d.adr, 0) / avgAdr.length : 0;
  const revpar = t.length ? t.reduce((s, d) => s + d.revpar, 0) / t.length : 0;

  const channelData = (channels ?? []).map((c) => ({ name: CHANNEL_LABEL[c.channel] ?? c.channel, bookings: c.bookings, revenue: c.revenue }));

  return (
    <>
      <AppHeader title="Revenue Analytics" breadcrumb="Analytics" />
      <div className="flex-1 space-y-5 p-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi icon={IndianRupee} label="Revenue (30d)" value={inr(totalRevenue, { compact: true })} tone="text-success bg-success-muted/60" />
          <Kpi icon={Percent} label="Avg Occupancy" value={`${avgOcc.toFixed(1)}%`} tone="text-primary bg-primary-muted/60" />
          <Kpi icon={TrendingUp} label="ADR" value={inr(adr)} tone="text-info bg-info-muted/60" />
          <Kpi icon={BedDouble} label="RevPAR" value={inr(revpar)} tone="text-[color:var(--ai-hover)] bg-[color:var(--ai-muted)]/60" />
        </div>

        {/* Revenue + occupancy trend */}
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h3 className="text-[14px] font-semibold">Revenue &amp; Occupancy — Last 30 Days</h3>
              <p className="text-[11px] text-muted-foreground">Daily revenue captured vs occupancy rate</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => exportCsv(t)} disabled={t.length === 0}
                className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-background/40 px-2.5 text-[11px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground disabled:opacity-50">
                <Download className="h-3 w-3" /> CSV
              </button>
              <Badge tone="primary">Live</Badge>
            </div>
          </header>
          <div className="h-[280px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={t}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.18 265)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.62 0.18 265)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="occG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.70 0.16 165)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.70 0.16 165)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.28 0.06 265)" strokeDasharray="2 4" />
                <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 9 }} interval={4} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 9 }} axisLine={false} tickLine={false} width={40} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : `${v}`)} />
                <YAxis yAxisId="r" orientation="right" tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 9 }} axisLine={false} tickLine={false} width={30} unit="%" />
                <Tooltip contentStyle={tip} formatter={(v: number, n: string) => (n === "revenue" ? [inr(v), "Revenue"] : [`${v}%`, "Occupancy"])} />
                <Area yAxisId="l" type="monotone" dataKey="revenue" stroke="oklch(0.62 0.18 265)" strokeWidth={2} fill="url(#revG)" />
                <Area yAxisId="r" type="monotone" dataKey="occupancy" stroke="oklch(0.70 0.16 165)" strokeWidth={2} fill="url(#occG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Channel breakdown */}
          <section className="lg:col-span-2 overflow-hidden rounded-xl border border-border bg-surface">
            <header className="border-b border-border px-4 py-3">
              <h3 className="text-[14px] font-semibold">Channel Performance</h3>
              <p className="text-[11px] text-muted-foreground">Bookings &amp; revenue by source (30d)</p>
            </header>
            <div className="h-[240px] p-4">
              {channelData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">No bookings in range.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid stroke="oklch(0.28 0.06 265)" strokeDasharray="2 4" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "oklch(0.68 0.04 255)", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={tip} formatter={(v: number, n: string) => (n === "revenue" ? [inr(v), "Revenue"] : [v, "Bookings"])} />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]} fill="oklch(0.62 0.18 265)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          {/* Loyalty breakdown */}
          <section className="overflow-hidden rounded-xl border border-border bg-surface">
            <header className="border-b border-border px-4 py-3">
              <h3 className="text-[14px] font-semibold">Guest Loyalty</h3>
              <p className="text-[11px] text-muted-foreground">{guests?.total ?? 0} total · {guests?.vip ?? 0} VIP</p>
            </header>
            <div className="space-y-3 p-4">
              {(guests?.loyaltyBreakdown ?? []).map((l) => {
                const pct = guests?.total ? Math.round((l.count / guests.total) * 100) : 0;
                return (
                  <div key={l.tier}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="font-medium text-foreground">{l.tier}</span>
                      <span className="tabular text-muted-foreground">{l.count} · {pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-elevated">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: TIER_COLOR[l.tier] }} />
                    </div>
                  </div>
                );
              })}
              {(guests?.loyaltyBreakdown ?? []).length === 0 && (
                <div className="py-8 text-center text-[13px] text-muted-foreground">No loyalty data yet.</div>
              )}
            </div>
          </section>
        </div>

        {/* Occupancy bars */}
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <header className="border-b border-border px-4 py-3">
            <h3 className="text-[14px] font-semibold">Rooms Sold — Last 30 Days</h3>
          </header>
          <div className="h-[200px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={t}>
                <CartesianGrid stroke="oklch(0.28 0.06 265)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 9 }} interval={4} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 9 }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip contentStyle={tip} formatter={(v: number) => [v, "Rooms sold"]} />
                <Bar dataKey="roomsSold" radius={[3, 3, 0, 0]}>
                  {t.map((_, i) => <Cell key={i} fill="oklch(0.65 0.22 295)" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </>
  );
}

function Kpi({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-elevated p-4">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tone)}><Icon className="h-4 w-4" /></div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-tertiary">{label}</div>
      <div className="mt-1 font-display text-[24px] font-bold tabular leading-none text-foreground">{value}</div>
    </div>
  );
}
