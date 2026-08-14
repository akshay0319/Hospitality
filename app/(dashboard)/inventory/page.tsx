"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Lock, Unlock, Loader2, X, Ban } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { roomsService } from "@/lib/services/rooms.service";
import { cn } from "@/lib/utils";

const WINDOW = 14;

interface Room { id: string; number: string; floor: number; status: string; isBlocked: boolean; blockReason?: string | null; roomType?: { name: string; code: string } | null }
interface Res { id: string; roomId: string; checkIn: string; checkOut: string; status: string; guest?: { firstName: string; lastName: string } }

function iso(d: Date) { return d.toISOString().slice(0, 10); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function diffDays(a: string, b: Date) { return Math.round((+new Date(a) - +b) / 86400000); }

const STATUS_DOT: Record<string, string> = {
  CLEAN: "var(--success)", DIRTY: "var(--danger)", CLEANING: "var(--warning)",
  INSPECTING: "var(--info)", MAINTENANCE: "var(--warning)", BLOCKED: "var(--tertiary)", OUT_OF_ORDER: "var(--danger)",
};

export default function InventoryPage() {
  const qc = useQueryClient();
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; });
  const [blockTarget, setBlockTarget] = useState<Room | null>(null);

  const end = addDays(startDate, WINDOW);
  const days = Array.from({ length: WINDOW }, (_, i) => addDays(startDate, i));

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", iso(startDate)],
    queryFn: () => roomsService.getCalendar(iso(startDate), iso(end)) as Promise<{ rooms: Room[]; reservations: Res[] }>,
    retry: false,
  });

  const rooms = data?.rooms ?? [];
  const reservations = data?.reservations ?? [];
  const resByRoom = reservations.reduce<Record<string, Res[]>>((acc, r) => {
    (acc[r.roomId] ??= []).push(r); return acc;
  }, {});

  const invalidate = () => qc.invalidateQueries({ queryKey: ["inventory"] });
  const unblock = useMutation({
    mutationFn: (id: string) => roomsService.unblock(id),
    onSuccess: () => { toast.success("Room unblocked"); invalidate(); },
    onError: () => toast.error("Failed to unblock"),
  });

  return (
    <>
      <AppHeader title="Inventory Calendar" breadcrumb="Operations" />
      <div className="flex-1 space-y-4 p-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setStartDate((d) => addDays(d, -7))} className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /></button>
            <div className="rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-foreground">
              {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {addDays(startDate, WINDOW - 1).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            <button onClick={() => setStartDate((d) => addDays(d, 7))} className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground"><ChevronRight className="h-4 w-4" /></button>
            <button onClick={() => { const d = new Date(); d.setHours(0, 0, 0, 0); setStartDate(d); }} className="rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground">Today</button>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <Legend color="var(--primary)" label="Confirmed" />
            <Legend color="var(--success)" label="In-house" />
            <Legend color="var(--tertiary)" label="Blocked" />
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header row */}
                <div className="grid grid-cols-[160px_1fr] border-b border-border bg-background/40">
                  <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-tertiary">Room</div>
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${WINDOW}, 1fr)` }}>
                    {days.map((d, i) => {
                      const weekend = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <div key={i} className={cn("border-l border-border/60 px-1 py-2 text-center", weekend && "bg-primary-muted/10")}>
                          <div className="text-[10px] font-semibold text-muted-foreground">{d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2)}</div>
                          <div className="text-[11px] tabular text-foreground">{d.getDate()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Room rows */}
                {rooms.map((room) => {
                  const roomRes = resByRoom[room.id] ?? [];
                  return (
                    <div key={room.id} className="grid grid-cols-[160px_1fr] border-b border-border hover:bg-white/[0.015]">
                      {/* Room label */}
                      <div className="flex items-center justify-between gap-2 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_DOT[room.status] ?? "var(--tertiary)" }} />
                          <div>
                            <div className="text-[12px] font-semibold text-foreground">{room.number}</div>
                            <div className="text-[10px] text-tertiary">{room.roomType?.name ?? "—"}</div>
                          </div>
                        </div>
                        {room.isBlocked ? (
                          <button onClick={() => unblock.mutate(room.id)} title={`Blocked: ${room.blockReason ?? ""} — click to unblock`} className="rounded p-1 text-warning hover:bg-warning/10"><Unlock className="h-3.5 w-3.5" /></button>
                        ) : (
                          <button onClick={() => setBlockTarget(room)} title="Block room" className="rounded p-1 text-tertiary hover:bg-white/[0.06] hover:text-foreground"><Lock className="h-3.5 w-3.5" /></button>
                        )}
                      </div>

                      {/* Day track */}
                      <div className="relative grid" style={{ gridTemplateColumns: `repeat(${WINDOW}, 1fr)` }}>
                        {days.map((d, i) => {
                          const weekend = d.getDay() === 0 || d.getDay() === 6;
                          return <div key={i} className={cn("h-11 border-l border-border/40", weekend && "bg-primary-muted/5")} />;
                        })}

                        {/* Blocked overlay */}
                        {room.isBlocked && (
                          <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-[11px] font-medium text-tertiary"
                            style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, oklch(0.45 0.05 260 / 0.15) 6px, oklch(0.45 0.05 260 / 0.15) 12px)" }}>
                            <Ban className="h-3.5 w-3.5" /> {room.blockReason ?? "Blocked"}
                          </div>
                        )}

                        {/* Reservation bars */}
                        {!room.isBlocked && roomRes.map((r) => {
                          const s = Math.max(0, diffDays(r.checkIn, startDate));
                          const e = Math.min(WINDOW, diffDays(r.checkOut, startDate));
                          if (e <= 0 || s >= WINDOW || e <= s) return null;
                          const inHouse = r.status === "CHECKED_IN";
                          return (
                            <div key={r.id}
                              className={cn("absolute top-1.5 bottom-1.5 flex items-center overflow-hidden rounded-md border px-2 text-[11px] font-medium",
                                inHouse ? "border-success/40 bg-gradient-to-r from-success/30 to-success/10 text-success" : "border-primary/40 bg-gradient-to-r from-primary/30 to-primary/10 text-primary")}
                              style={{ left: `${(s / WINDOW) * 100}%`, width: `${((e - s) / WINDOW) * 100}%` }}
                              title={`${r.guest?.firstName ?? ""} ${r.guest?.lastName ?? ""} · ${r.checkIn.slice(5, 10)}→${r.checkOut.slice(5, 10)}`}>
                              <span className="truncate">{r.guest?.firstName} {r.guest?.lastName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {rooms.length === 0 && <div className="py-10 text-center text-[13px] text-muted-foreground">No rooms configured.</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {blockTarget && <BlockModal room={blockTarget} onClose={() => setBlockTarget(null)} onBlocked={() => { setBlockTarget(null); invalidate(); }} />}
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />{label}</div>;
}

function BlockModal({ room, onClose, onBlocked }: { room: Room; onClose: () => void; onBlocked: () => void }) {
  const [reason, setReason] = useState("Maintenance");
  const [until, setUntil] = useState("");
  const block = useMutation({
    mutationFn: () => roomsService.block(room.id, reason.trim() || "Blocked by staff", until || undefined),
    onSuccess: () => { toast.success(`Room ${room.number} blocked`); onBlocked(); },
    onError: () => toast.error("Failed to block room"),
  });

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-elevated animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[15px] font-semibold">Block Room {room.number}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">Blocked rooms are removed from availability and can&apos;t be booked.</p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Reason</span>
            <input className="binp" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Maintenance, deep clean…" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Blocked until (optional)</span>
            <input className="binp" type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="h-9 rounded-md border border-border bg-background/40 px-4 text-[12px] font-medium text-muted-foreground hover:text-foreground">Cancel</button>
          <button disabled={block.isPending} onClick={() => block.mutate()} className="flex h-9 items-center gap-1.5 rounded-md gradient-primary px-4 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-60">
            {block.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-3.5 w-3.5" />} Block room
          </button>
        </div>
        <style>{`.binp{width:100%;height:38px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.binp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}`}</style>
      </div>
    </div>
  );
}
