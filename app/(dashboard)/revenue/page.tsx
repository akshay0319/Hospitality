"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Sparkles, Check, Loader2, Lock } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui-kit";
import { demandForecast } from "@/lib/sample-data";
import { revenueService, type RateGrid, type RateItem } from "@/lib/services/revenue.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ApiRateRec {
  date: string; roomTypeId: string; roomTypeName: string;
  currentRate: number; recommendedRate: number; variancePercent: number; isLocked: boolean;
}

const WINDOW = 14;
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }

export default function RevenuePage() {
  const qc = useQueryClient();
  const start = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const days = Array.from({ length: WINDOW }, (_, i) => addDays(start, i));
  const startStr = isoDate(days[0]);
  const endStr = isoDate(days[WINDOW - 1]);

  const { data: grid, isLoading } = useQuery({
    queryKey: ["rate-grid", startStr],
    queryFn: () => revenueService.getRateGrid(startStr, endStr) as Promise<RateGrid>,
    retry: false,
  });
  const { data: liveRecs } = useQuery({
    queryKey: ["revenue-ai-recs"],
    queryFn: () => revenueService.getAIRecommendations() as Promise<ApiRateRec[]>,
    retry: false,
  });
  const { data: liveForecast } = useQuery({
    queryKey: ["revenue-forecast"],
    queryFn: () => revenueService.getForecast(14),
    retry: false,
  });
  const forecast = liveForecast && liveForecast.length ? liveForecast : demandForecast.slice(0, 14);

  const planId = grid?.ratePlans?.find((p) => p.type === "BAR")?.id ?? grid?.ratePlans?.[0]?.id ?? "";
  const roomTypes = grid?.roomTypes ?? [];
  const rateMap: Record<string, RateItem> = {};
  for (const it of grid?.rateItems ?? []) {
    if (it.ratePlanId === planId) rateMap[`${it.roomTypeId}_${it.date.slice(0, 10)}`] = it;
  }

  const invalidate = () => { qc.invalidateQueries({ queryKey: ["rate-grid"] }); qc.invalidateQueries({ queryKey: ["revenue-ai-recs"] }); };

  const setRate = useMutation({
    mutationFn: ({ roomTypeId, date, rate }: { roomTypeId: string; date: string; rate: number }) =>
      revenueService.setRate(planId, roomTypeId, date, rate),
    onSuccess: () => { toast.success("Rate updated"); invalidate(); },
    onError: () => toast.error("Failed to update rate"),
  });

  const accept = useMutation({
    mutationFn: (r: ApiRateRec) => revenueService.acceptRecommendation(planId, r.roomTypeId, r.date, r.recommendedRate),
    onSuccess: () => { toast.success("AI rate applied"); invalidate(); },
    onError: () => toast.error("Failed to apply"),
  });

  const acceptAll = useMutation({
    mutationFn: async (recs: ApiRateRec[]) => {
      for (const r of recs) await revenueService.acceptRecommendation(planId, r.roomTypeId, r.date, r.recommendedRate);
    },
    onSuccess: () => { toast.success("All AI rates applied"); invalidate(); },
    onError: () => toast.error("Some rates failed to apply"),
  });

  const autopilot = useMutation({
    mutationFn: () => revenueService.runAutopilot(),
    onSuccess: (r) => { toast.success(`Autopilot applied ${r.applied} rates (skipped ${r.skippedLocked} locked, ${r.skippedSmall} minor)`); invalidate(); },
    onError: () => toast.error("Autopilot failed"),
  });

  const recs = (liveRecs ?? []).slice(0, 24);

  return (
    <>
      <AppHeader title="Rate Management" breadcrumb="Revenue" />
      <div className="grid flex-1 grid-cols-1 gap-4 p-6 xl:grid-cols-[1fr_400px]">
        {/* Rate Grid */}
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h3 className="text-[14px] font-semibold">Rate Grid · Next 14 Days</h3>
              <p className="text-[11px] text-muted-foreground">Live rates from your BAR plan · click any cell to edit</p>
            </div>
            <Badge tone="ai">✦ AI Optimizing</Badge>
          </header>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : (
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-background/40 text-left text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                    <th className="sticky left-0 z-10 bg-background/95 px-3 py-2">Room Type</th>
                    {days.map((d, i) => {
                      const weekend = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <th key={i} className={cn("px-2 py-2 text-center", weekend && "text-[color:var(--ai-hover)]")}>
                          {d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2)} {d.getDate()}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {roomTypes.map((rt) => {
                    const base = Number(rt.baseRate);
                    return (
                      <tr key={rt.id} className="border-b border-border">
                        <td className="sticky left-0 z-10 bg-surface px-3 py-2 text-[12px] font-medium">
                          {rt.name}
                          <div className="text-[10px] text-tertiary">base {inr(base)}</div>
                        </td>
                        {days.map((d) => {
                          const dateStr = isoDate(d);
                          const item = rateMap[`${rt.id}_${dateStr}`];
                          const rate = item ? Number(item.ratePerNight) : base;
                          return (
                            <td key={dateStr} className="p-1">
                              <RateCell
                                rate={rate}
                                base={base}
                                locked={item?.isLocked ?? false}
                                pending={setRate.isPending}
                                onSave={(v) => { if (v !== rate) setRate.mutate({ roomTypeId: rt.id, date: dateStr, rate: v }); }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {roomTypes.length === 0 && (
                    <tr><td colSpan={WINDOW + 1} className="px-4 py-10 text-center text-[13px] text-muted-foreground">No room types configured.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* AI Panel */}
        <aside className="space-y-4">
          <section className="glass-ai overflow-hidden rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[color:var(--ai-hover)]" />
              <h3 className="text-[13px] font-semibold">AI Demand Forecast</h3>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Next 30 days · 7 high-demand events</p>
            <div className="mt-3 h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast}>
                  <defs>
                    <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.65 0.22 295)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.65 0.22 295)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.28 0.06 265)" strokeDasharray="2 4" />
                  <XAxis dataKey="day" tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 9 }} interval={2} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={{ background: "oklch(0.24 0.05 265)", border: "1px solid oklch(0.35 0.08 265)", borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="occupancy" stroke="oklch(0.74 0.20 295)" strokeWidth={2} fill="url(#aiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-surface">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-[13px] font-semibold">AI Rate Recommendations</h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => autopilot.mutate()}
                  disabled={autopilot.isPending || !planId}
                  title="Apply AI rates within guardrails (skips locked & minor changes, clamps to ±20%)"
                  className="flex items-center gap-1 rounded-md border border-[color:var(--ai)]/40 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--ai-hover)] hover:bg-[color:var(--ai-muted)]/40 disabled:opacity-50">
                  {autopilot.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Autopilot
                </button>
                <button
                  onClick={() => acceptAll.mutate(recs)}
                  disabled={acceptAll.isPending || recs.length === 0 || !planId}
                  className="flex items-center gap-1 rounded-md gradient-ai px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50">
                  {acceptAll.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Accept all
                </button>
              </div>
            </header>
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-background/95 text-[10px] uppercase tracking-wider text-tertiary backdrop-blur">
                  <tr>
                    <th className="px-3 py-2 text-left">Room · Date</th>
                    <th className="px-2 py-2 text-right">AI</th>
                    <th className="px-2 py-2 text-right">Δ</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {recs.map((r) => {
                    const pos = r.variancePercent >= 0;
                    return (
                      <tr key={`${r.roomTypeId}_${r.date}`} className="border-t border-border hover:bg-white/[0.02]">
                        <td className="px-3 py-2 text-muted-foreground">{r.roomTypeName.split(" ")[0]} · {r.date.slice(5)}</td>
                        <td className="px-2 py-2 text-right tabular font-semibold text-[color:var(--ai-hover)]">{inr(r.recommendedRate)}</td>
                        <td className={cn("px-2 py-2 text-right tabular font-semibold", pos ? "text-success" : "text-danger")}>
                          <span className="inline-flex items-center gap-0.5">
                            {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{pos ? "+" : ""}{r.variancePercent}%
                          </span>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <button onClick={() => accept.mutate(r)} disabled={accept.isPending}
                            className="rounded border border-[color:var(--ai)]/30 px-1.5 py-0.5 text-[10px] font-semibold text-[color:var(--ai-hover)] hover:bg-[color:var(--ai-muted)]/40 disabled:opacity-50">
                            Apply
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {recs.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No recommendations.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-surface p-4">
            <h3 className="text-[13px] font-semibold">Competitor Snapshot</h3>
            <p className="text-[11px] text-muted-foreground">Avg rate, Connaught Place 5★ set</p>
            <div className="mt-3 h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "You", v: 8850 }, { name: "Imperial", v: 9200 }, { name: "Le Méridien", v: 9800 },
                  { name: "Shangri-La", v: 11400 }, { name: "Lalit", v: 7800 },
                ]}>
                  <CartesianGrid stroke="oklch(0.28 0.06 265)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: "oklch(0.24 0.05 265)", border: "1px solid oklch(0.35 0.08 265)", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="v" radius={[4, 4, 0, 0]} fill="oklch(0.62 0.18 265)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function RateCell({ rate, base, locked, pending, onSave }: {
  rate: number; base: number; locked: boolean; pending: boolean; onSave: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(rate));

  const ratio = rate / base;
  const tone =
    ratio >= 1.08 ? "bg-success/25 text-success border-success/40"
    : ratio >= 1.0 ? "bg-success/12 text-success border-success/20"
    : ratio >= 0.92 ? "bg-warning/15 text-warning border-warning/25"
    : "bg-danger/15 text-danger border-danger/25";

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { setEditing(false); const n = Math.round(Number(val)); if (n > 0) onSave(n); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { setEditing(false); const n = Math.round(Number(val)); if (n > 0) onSave(n); }
          if (e.key === "Escape") { setEditing(false); setVal(String(rate)); }
        }}
        className="h-9 w-full rounded-md border border-primary bg-background px-1 text-center text-[11px] tabular text-foreground focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => { setVal(String(rate)); setEditing(true); }}
      disabled={pending}
      className={cn("relative w-full rounded-md border px-2 py-1.5 text-center tabular text-[11px] font-semibold transition hover:scale-105 disabled:opacity-60", tone)}
    >
      {locked && <Lock className="absolute left-0.5 top-0.5 h-2.5 w-2.5 opacity-70" />}
      {inr(rate)}
    </button>
  );
}
