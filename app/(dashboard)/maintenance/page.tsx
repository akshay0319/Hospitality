"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wrench, AlertTriangle, Clock, PauseCircle, CheckCircle2, Plus, X, Loader2, MapPin, IndianRupee, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui-kit";
import { maintenanceService, type MaintenanceTicket } from "@/lib/services/maintenance.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_TABS = ["ALL", "OPEN", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED"] as const;
const STATUS_LABEL: Record<string, string> = {
  ALL: "All", OPEN: "Open", IN_PROGRESS: "In Progress", ON_HOLD: "On Hold", RESOLVED: "Resolved", CLOSED: "Closed",
};
const STATUS_TONE: Record<string, "danger" | "warning" | "info" | "success" | "muted" | "primary"> = {
  OPEN: "danger", IN_PROGRESS: "primary", ON_HOLD: "warning", RESOLVED: "success", CLOSED: "muted",
};
const PRIO_TONE: Record<string, "danger" | "warning" | "info" | "muted"> = {
  CRITICAL: "danger", HIGH: "warning", NORMAL: "info", LOW: "muted",
};

export default function MaintenancePage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("ALL");
  const [selected, setSelected] = useState<MaintenanceTicket | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: dash } = useQuery({ queryKey: ["mnt-dash"], queryFn: () => maintenanceService.getDashboard(), retry: false });
  const { data: tickets, isLoading } = useQuery({
    queryKey: ["mnt-list", tab],
    queryFn: () => maintenanceService.findAll(tab === "ALL" ? {} : { status: tab }),
    retry: false,
  });

  const list = tickets ?? [];

  return (
    <>
      <AppHeader title="Maintenance" breadcrumb="Operations" />
      <div className="flex-1 space-y-5 p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={Wrench} label="Open" value={dash?.open ?? 0} tone="text-danger bg-danger-muted/60" />
          <Stat icon={Clock} label="In Progress" value={dash?.inProgress ?? 0} tone="text-primary bg-primary-muted/60" />
          <Stat icon={AlertTriangle} label="Critical" value={dash?.critical ?? 0} tone="text-warning bg-warning-muted/60" />
          <Stat icon={CheckCircle2} label="Resolved" value={dash?.resolved ?? 0} tone="text-success bg-success-muted/60" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
            {STATUS_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("rounded-md px-3 py-1.5 text-[12px] font-medium transition",
                  tab === t ? "bg-primary-muted/60 text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {STATUS_LABEL[t]}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex h-9 items-center gap-1.5 rounded-md gradient-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110">
            <Plus className="h-3.5 w-3.5" /> New Ticket
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-border bg-background/40">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                  <th className="px-4 py-2.5">Issue</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Assignee</th>
                  <th className="px-4 py-2.5 text-right">Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && <tr><td colSpan={7} className="px-4 py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" /></td></tr>}
                {!isLoading && list.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-muted-foreground">No tickets in this view.</td></tr>}
                {list.map((t) => (
                  <tr key={t.id} onClick={() => setSelected(t)}
                    className={cn("cursor-pointer text-[13px] transition hover:bg-white/[0.02]", selected?.id === t.id && "bg-primary-muted/30")}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{t.title}</div>
                      <div className="line-clamp-1 text-[11px] text-tertiary">{t.description}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.room ? `Room ${t.room.number}` : "Common area"}</td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">{t.category ?? "—"}</td>
                    <td className="px-4 py-3"><Badge tone={PRIO_TONE[t.priority]}>{t.priority}</Badge></td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge></td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">{t.assignedTo ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}` : <span className="text-tertiary">Unassigned</span>}</td>
                    <td className="px-4 py-3 text-right tabular text-muted-foreground">{t.estimatedCost ? inr(Number(t.estimatedCost)) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && <TicketDrawer ticket={selected} onClose={() => setSelected(null)} onChanged={() => { qc.invalidateQueries({ queryKey: ["mnt-list"] }); qc.invalidateQueries({ queryKey: ["mnt-dash"] }); }} />}
      {showForm && <CreateForm onClose={() => setShowForm(false)} onCreated={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ["mnt-list"] }); qc.invalidateQueries({ queryKey: ["mnt-dash"] }); }} />}
    </>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-elevated p-4">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tone)}><Icon className="h-4 w-4" /></div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-tertiary">{label}</div>
      <div className="mt-1 font-display text-[24px] font-bold tabular leading-none text-foreground">{value}</div>
    </div>
  );
}

