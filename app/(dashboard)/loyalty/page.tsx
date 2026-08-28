"use client";

import { useQuery } from "@tanstack/react-query";
import { Star, Crown, Award, Medal, Gem } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { analyticsService } from "@/lib/services/analytics.service";
import { guestsService } from "@/lib/services/guests.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const TIERS: Record<string, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  PLATINUM: { icon: Gem, tone: "text-info bg-info-muted/50" },
  GOLD: { icon: Crown, tone: "text-warning bg-warning-muted/50" },
  SILVER: { icon: Award, tone: "text-muted-foreground bg-elevated" },
  BRONZE: { icon: Medal, tone: "text-[color:var(--ai-hover)] bg-[color:var(--ai-muted)]/40" },
};
const ORDER = ["PLATINUM", "GOLD", "SILVER", "BRONZE"];

interface G { id: string; firstName: string; lastName: string; loyaltyPoints: number; loyaltyTier: string; totalStays: number; lifetimeValue: number }

export default function LoyaltyPage() {
  const stats = useQuery({ queryKey: ["loyalty-stats"], queryFn: () => analyticsService.getGuestStats() as Promise<{ total: number; loyaltyBreakdown: { tier: string; count: number }[] }>, retry: false });
  const guests = useQuery({ queryKey: ["loyalty-guests"], queryFn: () => guestsService.findAll({ limit: 100 }) as Promise<{ data: G[] }>, retry: false });

  const members = (guests.data?.data ?? []).slice().sort((a, b) => (b.loyaltyPoints ?? 0) - (a.loyaltyPoints ?? 0));
  const totalPoints = members.reduce((s, g) => s + (g.loyaltyPoints ?? 0), 0);
  const breakdown = ORDER.map((t) => ({ tier: t, count: stats.data?.loyaltyBreakdown.find((b) => b.tier === t)?.count ?? 0 }));

  return (
    <>
      <AppHeader title="Loyalty" breadcrumb="Guests" />
      <div className="flex-1 space-y-5 p-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Members" value={String(stats.data?.total ?? 0)} icon={<Star className="h-4 w-4" />} />
          <Stat label="Points issued" value={totalPoints.toLocaleString()} icon={<Star className="h-4 w-4" />} />
          <Stat label="Platinum + Gold" value={String(breakdown[0].count + breakdown[1].count)} icon={<Crown className="h-4 w-4" />} />
          <Stat label="Top balance" value={(members[0]?.loyaltyPoints ?? 0).toLocaleString()} icon={<Gem className="h-4 w-4" />} />
        </div>

        {/* Tiers */}
        <div>
          <h3 className="mb-3 text-[13px] font-semibold text-foreground">Tier distribution</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {breakdown.map((b) => {
              const cfg = TIERS[b.tier];
              return (
                <div key={b.tier} className="rounded-xl border border-border bg-surface p-4">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", cfg.tone)}><cfg.icon className="h-4.5 w-4.5" /></div>
                  <div className="mt-3 font-display text-[24px] font-bold tabular leading-none text-foreground">{b.count}</div>
                  <div className="text-[12px] font-medium capitalize text-muted-foreground">{b.tier.toLowerCase()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top members */}
        <div>
          <h3 className="mb-3 text-[13px] font-semibold text-foreground">Top members by points</h3>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-[13px]">
              <thead className="bg-background/60 text-[10px] uppercase tracking-wider text-tertiary">
                <tr>
                  <th className="px-4 py-2.5 text-left">Member</th>
                  <th className="px-3 py-2.5 text-left">Tier</th>
                  <th className="px-3 py-2.5 text-right">Stays</th>
                  <th className="px-3 py-2.5 text-right">Lifetime value</th>
                  <th className="px-4 py-2.5 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {members.slice(0, 12).map((g) => {
                  const cfg = TIERS[g.loyaltyTier] ?? TIERS.BRONZE;
                  return (
                    <tr key={g.id} className="border-t border-border">
                      <td className="px-4 py-2.5 font-medium text-foreground">{g.firstName} {g.lastName}</td>
                      <td className="px-3 py-2.5"><span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize", cfg.tone)}><cfg.icon className="h-3 w-3" /> {g.loyaltyTier.toLowerCase()}</span></td>
                      <td className="px-3 py-2.5 text-right tabular text-muted-foreground">{g.totalStays}</td>
                      <td className="px-3 py-2.5 text-right tabular text-muted-foreground">{inr(g.lifetimeValue)}</td>
                      <td className="px-4 py-2.5 text-right font-display font-bold tabular text-foreground">{(g.loyaltyPoints ?? 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
                {members.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No members yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-tertiary">{icon}<span className="text-[11px] uppercase tracking-wider">{label}</span></div>
      <div className="mt-1 font-display text-[20px] font-bold tabular leading-none text-foreground">{value}</div>
    </div>
  );
}
