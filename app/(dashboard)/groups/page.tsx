"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users2, Plus, Loader2, CalendarDays, BedDouble, XCircle, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { groupsService, type GroupSummary } from "@/lib/services/groups.service";
import { reservationsService } from "@/lib/services/reservations.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Avail { roomType: { id: string; name: string }; available: number; ratePerNight: number }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function addDays(base: string, n: number) { const d = new Date(base); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

const STATUS_TONE: Record<string, string> = {
  CONFIRMED: "border-success/40 bg-success/10 text-success",
  INQUIRY: "border-warning/40 bg-warning/10 text-warning",
  CANCELLED: "border-danger/40 bg-danger/10 text-danger",
};

export default function GroupsPage() {
  const qc = useQueryClient();
  const groups = useQuery({ queryKey: ["groups"], queryFn: () => groupsService.list(), retry: false });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", contactName: "", contactEmail: "", contactPhone: "", checkIn: todayStr(), checkOut: addDays(todayStr(), 2), notes: "" });
  const [qty, setQty] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const avail = useQuery({
    queryKey: ["group-avail", form.checkIn, form.checkOut],
    queryFn: () => reservationsService.checkAvailability({ checkIn: form.checkIn, checkOut: form.checkOut }) as Promise<Avail[]>,
    enabled: showForm && form.checkOut > form.checkIn,
    retry: false,
  });

  const totalRooms = Object.values(qty).reduce((s, n) => s + (n || 0), 0);

  const create = useMutation({
    mutationFn: () => groupsService.create({
      name: form.name.trim(), contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim() || undefined, contactPhone: form.contactPhone.trim() || undefined,
      checkIn: form.checkIn, checkOut: form.checkOut, notes: form.notes.trim() || undefined,
      blocks: Object.entries(qty).filter(([, n]) => n > 0).map(([roomTypeId, quantity]) => ({ roomTypeId, quantity })),
    }),
    onSuccess: (r) => {
      toast.success(`Group created — ${r.roomsCreated} room(s) booked${r.roomsFailed ? `, ${r.roomsFailed} unavailable` : ""}`);
      qc.invalidateQueries({ queryKey: ["groups"] });
      setShowForm(false); setForm({ name: "", contactName: "", contactEmail: "", contactPhone: "", checkIn: todayStr(), checkOut: addDays(todayStr(), 2), notes: "" }); setQty({});
    },
    onError: () => toast.error("Could not create group"),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => groupsService.cancel(id),
    onSuccess: (r) => { toast.success(`Group cancelled — ${r.cancelled} reservation(s) released`); qc.invalidateQueries({ queryKey: ["groups"] }); qc.invalidateQueries({ queryKey: ["group-detail"] }); },
    onError: () => toast.error("Could not cancel group"),
  });

  const canCreate = form.name.trim() && form.contactName.trim() && totalRooms > 0 && form.checkOut > form.checkIn;

  return (
    <>
      <AppHeader title="Group Reservations" breadcrumb="Operations" />
      <div className="flex-1 space-y-5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted/60 text-primary"><Users2 className="h-5 w-5" /></div>
            <div>
              <div className="font-display text-[22px] font-bold tabular leading-none text-foreground">{groups.data?.length ?? 0}</div>
              <div className="text-[11px] uppercase tracking-wider text-tertiary">Groups</div>
            </div>
          </div>
          <button onClick={() => setShowForm((s) => !s)}
            className="flex h-10 items-center gap-2 rounded-lg gradient-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110">
            <Plus className="h-4 w-4" /> New group
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="text-[14px] font-semibold text-foreground">New group block</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input className="ginp" placeholder="Group name (e.g. Sharma Wedding)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="ginp" placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
              <input className="ginp" type="email" placeholder="Contact email (optional)" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
              <input className="ginp" placeholder="Contact phone (optional)" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
              <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Check-in</span>
                <input className="ginp" type="date" min={todayStr()} value={form.checkIn} onChange={(e) => { setForm({ ...form, checkIn: e.target.value, checkOut: form.checkOut <= e.target.value ? addDays(e.target.value, 1) : form.checkOut }); }} /></label>
              <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Check-out</span>
                <input className="ginp" type="date" min={addDays(form.checkIn, 1)} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></label>
            </div>
            <input className="ginp mt-3" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <h4 className="mt-4 text-[12px] font-semibold text-foreground">Room block</h4>
            {avail.isLoading ? (
              <div className="flex h-20 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : (
              <div className="mt-2 space-y-2">
                {(avail.data ?? []).map((a) => (
                  <div key={a.roomType.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4 text-tertiary" />
                      <span className="text-[13px] text-foreground">{a.roomType.name}</span>
                      <span className="text-[11px] text-tertiary">{a.available} avail · {inr(a.ratePerNight)}/night</span>
                    </div>
                    <input type="number" min={0} max={a.available} value={qty[a.roomType.id] ?? 0}
                      onChange={(e) => setQty({ ...qty, [a.roomType.id]: Math.min(a.available, Math.max(0, +e.target.value)) })}
                      className="ginp h-9 w-20 text-center" />
                  </div>
                ))}
                {(avail.data ?? []).length === 0 && <div className="rounded-lg border border-border bg-background/40 p-4 text-center text-[12px] text-muted-foreground">No availability for these dates.</div>}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => create.mutate()} disabled={!canCreate || create.isPending}
                className="flex h-10 items-center gap-2 rounded-lg gradient-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50">
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Create group ({totalRooms} room{totalRooms === 1 ? "" : "s"})
              </button>
              <button onClick={() => setShowForm(false)} className="text-[12px] text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        )}

        {/* Group list */}
        {groups.isLoading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (groups.data ?? []).length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-10 text-center text-[13px] text-muted-foreground">No groups yet. Create a block for a wedding, event, or corporate stay.</div>
        ) : (
          <div className="space-y-3">
            {(groups.data ?? []).map((g) => <GroupCard key={g.id} g={g} expanded={expanded === g.id} onToggle={() => setExpanded(expanded === g.id ? null : g.id)} onCancel={() => { if (confirm(`Cancel group "${g.name}" and release its rooms?`)) cancel.mutate(g.id); }} cancelling={cancel.isPending} />)}
          </div>
        )}
      </div>

      <style>{`.ginp{width:100%;height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.ginp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}`}</style>
    </>
  );
}

function GroupCard({ g, expanded, onToggle, onCancel, cancelling }: { g: GroupSummary; expanded: boolean; onToggle: () => void; onCancel: () => void; cancelling: boolean }) {
  const detail = useQuery({ queryKey: ["group-detail", g.id], queryFn: () => groupsService.get(g.id), enabled: expanded, retry: false });
  return (
    <div className="rounded-xl border border-border bg-surface">
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-left">
        {expanded ? <ChevronDown className="h-4 w-4 text-tertiary" /> : <ChevronRight className="h-4 w-4 text-tertiary" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-foreground">{g.name}</span>
            <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", STATUS_TONE[g.status] ?? "border-border text-muted-foreground")}>{g.status}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-tertiary">
            <span>{g.contactName}</span>
            <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {String(g.checkIn).slice(0, 10)} → {String(g.checkOut).slice(0, 10)}</span>
            <span>{g.activeRooms}/{g.rooms} rooms</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-[16px] font-bold tabular text-foreground">{inr(g.totalValue)}</div>
          <div className="text-[10px] text-tertiary">block value</div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-4">
          {detail.isLoading ? (
            <div className="flex h-16 items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="space-y-1.5">
                {(detail.data?.reservations ?? []).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground"><span className="font-mono text-primary">{r.confirmationNumber}</span> · {r.roomType}{r.room ? ` · Room ${r.room}` : ""}</span>
                    <span className="flex items-center gap-3"><span className="tabular text-foreground">{inr(r.total)}</span><span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", STATUS_TONE[r.status] ?? "text-tertiary")}>{r.status}</span></span>
                  </div>
                ))}
              </div>
              {g.status !== "CANCELLED" && (
                <button onClick={onCancel} disabled={cancelling}
                  className="mt-3 flex h-9 items-center gap-1.5 rounded-lg border border-danger/40 px-3 text-[12px] font-semibold text-danger hover:bg-danger/10 disabled:opacity-50">
                  {cancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} Cancel group
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