const NEXT_STATUS: { status: string; label: string; tone: string }[] = [
  { status: "IN_PROGRESS", label: "Start work", tone: "gradient-primary text-primary-foreground shadow-glow-primary" },
  { status: "ON_HOLD", label: "Put on hold", tone: "border border-warning/40 text-warning bg-warning/5" },
  { status: "RESOLVED", label: "Mark resolved", tone: "border border-success/40 text-success bg-success/5" },
  { status: "CLOSED", label: "Close", tone: "border border-border text-muted-foreground bg-background/40" },
];

function TicketDrawer({ ticket, onClose, onChanged }: { ticket: MaintenanceTicket; onClose: () => void; onChanged: () => void }) {
  const update = useMutation({
    mutationFn: (status: string) => maintenanceService.updateStatus(ticket.id, status),
    onSuccess: (_d, status) => { toast.success(`Ticket marked ${STATUS_LABEL[status] ?? status}`); onChanged(); onClose(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Update failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <aside onClick={(e) => e.stopPropagation()} className="relative h-full w-full max-w-[420px] overflow-y-auto border-l border-border bg-surface shadow-elevated animate-slide-in-right">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-3 backdrop-blur">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Maintenance Ticket</div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"><X className="h-4 w-4" /></button>
        </header>
        <div className="p-5">
          <div className="flex items-center gap-2">
            <Badge tone={PRIO_TONE[ticket.priority]}>{ticket.priority}</Badge>
            <Badge tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Badge>
          </div>
          <h2 className="mt-2 font-display text-[19px] font-semibold leading-tight">{ticket.title}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{ticket.description}</p>

          <div className="mt-4 space-y-1 border-t border-border pt-4">
            <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={ticket.room ? `Room ${ticket.room.number} (Floor ${ticket.room.floor})` : "Common area"} />
            <Row icon={<Wrench className="h-3.5 w-3.5" />} label="Category" value={ticket.category ?? "—"} />
            <Row icon={<IndianRupee className="h-3.5 w-3.5" />} label="Est. cost" value={ticket.estimatedCost ? inr(Number(ticket.estimatedCost)) : "—"} />
            <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Due" value={ticket.dueDate ? ticket.dueDate.slice(0, 10) : "—"} />
            <Row icon={<PauseCircle className="h-3.5 w-3.5" />} label="Assignee" value={ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : "Unassigned"} />
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-tertiary">Update status</div>
            <div className="grid grid-cols-2 gap-2">
              {NEXT_STATUS.filter((s) => s.status !== ticket.status).map((s) => (
                <button key={s.status} disabled={update.isPending} onClick={() => update.mutate(s.status)}
                  className={cn("flex h-9 items-center justify-center rounded-md px-2 text-[12px] font-semibold transition hover:brightness-110 disabled:opacity-50", s.tone)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 text-[12px]">
      <span className="flex items-center gap-1.5 text-muted-foreground"><span className="text-tertiary">{icon}</span>{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
const CATEGORIES = ["HVAC", "Plumbing", "Electrical", "Electronics", "Security", "Facilities", "Furniture", "Other"];

function CreateForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "NORMAL", category: "HVAC", estimatedCost: "" });
  const create = useMutation({
    mutationFn: () => maintenanceService.create({
      title: form.title, description: form.description, priority: form.priority, category: form.category,
      ...(form.estimatedCost && { estimatedCost: Number(form.estimatedCost) }),
    }),
    onSuccess: () => { toast.success("Ticket created"); onCreated(); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message?.toString() ?? "Failed to create"),
  });

  const valid = form.title.trim().length >= 2 && form.description.trim().length >= 2;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <aside onClick={(e) => e.stopPropagation()} className="relative h-full w-full max-w-[420px] overflow-y-auto border-l border-border bg-surface shadow-elevated animate-slide-in-right">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-3 backdrop-blur">
          <div className="text-[13px] font-semibold text-foreground">New Maintenance Ticket</div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-4 p-5">
          <F label="Title"><input className="minp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. AC not cooling in Room 305" /></F>
          <F label="Description"><textarea className="minp min-h-[90px] py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue…" /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Priority"><select className="minp" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select></F>
            <F label="Category"><select className="minp" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></F>
          </div>
          <F label="Estimated cost (₹)"><input className="minp" type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} placeholder="Optional" /></F>
          <button disabled={!valid || create.isPending} onClick={() => create.mutate()}
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-md gradient-primary text-[13px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create ticket
          </button>
        </div>
        <style>{`.minp{width:100%;min-height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.minp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}textarea.minp{resize:vertical}`}</style>
      </aside>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">{label}</span>
      {children}
    </label>
  );
}
