"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Sparkles, Brain, Mic, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { revenueService } from "@/lib/services/revenue.service";
import { housekeepingService } from "@/lib/services/housekeeping.service";
import { aiService } from "@/lib/services/ai.service";
import { cn } from "@/lib/utils";

export default function AgentsPage() {
  const autopilot = useQuery({ queryKey: ["ag-autopilot"], queryFn: () => revenueService.getAutopilotStatus(), retry: false });
  const hk = useQuery({ queryKey: ["ag-hk"], queryFn: () => housekeepingService.getDashboard() as Promise<{ pending: number; total: number }>, retry: false });
  const ai = useQuery({ queryKey: ["ag-ai"], queryFn: () => aiService.status(), retry: false });

  const agents = [
    {
      icon: TrendingUp, name: "Revenue Agent", href: "/revenue",
      active: !!autopilot.data?.enabled,
      status: autopilot.data?.enabled ? "Autopilot ON — nightly rate optimization" : "Autopilot off",
      detail: autopilot.data?.lastRunAt ? `Last run ${new Date(autopilot.data.lastRunAt).toLocaleString()}` : "Applies AI rates within ±20% guardrails",
    },
    {
      icon: Sparkles, name: "Operations Agent", href: "/housekeeping",
      active: (hk.data?.pending ?? 0) === 0 && !!hk.data,
      status: hk.data ? `${hk.data.pending} tasks pending of ${hk.data.total}` : "Housekeeping optimizer",
      detail: "Load-balanced task assignment via 'Accept AI plan'",
    },
    {
      icon: Brain, name: "Executive Copilot", href: "/ai-copilot",
      active: !!ai.data?.live,
      status: ai.data?.live ? "Live — grounded on property data" : "Demo mode (no OpenAI key)",
      detail: "Ask anything; gated write-actions",
    },
    {
      icon: Mic, name: "Voice Assistant", href: "/ai-copilot",
      active: true,
      status: "Browser voice on Copilot",
      detail: "Speak questions, hear answers (Web Speech)",
    },
  ];

  return (
    <>
      <AppHeader title="AI Agents" breadcrumb="AI Command Center" />
      <div className="flex-1 space-y-4 p-6">
        <div className="glass-ai rounded-xl p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[color:var(--ai-hover)]" />
            <h2 className="font-display text-[16px] font-semibold">Autonomous operations</h2>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">Each agent reads live property data and acts within guardrails. Open one to configure or trigger it.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {agents.map((a) => (
            <Link key={a.name} href={a.href} className="group rounded-xl border border-border bg-surface p-4 transition hover:border-border-strong hover:shadow-card-hover">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-ai shadow-glow-ai"><a.icon className="h-5 w-5 text-white" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-foreground">{a.name}</span>
                    <span className={cn("flex items-center gap-1 text-[10px] font-semibold", a.active ? "text-success" : "text-tertiary")}>
                      {a.active ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />} {a.active ? "Active" : "Idle"}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-foreground">{a.status}</div>
                  <div className="text-[11px] text-tertiary">{a.detail}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-tertiary transition group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
