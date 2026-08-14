"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Crown, Star, Award, Repeat, IndianRupee, Users, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { guestsService } from "@/lib/services/guests.service";
import { cn } from "@/lib/utils";

const ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  vip: { icon: Crown, tone: "text-[color:var(--ai-hover)] bg-[color:var(--ai-muted)]/50" },
  platinum: { icon: Star, tone: "text-info bg-info-muted/50" },
  gold: { icon: Award, tone: "text-warning bg-warning-muted/50" },
  returning: { icon: Repeat, tone: "text-success bg-success-muted/50" },
  highvalue: { icon: IndianRupee, tone: "text-primary bg-primary-muted/50" },
};

export default function CRMPage() {
  const { data } = useQuery({ queryKey: ["crm-segments"], queryFn: () => guestsService.segments(), retry: false });
  const segments = data?.segments ?? [];

  return (
    <>
      <AppHeader title="CRM" breadcrumb="Guests" />
      <div className="flex-1 space-y-5 p-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted/60 text-primary"><Users className="h-5 w-5" /></div>
          <div>
            <div className="font-display text-[22px] font-bold tabular leading-none text-foreground">{data?.total ?? 0}</div>
            <div className="text-[11px] uppercase tracking-wider text-tertiary">Total Guests</div>
          </div>
          <Link href="/guests" className="ml-auto flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary-hover">
            All guests <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div>
          <h3 className="mb-3 text-[13px] font-semibold text-foreground">Guest Segments</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {segments.map((s) => {
              const cfg = ICONS[s.key] ?? { icon: Users, tone: "text-muted-foreground bg-elevated" };
              return (
                <Link key={s.key} href="/guests"
                  className="group rounded-xl border border-border bg-gradient-to-br from-surface to-elevated p-4 transition hover:border-border-strong hover:shadow-card-hover">
                  <div className="flex items-start justify-between">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", cfg.tone)}><cfg.icon className="h-4.5 w-4.5" /></div>
                    <span className="font-display text-[26px] font-bold tabular leading-none text-foreground">{s.count}</span>
                  </div>
                  <div className="mt-3 text-[13px] font-semibold text-foreground">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.description}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
