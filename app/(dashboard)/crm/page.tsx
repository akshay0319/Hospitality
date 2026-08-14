"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Star, Award, Repeat, IndianRupee, Users, ArrowRight, TrendingDown, Sparkles, Loader2, Send, Mail } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { guestsService, type ScoredGuest } from "@/lib/services/guests.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  vip: { icon: Crown, tone: "text-[color:var(--ai-hover)] bg-[color:var(--ai-muted)]/50" },
  platinum: { icon: Star, tone: "text-info bg-info-muted/50" },
  gold: { icon: Award, tone: "text-warning bg-warning-muted/50" },
  returning: { icon: Repeat, tone: "text-success bg-success-muted/50" },
  highvalue: { icon: IndianRupee, tone: "text-primary bg-primary-muted/50" },
};

const RISK_TONE: Record<string, string> = {
  HIGH: "border-danger/40 bg-danger/10 text-danger",
  MEDIUM: "border-warning/40 bg-warning/10 text-warning",
  LOW: "border-success/40 bg-success/10 text-success",
  NEW: "border-info/40 bg-info/10 text-info",
};

export default function CRMPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["crm-segments"], queryFn: () => guestsService.segments(), retry: false });
  const insights = useQuery({ queryKey: ["crm-insights"], queryFn: () => guestsService.insights(), retry: false });
  const campaigns = useQuery({ queryKey: ["crm-campaigns"], queryFn: () => guestsService.listCampaigns(), retry: false });
  const segments = data?.segments ?? [];
  const sum = insights.data?.summary;

  // Campaign builder state
  const [segment, setSegment] = useState("");
  const [goal, setGoal] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState(0);

  const generate = useMutation({
    mutationFn: () => guestsService.generateCampaign(segment, goal),
    onSuccess: (c) => {
      setSubject(c.subject); setBody(c.body); setAudience(c.audienceCount);
      if (!name) setName(`${segments.find((s) => s.key === segment)?.label ?? "Campaign"} outreach`);
      toast.success(c.live ? "Draft written by AI" : "Draft ready (AI disabled — template used)");
    },
    onError: () => toast.error("Could not generate copy"),
  });

  const save = useMutation({
    mutationFn: () => guestsService.createCampaign({ name, segment, subject, body, audienceCount: audience }),
    onSuccess: () => {
      toast.success("Campaign saved as draft");
      qc.invalidateQueries({ queryKey: ["crm-campaigns"] });
      setName(""); setSubject(""); setBody(""); setGoal(""); setAudience(0);
    },
    onError: () => toast.error("Could not save campaign"),
  });

  return (
    <>
      <AppHeader title="CRM" breadcrumb="Guests" />
      <div className="flex-1 space-y-6 p-6">
        {/* Total + segments */}
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

        {/* Guest Intelligence */}
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-foreground"><Sparkles className="h-4 w-4 text-[color:var(--ai-hover)]" /> AI Guest Intelligence</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Churn risk (high)" value={sum ? String(sum.high) : "—"} tone="text-danger" sub={sum ? `${sum.medium} medium · ${sum.low} low` : ""} />
            <StatCard label="New guests" value={sum ? String(sum.new) : "—"} tone="text-info" sub="No stays yet" />
            <StatCard label="Current LTV" value={sum ? inr(sum.currentLtv) : "—"} tone="text-foreground" sub="Lifetime to date" />
            <StatCard label="Projected LTV" value={sum ? inr(sum.projectedLtv) : "—"} tone="text-success" sub="Heuristic forecast" />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
            <RiskTable title="At-risk guests" icon={<TrendingDown className="h-4 w-4 text-danger" />} rows={insights.data?.atRisk ?? []} loading={insights.isLoading} empty="No high-risk guests 🎉" />
            <RiskTable title="Top value guests" icon={<Crown className="h-4 w-4 text-[color:var(--ai-hover)]" />} rows={insights.data?.topValue ?? []} loading={insights.isLoading} empty="No guests yet" showLtv />
          </div>
        </div>

        {/* AI Campaign builder */}
        <div>
          <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-foreground"><Mail className="h-4 w-4 text-primary" /> AI Campaigns</h3>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {/* Builder */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Segment</span>
                  <select value={segment} onChange={(e) => setSegment(e.target.value)} className="cinp">
                    <option value="">Choose a segment…</option>
                    {segments.map((s) => <option key={s.key} value={s.key}>{s.label} ({s.count})</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Goal (optional)</span>
                  <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. win back for the monsoon season" className="cinp" />
                </label>
              </div>
              <button onClick={() => generate.mutate()} disabled={!segment || generate.isPending}
                className="mt-3 flex h-10 items-center gap-2 rounded-lg gradient-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50">
                {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate with AI
              </button>

              {(subject || body) && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <div className="text-[11px] text-tertiary">Audience: <span className="font-semibold text-foreground">{audience}</span> guests · editable below</div>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name" className="cinp" />
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" className="cinp" />
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7} placeholder="Email body" className="cinp resize-y py-2 leading-relaxed" />
                  <div className="flex items-center gap-2">
                    <button onClick={() => save.mutate()} disabled={!name.trim() || !body.trim() || save.isPending}
                      className="flex h-10 items-center gap-2 rounded-lg border border-primary/40 px-4 text-[13px] font-semibold text-primary hover:bg-primary-muted/30 disabled:opacity-50">
                      {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Save draft
                    </button>
                    <span className="text-[11px] text-tertiary">Sending needs an email provider (SMTP) — drafts are saved for now.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Saved drafts */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-2 text-[12px] font-semibold text-foreground">Saved campaigns</div>
              {campaigns.isLoading ? (
                <div className="flex h-24 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : (campaigns.data ?? []).length === 0 ? (
                <div className="py-8 text-center text-[12px] text-muted-foreground">No campaigns yet. Generate one on the left.</div>
              ) : (
                <div className="space-y-2">
                  {(campaigns.data ?? []).map((c) => (
                    <div key={c.id} className="rounded-lg border border-border bg-background/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-foreground">{c.name}</span>
                        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{c.status}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-tertiary">{c.segment} · {c.audienceCount} recipients</div>
                      {c.subject && <div className="mt-1 truncate text-[12px] text-muted-foreground">✉️ {c.subject}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`.cinp{width:100%;min-height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.cinp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}textarea.cinp{padding:8px 12px}`}</style>
    </>
  );
}

function StatCard({ label, value, tone, sub }: { label: string; value: string; tone: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] uppercase tracking-wider text-tertiary">{label}</div>
      <div className={cn("mt-1 font-display text-[20px] font-bold tabular leading-none", tone)}>{value}</div>
      {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function RiskTable({ title, icon, rows, loading, empty, showLtv }: { title: string; icon: React.ReactNode; rows: ScoredGuest[]; loading: boolean; empty: string; showLtv?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-foreground">{icon} {title}</div>
      {loading ? (
        <div className="flex h-24 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-[12px] text-muted-foreground">{empty}</div>
      ) : (
        <div className="space-y-1.5">
          {rows.map((g) => (
            <div key={g.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background/40 px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-foreground">{g.name}{g.isVip && <Crown className="ml-1 inline h-3 w-3 text-[color:var(--ai-hover)]" />}</div>
                <div className="truncate text-[11px] text-tertiary">{g.churnReason} · {g.totalStays} stay{g.totalStays === 1 ? "" : "s"}</div>
              </div>
              <div className="text-right">
                {showLtv
                  ? <div className="font-display text-[13px] font-bold tabular text-success">{inr(g.ltvProjection)}</div>
                  : <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", RISK_TONE[g.churnRisk])}>{g.churnRisk}</span>}
                <div className="text-[10px] text-tertiary">{inr(g.lifetimeValue)} LTV</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
