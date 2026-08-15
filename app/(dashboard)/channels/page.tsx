"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Plug, PlugZap, Upload, Download, Loader2, CheckCircle2, RefreshCw, IndianRupee, Link2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { channelsService, type Channel } from "@/lib/services/channels.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const BRAND: Record<string, string> = {
  BOOKING_COM: "bg-[#003580] text-white",
  EXPEDIA: "bg-[#00355f] text-white",
  AIRBNB: "bg-[#ff5a5f] text-white",
  MAKEMYTRIP: "bg-[#eb2226] text-white",
  GOIBIBO: "bg-[#f9760a] text-white",
  AGODA: "bg-[#5c2d91] text-white",
};

function initials(name: string) {
  return name.replace(/[^a-zA-Z. ]/g, "").split(/[ .]/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function ago(iso: string | null) {
  if (!iso) return "never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function ChannelsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["channels"], queryFn: () => channelsService.list(), retry: false });
  const log = useQuery({ queryKey: ["channel-sync-log"], queryFn: () => channelsService.syncLog(), retry: false });
  const channels = data?.channels ?? [];
  const sum = data?.summary;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["channels"] });
    qc.invalidateQueries({ queryKey: ["channel-sync-log"] });
  };

  const connect = useMutation({
    mutationFn: (c: Channel) => (c.isConnected ? channelsService.disconnect(c.id) : channelsService.connect(c.id)),
    onSuccess: (_r, c) => { toast.success(c.isConnected ? `${c.name} disconnected` : `${c.name} connected`); refresh(); },
    onError: () => toast.error("Action failed"),
  });
  const push = useMutation({
    mutationFn: (c: Channel) => channelsService.push(c.id),
    onSuccess: (r) => { toast.success(`Pushed ${r.count.toLocaleString()} rate/availability records to ${r.channel}`); refresh(); },
    onError: () => toast.error("Push failed"),
  });
  const pull = useMutation({
    mutationFn: (c: Channel) => channelsService.pull(c.id),
    onSuccess: (r) => {
      toast.success(r.pulled ? `Pulled ${r.pulled} reservation(s) from ${r.channel} → now in PMS` : `No new reservations from ${r.channel}`);
      refresh();
    },
    onError: () => toast.error("Pull failed"),
  });
  const busy = (id: string) => (connect.isPending && connect.variables?.id === id) || (push.isPending && push.variables?.id === id) || (pull.isPending && pull.variables?.id === id);

  return (
    <>
      <AppHeader title="Channel Manager" breadcrumb="Revenue" />
      <div className="flex-1 space-y-6 p-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<Link2 className="h-4 w-4" />} label="Connected" value={sum ? `${sum.connected}/${sum.total}` : "—"} />
          <Stat icon={<Download className="h-4 w-4" />} label="OTA reservations" value={sum ? String(sum.otaReservations) : "—"} />
          <Stat icon={<IndianRupee className="h-4 w-4" />} label="Avg commission" value={sum ? `${sum.avgCommission}%` : "—"} />
          <Stat icon={<Globe className="h-4 w-4" />} label="Channels" value={sum ? String(sum.total) : "—"} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Channels */}
          <div className="xl:col-span-2">
            <h3 className="mb-3 text-[13px] font-semibold text-foreground">OTA Channels</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {channels.map((c) => (
                <div key={c.id} className={cn("rounded-xl border bg-surface p-4 transition", c.isConnected ? "border-primary/30" : "border-border")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-[13px] font-bold", BRAND[c.code] ?? "bg-elevated text-foreground")}>{initials(c.name)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-foreground">{c.name}</div>
                      <div className="text-[11px] text-tertiary">{c.commissionPct}% commission</div>
                    </div>
                    {c.isConnected
                      ? <span className="flex items-center gap-1 rounded-md border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success"><CheckCircle2 className="h-3 w-3" /> Connected</span>
                      : <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Not connected</span>}
                  </div>

                  {c.isConnected && (
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-[11px]">
                      <span className="text-muted-foreground">Rate <span className="font-semibold text-foreground">{inr(c.channelRate)}</span></span>
                      <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> In parity</span>
                      <span className="text-tertiary">synced {ago(c.lastSyncAt)}</span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => connect.mutate(c)} disabled={busy(c.id)}
                      className={cn("flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold disabled:opacity-50",
                        c.isConnected ? "border border-border text-muted-foreground hover:text-foreground" : "gradient-primary text-primary-foreground shadow-glow-primary hover:brightness-110")}>
                      {busy(c.id) && connect.variables?.id === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : c.isConnected ? <Plug className="h-3.5 w-3.5" /> : <PlugZap className="h-3.5 w-3.5" />}
                      {c.isConnected ? "Disconnect" : "Connect"}
                    </button>
                    {c.isConnected && (
                      <>
                        <button onClick={() => push.mutate(c)} disabled={busy(c.id)}
                          className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[12px] font-medium text-foreground hover:border-border-strong disabled:opacity-50">
                          {push.isPending && push.variables?.id === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Push
                        </button>
                        <button onClick={() => pull.mutate(c)} disabled={busy(c.id)}
                          className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-[12px] font-medium text-foreground hover:border-border-strong disabled:opacity-50">
                          {pull.isPending && pull.variables?.id === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Pull
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync activity */}
          <div>
            <h3 className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-foreground"><RefreshCw className="h-4 w-4 text-primary" /> Sync Activity</h3>
            <div className="rounded-xl border border-border bg-surface p-4">
              {log.isLoading ? (
                <div className="flex h-24 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : (log.data ?? []).length === 0 ? (
                <div className="py-8 text-center text-[12px] text-muted-foreground">No sync activity yet. Connect a channel to begin.</div>
              ) : (
                <div className="space-y-2.5">
                  {(log.data ?? []).map((l) => (
                    <div key={l.id} className="flex items-start gap-2.5">
                      <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", l.direction === "PULL" ? "bg-info-muted/50 text-info" : "bg-primary-muted/50 text-primary")}>
                        {l.direction === "PULL" ? <Download className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] text-foreground">{l.summary}</div>
                        <div className="text-[10px] text-tertiary">{l.channel} · {ago(l.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
