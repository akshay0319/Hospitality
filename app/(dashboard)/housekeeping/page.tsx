"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Clock, AlertTriangle, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui-kit";
import { housekeepingService } from "@/lib/services/housekeeping.service";
import { initials } from "@/lib/mappers";

interface Task {
  id: string; roomId: string; taskType: string; priority: string; status: string;
  estimatedMinutes: number; nextCheckInTime?: string | null;
  room?: { number: string; floor: number; roomType?: { name: string; code: string } | null } | null;
  assignedTo?: { id: string; firstName: string; lastName: string } | null;
}
interface Staff { id: string; firstName: string; lastName: string; role: string; _count?: { hkTasks: number } }
interface Dashboard { total: number; pending: number; inProgress: number; completed: number; staff: Staff[] }

const COLUMNS: { status: string; label: string; color: string }[] = [
  { status: "PENDING", label: "To Do", color: "var(--danger)" },
  { status: "IN_PROGRESS", label: "In Progress", color: "var(--warning)" },
  { status: "INSPECTING", label: "Inspecting", color: "var(--info)" },
  { status: "COMPLETED", label: "Clean & Ready", color: "var(--success)" },
];
const NEXT: Record<string, string> = { PENDING: "IN_PROGRESS", IN_PROGRESS: "INSPECTING", INSPECTING: "COMPLETED" };
const NEXT_LABEL: Record<string, string> = { PENDING: "Start", IN_PROGRESS: "To inspect", INSPECTING: "Mark clean" };
const PRIO_TONE: Record<string, "danger" | "warning" | "info" | "muted"> = { URGENT: "danger", HIGH: "warning", NORMAL: "info", LOW: "muted" };

