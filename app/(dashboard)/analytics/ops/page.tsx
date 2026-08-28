"use client";

import { useQuery } from "@tanstack/react-query";
import { BedDouble, Sparkles, Wrench, AlertTriangle, DoorOpen, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { dashboardService } from "@/lib/services/dashboard.service";
import { housekeepingService } from "@/lib/services/housekeeping.service";
import { maintenanceService } from "@/lib/services/maintenance.service";
import { cn } from "@/lib/utils";

type Kpis = { occupancy?: { value: number }; availableRooms?: { value: number }; arrivalsToday?: { value: number }; departuresToday?: { value: number } };
type Hk = { total: number; pending: number; inProgress: number; completed: number };
type Mt = { open: number; inProgress: number; onHold: number; resolved: number; critical: number; byCategory: { category: string; count: number }[] };

export default function OpsReportPage() {
  const kpi = useQuery({ queryKey: ["ops-kpi"], queryFn: () => dashboardService.getKPIs() as Promise<Kpis>, retry: false });
  const hk = useQuery({ queryKey: ["ops-hk"], queryFn: () => housekeepingService.getDashboard() as Promise<Hk>, retry: false });
  const mt = useQuery({ queryKey: ["ops-mt"], queryFn: () => maintenanceService.getDashboard() as Promise<Mt>, retry: false });

  return (
    <>
      <AppHeader title="Operations Report" breadcrumb="Analytics" />
      <div className="flex-1 space-y-5 p-6">
        {/* Occupancy row */}
        <div>
          <h3 className="mb-3 text-[13px] font-semibold text-foreground">Occupancy</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={<BedDouble className="h-4 w-4" />} label="Occupancy" value={`${kpi.data?.occupancy?.value ?? 0}%`} />
            <Stat icon={<DoorOpen className="h-4 w-4" />} label="Rooms available" value={String(kpi.data?.availableRooms?.value ?? 0)} />
            <Stat icon={<DoorOpen className="h-4 w-4" />} label="Arrivals today" value={String(kpi.data?.arrivalsToday?.value ?? 0)} />
            <Stat icon={<DoorOpen className="h-4 w-4" />} label="Departures today" value={String(kpi.data?.departuresToday?.value ?? 0)} />
          </div>
        </div>

        {/* Housekeeping + Maintenance */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Housekeeping" icon={<Sparkles className="h-4 w-4 text-[color:var(--ai-hover)]" />}>
            <Row label="Total tasks" value={hk.data?.total ?? 0} />
            <Row label="Pending" value={hk.data?.pending ?? 0} tone="text-warning" />
            <Row label="In progress" value={hk.data?.inProgress ?? 0} tone="text-info" />
            <Row label="Completed" value={hk.data?.completed ?? 0} tone="text-success" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
          </Panel>

          <Panel title="Maintenance" icon={<Wrench className="h-4 w-4 text-primary" />}>
            <Row label="Open" value={mt.data?.open ?? 0} tone="text-warning" />
            <Row label="In progress" value={mt.data?.inProgress ?? 0} tone="text-info" />
            <Row label="Critical (open)" value={mt.data?.critical ?? 0} tone="text-danger" icon={<AlertTriangle className="h-3.5 w-3.5" />} />
            <Row label="Resolved" value={mt.data?.resolved ?? 0} tone="text-success" icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
          </Panel>
        </div>

        {/* Maintenance by category */}
        {(mt.data?.byCategory?.length ?? 0) > 0 && (
          <div>
            <h3 className="mb-3 text-[13px] font-semibold text-foreground">Open maintenance by category</h3>
            <div className="rounded-xl border border-border bg-surface p-4">
              {mt.data!.byCategory.map((c) => {
                const max = Math.max(...mt.data!.byCategory.map((x) => x.count));
                return (
                  <div key={c.category} className="mb-2 last:mb-0">
                    <div className="mb-1 flex items-center justify-between text-[12px]"><span className="text-muted-foreground">{c.category}</span><span className="tabular text-foreground">{c.count}</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-elevated"><div className="h-full rounded-full bg-primary" style={{ width: `${(c.count / max) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-foreground">{icon} {title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ label, value, tone, icon }: { label: string; value: number; tone?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-[13px]">
      <span className="flex items-center gap-1.5 text-muted-foreground">{icon} {label}</span>
      <span className={cn("font-display font-bold tabular", tone ?? "text-foreground")}>{value}</span>
    </div>
  );
}
