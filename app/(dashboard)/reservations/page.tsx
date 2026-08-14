"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Download, Filter, X, ChevronRight, Phone, Mail, CreditCard, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui-kit";
import { reservations as sampleReservations, type Reservation, type ResStatus } from "@/lib/sample-data";
import { reservationsService } from "@/lib/services/reservations.service";
import { mapReservation, type ApiReservation } from "@/lib/mappers";
import { ReservationWizard } from "@/components/reservations/reservation-wizard";
import { ReservationEditModal } from "@/components/reservations/reservation-edit";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const tabs = ["All", "Arriving Today", "In House", "Departing Today", "Upcoming", "Cancelled"];

const statusTone: Record<ResStatus, "success" | "primary" | "warning" | "muted" | "danger"> = {
  "checked-in": "success",
  confirmed: "primary",
  pending: "warning",
  "checked-out": "muted",
  cancelled: "danger",
};

const statusLabel: Record<ResStatus, string> = {
  "checked-in": "Checked In",
  confirmed: "Confirmed",
  pending: "Pending",
  "checked-out": "Checked Out",
  cancelled: "Cancelled",
};

export default function ReservationsPage() {
  const qc = useQueryClient();
  const [active, setActive] = useState("All");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<ApiReservation | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => reservationsService.findAll({ limit: 100 }),
    retry: false,
  });

  const apiList = (data?.data as ApiReservation[] | undefined) ?? [];
  const byConf = Object.fromEntries(apiList.map((r) => [r.confirmationNumber || r.id, r]));
  const live = data?.data ? apiList.map(mapReservation) : null;
  const reservations = live && live.length ? live : isError ? sampleReservations : live ?? [];

  const refetchAll = () => qc.invalidateQueries({ queryKey: ["reservations"] });

  return (
    <>
      <AppHeader title="Reservations" breadcrumb="Operations" />
      <div className="flex-1 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[12px] font-medium transition",
                  active === t ? "bg-primary-muted/60 text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground">
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button onClick={() => setShowNew(true)} className="flex h-8 items-center gap-1.5 rounded-md gradient-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110">
              <Plus className="h-3.5 w-3.5" /> New Reservation
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-border bg-background/40">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                  <th className="px-4 py-2.5">Confirmation</th>
                  <th className="px-4 py-2.5">Guest</th>
                  <th className="px-4 py-2.5">Room</th>
                  <th className="px-4 py-2.5">Check-in</th>
                  <th className="px-4 py-2.5">Check-out</th>
                  <th className="px-4 py-2.5">Nights</th>
                  <th className="px-4 py-2.5">Guests</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                    </td>
                  </tr>
                )}
                {!isLoading && reservations.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                      No reservations yet.
                    </td>
                  </tr>
                )}
                {reservations.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={cn(
                      "cursor-pointer text-[13px] transition hover:bg-white/[0.02]",
                      selected?.id === r.id && "bg-primary-muted/30",
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-[12px] text-primary">{r.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-muted text-[10px] font-bold text-primary">
                          {r.initials}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{r.guest}</div>
                          {r.loyalty && <div className="text-[10px] text-warning">★ {r.loyalty}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.room}</div>
                      <div className="text-[11px] text-muted-foreground">{r.roomType}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.checkIn}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.checkOut}</td>
                    <td className="px-4 py-3 tabular text-muted-foreground">{r.nights}</td>
                    <td className="px-4 py-3 tabular text-muted-foreground">{r.adults}A {r.children}C</td>
                    <td className="px-4 py-3 text-right tabular font-medium">{inr(r.amount)}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge></td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground">{r.channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <ReservationDrawer
          reservation={selected}
          canModify={!!byConf[selected.id]}
          onModify={() => { const raw = byConf[selected.id]; if (raw) { setSelected(null); setEditing(raw); } }}
          onClose={() => setSelected(null)}
        />
      )}
      {showNew && (
        <ReservationWizard
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); refetchAll(); }}
        />
      )}
      {editing && (
        <ReservationEditModal
          reservation={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refetchAll(); }}
        />
      )}
    </>
  );
}

function ReservationDrawer({ reservation: r, onClose, onModify, canModify }: { reservation: Reservation; onClose: () => void; onModify: () => void; canModify: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="relative h-full w-full max-w-[420px] overflow-y-auto border-l border-border bg-surface shadow-elevated animate-slide-in-right"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-3 backdrop-blur">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Reservation</div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-elevated hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-muted text-[16px] font-bold text-primary">
              {r.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[20px] font-semibold leading-tight">{r.guest}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {r.loyalty && <Badge tone="warning">★ {r.loyalty} Member</Badge>}
                <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-md gradient-primary py-2 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110">
              Check In
            </button>
            <button
              onClick={onModify}
              disabled={!canModify}
              title={canModify ? "" : "Modify is available on live reservations"}
              className="rounded-md border border-border bg-elevated py-2 text-[12px] font-semibold hover:border-border-strong disabled:opacity-40"
            >
              Modify
            </button>
          </div>

          <Section title="Stay Details">
            <Row label="Confirmation #" value={<span className="font-mono text-primary">{r.id}</span>} />
            <Row label="Room" value={`${r.room} · ${r.roomType}`} />
            <Row label="Check-in" value={r.checkIn} />
            <Row label="Check-out" value={r.checkOut} />
            <Row label="Nights" value={String(r.nights)} />
            <Row label="Guests" value={`${r.adults} adults · ${r.children} children`} />
          </Section>

          <Section title="Financial">
            <Row label="Rate Plan" value={r.rate} />
            <Row label="Nightly rate" value={inr(Math.round(r.amount / r.nights))} />
            <Row label="Taxes & fees" value={inr(Math.round(r.amount * 0.18))} />
            <Row label="Total" value={<span className="font-semibold text-foreground">{inr(r.amount)}</span>} />
            <Row label="Balance due" value={<span className="text-warning">{inr(Math.round(r.amount * 0.3))}</span>} />
          </Section>

          <Section title="Contact">
            <Row label={<Mail className="h-3.5 w-3.5" />} value={`${r.guest.toLowerCase().replace(" ", ".")}@email.com`} />
            <Row label={<Phone className="h-3.5 w-3.5" />} value="+91 98765 ••••3" />
            <Row label={<CreditCard className="h-3.5 w-3.5" />} value="VISA ••••4282" />
          </Section>

          <Section title="Notes">
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              Guest prefers high floor with city view. Late check-out requested. Welcome amenity (fruit basket) approved by F&B.
            </p>
          </Section>

          <Section title="Timeline">
            {[
              { t: "Booking created via " + r.channel, time: "3 days ago" },
              { t: "Payment authorized · " + inr(Math.round(r.amount * 0.7)), time: "3 days ago" },
              { t: "Pre-stay email sent", time: "1 day ago" },
              { t: "Room pre-assigned by AI", time: "4 hours ago" },
            ].map((e, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="text-[12px] text-foreground">{e.t}</div>
                  <div className="text-[11px] text-tertiary">{e.time}</div>
                </div>
              </div>
            ))}
          </Section>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
        {title} <ChevronRight className="h-3 w-3" />
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-[12px]">
      <span className="flex items-center gap-1.5 text-muted-foreground">{label}</span>
      <span className="text-right text-foreground tabular">{value}</span>
    </div>
  );
}