function fmtTime(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function HousekeepingPage() {
  const qc = useQueryClient();
  const [insight, setInsight] = useState<string | null>(null);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["hk-tasks"],
    queryFn: () => housekeepingService.findAll().then((r) => (r.data as Task[]) ?? []),
    retry: false,
  });
  const { data: dash } = useQuery({
    queryKey: ["hk-dash"],
    queryFn: () => housekeepingService.getDashboard() as Promise<Dashboard>,
    retry: false,
  });

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["hk-tasks"] }); qc.invalidateQueries({ queryKey: ["hk-dash"] }); };

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => housekeepingService.updateStatus(id, status),
    onSuccess: () => { toast.success("Task updated"); invalidate(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Update failed"),
  });

  const optimize = useMutation({
    mutationFn: () => housekeepingService.runAIOptimizer() as Promise<{ insight: string }>,
    onSuccess: (d) => { setInsight(d.insight); toast.success("AI optimizer ran"); },
    onError: () => toast.error("Optimizer failed"),
  });

  const acceptPlan = useMutation({
    mutationFn: () => housekeepingService.acceptAIPlan(),
    onSuccess: (d) => {
      setInsight(d.assigned ? `AI plan applied — ${d.assigned} task(s) assigned across ${d.perStaff.length} staff. ${d.perStaff.map((s) => `${s.name}: ${s.minutes}m`).join(" · ")}` : "No unassigned tasks to allocate.");
      toast.success(d.assigned ? `${d.assigned} tasks assigned` : "Nothing to assign");
      invalidate();
    },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Could not apply plan"),
  });

  const all = tasks ?? [];
  const byStatus = (s: string) => all.filter((t) => t.status === s);

  return (
    <>
      <AppHeader title="Housekeeping" breadcrumb="Operations" />
      <div className="flex-1 space-y-4 p-6">
        {/* AI Optimization Panel */}
        <section className="glass-ai relative overflow-hidden rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-ai shadow-glow-ai">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[16px] font-semibold">AI Housekeeping Optimizer</h3>
                <Badge tone="ai">✦ AI</Badge>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {insight ?? `${dash?.pending ?? 0} pending tasks. Let AI prioritise by check-in deadlines and staff workload.`}
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => optimize.mutate()} disabled={optimize.isPending}
                  className="flex items-center gap-1.5 rounded-md gradient-ai px-3 py-1.5 text-[12px] font-semibold text-white shadow-glow-ai hover:brightness-110 disabled:opacity-60">
                  {optimize.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Run optimizer
                </button>
                <button onClick={() => acceptPlan.mutate()} disabled={acceptPlan.isPending}
                  className="flex items-center gap-1.5 rounded-md border border-[color:var(--ai)]/40 bg-[color:var(--ai-muted)]/20 px-3 py-1.5 text-[12px] font-semibold text-[color:var(--ai-hover)] hover:bg-[color:var(--ai-muted)]/40 disabled:opacity-60">
                  {acceptPlan.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Accept AI plan
                </button>
              </div>
            </div>
            {/* mini stats */}
            <div className="hidden gap-4 sm:flex">
              {[
                { l: "Total", v: dash?.total ?? 0 },
                { l: "Pending", v: dash?.pending ?? 0 },
                { l: "Done", v: dash?.completed ?? 0 },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <div className="font-display text-[22px] font-bold tabular text-foreground">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-tertiary">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
          {/* Kanban */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {COLUMNS.map((c) => {
                const items = byStatus(c.status);
                return (
                  <div key={c.status} className="flex flex-col rounded-xl border border-border bg-surface">
                    <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                        <span className="text-[12px] font-semibold">{c.label}</span>
                      </div>
                      <span className="rounded bg-elevated px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">{items.length}</span>
                    </header>
                    <div className="flex min-h-[80px] flex-col gap-2 p-2">
                      {items.length === 0 && <div className="py-6 text-center text-[11px] text-tertiary">Empty</div>}
                      {items.map((t) => (
                        <article key={t.id} className="rounded-lg border border-border bg-background/60 p-3 transition hover:border-border-strong hover:shadow-card-hover">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-display text-[18px] font-bold leading-none">{t.room?.number ?? "—"}</div>
                              <div className="mt-1 text-[11px] text-muted-foreground">{t.room?.roomType?.name ?? t.taskType.replace(/_/g, " ")}</div>
                            </div>
                            {(t.priority === "URGENT" || t.priority === "HIGH") && <Badge tone={PRIO_TONE[t.priority]}>{t.priority}</Badge>}
                          </div>

                          {t.assignedTo && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-muted text-[9px] font-bold text-primary">
                                {initials(t.assignedTo.firstName, t.assignedTo.lastName)}
                              </div>
                              <span className="text-[11px] text-muted-foreground">{t.assignedTo.firstName}</span>
                              <span className="ml-auto flex items-center gap-1 text-[11px] text-tertiary"><Clock className="h-3 w-3" /> {t.estimatedMinutes}m</span>
                            </div>
                          )}
                          {t.nextCheckInTime && (
                            <div className="mt-2 flex items-center gap-1 text-[11px] text-danger">
                              <AlertTriangle className="h-3 w-3" /> Check-in {fmtTime(t.nextCheckInTime)}
                            </div>
                          )}

                          {NEXT[t.status] && (
                            <button onClick={() => advance.mutate({ id: t.id, status: NEXT[t.status] })} disabled={advance.isPending}
                              className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-border bg-elevated py-1.5 text-[11px] font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground disabled:opacity-50">
                              {NEXT_LABEL[t.status]} <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                          {t.status === "COMPLETED" && (
                            <div className="mt-3 flex items-center justify-center gap-1 text-[11px] font-medium text-success">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Staff sidebar */}
          <aside className="rounded-xl border border-border bg-surface">
            <header className="border-b border-border px-4 py-3">
              <h3 className="text-[13px] font-semibold">Staff On Duty</h3>
              <p className="text-[11px] text-muted-foreground">{dash?.staff?.length ?? 0} on the floor</p>
            </header>
            <ul className="divide-y divide-border">
              {(dash?.staff ?? []).map((s) => {
                const assigned = all.filter((t) => t.assignedTo?.id === s.id);
                const done = assigned.filter((t) => t.status === "COMPLETED").length;
                const pct = assigned.length ? (done / assigned.length) * 100 : 0;
                return (
                  <li key={s.id} className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-muted text-[11px] font-bold text-primary">
                        {initials(s.firstName, s.lastName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium">{s.firstName} {s.lastName}</div>
                        <div className="text-[11px] capitalize text-muted-foreground">{s.role.replace(/_/g, " ").toLowerCase()}</div>
                      </div>
                      <div className="text-right tabular text-[11px] text-muted-foreground">{done}/{assigned.length}</div>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-elevated">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
              {(dash?.staff ?? []).length === 0 && <li className="px-4 py-6 text-center text-[12px] text-muted-foreground">No housekeeping staff.</li>}
            </ul>
          </aside>
        </div>
      </div>
    </>
  );
}
