"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DoorOpen, DoorClosed, Users, Loader2, LogIn, LogOut, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui-kit";
import { reservationsService } from "@/lib/services/reservations.service";
import { roomsService } from "@/lib/services/rooms.service";
import { mapReservation, initials, type ApiReservation } from "@/lib/mappers";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tab = "arrivals" | "inhouse" | "departures";
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "arrivals", label: "Arriving", icon: DoorOpen },
  { id: "inhouse", label: "In-House", icon: Users },
  { id: "departures", label: "Departing", icon: DoorClosed },
];

function todayISO() {
  // Local YYYY-MM-DD
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function FrontDeskPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("arrivals");
  const today = todayISO();

  const { data, isLoading } = useQuery({
    queryKey: ["fd-reservations"],
    queryFn: () => reservationsService.findAll({ limit: 200 }),
    retry: false,
  });
  const { data: cleanRooms } = useQuery({
    queryKey: ["fd-clean-rooms"],
    queryFn: () => roomsService.findAll({ status: "CLEAN" }),
    retry: false,
  });

  const all = (data?.data as ApiReservation[] | undefined) ?? [];
  const raw = all.map((r) => ({ api: r, ui: mapReservation(r) }));

  const arrivals = raw.filter((r) => r.ui.checkIn === today && r.ui.status === "confirmed");
  const inhouse = raw.filter((r) => r.ui.status === "checked-in");
  const departures = raw.filter((r) => r.ui.status === "checked-in" && r.ui.checkOut === today);

  const lists: Record<Tab, typeof raw> = { arrivals, inhouse, departures };
  const rooms = (cleanRooms?.data as { id: string; number: string }[] | undefined) ?? [];

  const checkIn = useMutation({
    mutationFn: ({ id, roomId }: { id: string; roomId: string }) => reservationsService.checkIn(id, roomId),
    onSuccess: () => { toast.success("Guest checked in"); qc.invalidateQueries({ queryKey: ["fd-reservations"] }); qc.invalidateQueries({ queryKey: ["fd-clean-rooms"] }); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Check-in failed"),
  });
  const checkOut = useMutation({
    mutationFn: (id: string) => reservationsService.checkOut(id),
    onSuccess: () => { toast.success("Guest checked out"); qc.invalidateQueries({ queryKey: ["fd-reservations"] }); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Check-out failed"),
  });

  const rows = lists[tab];

  return (
    <>
      <AppHeader title="Front Desk" breadcrumb="Operations" />
      <div className="flex-1 space-y-5 p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={DoorOpen} label="Arrivals Today" value={arrivals.length} tone="text-success bg-success-muted/60" />
          <Stat icon={Users} label="In-House" value={inhouse.length} tone="text-primary bg-primary-muted/60" />
          <Stat icon={DoorClosed} label="Departures Today" value={departures.length} tone="text-warning bg-warning-muted/60" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition",
                tab === t.id ? "bg-primary-muted/60 text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
              <span className="ml-1 rounded bg-elevated px-1.5 text-[10px] tabular">{lists[t.id].length}</span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : rows.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <BedDouble className="h-6 w-6 text-tertiary" />
              <p className="text-[13px]">Nothing to {tab === "arrivals" ? "check in" : tab === "departures" ? "check out" : "show"} right now.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map(({ api, ui }) => (
                <li key={api.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-muted text-[11px] font-bold text-primary">
                    {ui.initials || initials(api.guest?.firstName, api.guest?.lastName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground">{ui.guest}</span>
                      {ui.loyalty && <span className="text-[10px] text-warning">★ {ui.loyalty}</span>}
                    </div>
                    <div className="text-[11px] text-tertiary">
                      {ui.room !== "—" ? `Room ${ui.room} · ` : ""}{ui.roomType} · {ui.nights}N · <span className="font-mono">{ui.id}</span>
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-[12px] tabular text-foreground">{inr(ui.amount)}</div>
                    <div className="text-[11px] text-tertiary">{ui.checkIn} → {ui.checkOut}</div>
                  </div>
                  <Badge tone={ui.status === "checked-in" ? "success" : ui.status === "confirmed" ? "primary" : "muted"}>
                    {ui.status.replace("-", " ")}
                  </Badge>

                  {tab === "arrivals" && (
                    <CheckInAction
                      reservation={api}
                      rooms={rooms}
                      pending={checkIn.isPending}
                      onCheckIn={(roomId) => checkIn.mutate({ id: api.id, roomId })}
                    />
                  )}
                  {tab === "departures" && (
                    <button onClick={() => checkOut.mutate(api.id)} disabled={checkOut.isPending}
                      className="flex h-8 items-center gap-1.5 rounded-md gradient-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-60">
                      <LogOut className="h-3.5 w-3.5" /> Check out
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

function CheckInAction({
  reservation, rooms, pending, onCheckIn,
}: {
  reservation: ApiReservation;
  rooms: { id: string; number: string }[];
  pending: boolean;
  onCheckIn: (roomId: string) => void;
}) {
  const assignedRoomId = (reservation as ApiReservation & { roomId?: string | null }).roomId ?? null;
  const [roomId, setRoomId] = useState<string>(assignedRoomId ?? "");

  if (assignedRoomId) {
    return (
      <button onClick={() => onCheckIn(assignedRoomId)} disabled={pending}
        className="flex h-8 items-center gap-1.5 rounded-md gradient-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-60">
        <LogIn className="h-3.5 w-3.5" /> Check in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <select value={roomId} onChange={(e) => setRoomId(e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground focus:border-primary focus:outline-none">
        <option value="">Assign room…</option>
        {rooms.map((r) => <option key={r.id} value={r.id}>Room {r.number}</option>)}
      </select>
      <button onClick={() => roomId && onCheckIn(roomId)} disabled={pending || !roomId}
        className="flex h-8 items-center gap-1.5 rounded-md gradient-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-40">
        <LogIn className="h-3.5 w-3.5" /> Check in
      </button>
    </div>
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
