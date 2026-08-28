"use client";

import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Users, Crown, Repeat, UserPlus, TrendingDown } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { analyticsService } from "@/lib/services/analytics.service";
import { guestsService } from "@/lib/services/guests.service";
import { inr } from "@/lib/format";

const TIER_COLOR: Record<string, string> = {
  PLATINUM: "oklch(0.7 0.15 230)", GOLD: "oklch(0.8 0.16 85)", SILVER: "oklch(0.7 0.02 260)", BRONZE: "oklch(0.65 0.12 40)",
};

export default function GuestAnalyticsPage() {
  const stats = useQuery({ queryKey: ["ga-stats"], queryFn: () => analyticsService.getGuestStats() as Promise<{ total: number; vip: number; returning: number; newGuests: number; loyaltyBreakdown: { tier: string; count: number }[] }>, retry: false });
  const insights = useQuery({ queryKey: ["ga-insights"], queryFn: () => guestsService.insights(), retry: false });
  const s = stats.data; const sum = insights.data?.summary;
  const pie = (s?.loyaltyBreakdown ?? []).filter((b) => b.count > 0);

  return (
    <>
      <AppHeader title="Guest Analytics" breadcrumb="Analytics" />
      <div className="flex-1 space-y-5 p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<Users className="h-4 w-4" />} label="Total guests" value={String(s?.total ?? 0)} />
          <Stat icon={<Crown className="h-4 w-4" />} label="VIP" value={String(s?.vip ?? 0)} />
          <Stat icon={<Repeat className="h-4 w-4" />} label="Returning" value={String(s?.returning ?? 0)} />
          <Stat icon={<UserPlus className="h-4 w-4" />} label="New" value={String(s?.newGuests ?? 0)} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Loyalty pie */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-2 text-[13px] font-semibold text-foreground">Loyalty tiers</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="count" nameKey="tier" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {pie.map((p) => <Cell key={p.tier} fill={TIER_COLOR[p.tier] ?? "oklch(0.6 0.05 260)"} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(0.24 0.05 265)", border: "1px solid oklch(0.35 0.08 265)", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3">
              {pie.map((p) => (
                <span key={p.tier} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TIER_COLOR[p.tier] }} /> {p.tier.toLowerCase()} ({p.count})
                </span>
              ))}
            </div>
          </div>

          {/* Churn / LTV */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-foreground"><TrendingDown className="h-4 w-4 text-danger" /> Churn & lifetime value</h3>
            <div className="grid grid-cols-2 gap-3">
              <Mini label="High churn risk" value={String(sum?.high ?? 0)} tone="text-danger" />
              <Mini label="Medium risk" value={String(sum?.medium ?? 0)} tone="text-warning" />
              <Mini label="Current LTV" value={sum ? inr(sum.currentLtv) : "—"} tone="text-foreground" />
              <Mini label="Projected LTV" value={sum ? inr(sum.projectedLtv) : "—"} tone="text-success" />
            </div>
            <p className="mt-3 text-[11px] text-tertiary">Churn risk is recency-based; projected LTV extends current value by expected future stays. Full scoring on the <a href="/crm" className="text-primary hover:underline">CRM</a> page.</p>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-tertiary">{icon}<span className="text-[11px] uppercase tracking-wider">{label}</span></div>
      <div className="mt-1 font-display text-[20px] font-bold tabular leading-none text-foreground">{value}</div>
    </div>
  );
}
function Mini({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-tertiary">{label}</div>
      <div className={`mt-0.5 font-display text-[16px] font-bold tabular ${tone}`}>{value}</div>
    </div>
  );
}
