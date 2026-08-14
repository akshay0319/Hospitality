"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { reservationsService } from "@/lib/services/reservations.service";
import { revenueService } from "@/lib/services/revenue.service";
import type { ApiReservation } from "@/lib/mappers";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface AvailItem {
  roomType: { id: string; name: string; maxOccupancy: number };
  available: number; nights: number; ratePerNight: number; totalRate: number;
}
interface RatePlan { id: string; name: string; code: string }

export function ReservationEditModal({ reservation, onClose, onSaved }: {
  reservation: ApiReservation; onClose: () => void; onSaved: () => void;
}) {
  const [checkIn, setCheckIn] = useState(reservation.checkIn.slice(0, 10));
  const [checkOut, setCheckOut] = useState(reservation.checkOut.slice(0, 10));
  const [adults, setAdults] = useState(reservation.adults);
  const [children, setChildren] = useState(reservation.children);
  const [roomTypeId, setRoomTypeId] = useState(reservation.roomTypeId ?? reservation.roomType?.id ?? "");
  const [ratePlanId, setRatePlanId] = useState(reservation.ratePlanId ?? reservation.ratePlan?.id ?? "");
  const [specialRequests, setSpecialRequests] = useState(reservation.specialRequests ?? "");

  const datesValid = checkOut > checkIn;

  const { data: avail } = useQuery({
    queryKey: ["edit-avail", checkIn, checkOut],
    queryFn: () => reservationsService.checkAvailability({ checkIn, checkOut }) as Promise<AvailItem[]>,
    enabled: !!datesValid,
    retry: false,
  });
  const { data: ratePlans } = useQuery({
    queryKey: ["edit-rateplans"],
    queryFn: () => revenueService.findRatePlans() as Promise<RatePlan[]>,
    retry: false,
  });

  useEffect(() => {
    if (ratePlans && ratePlans.length && !ratePlanId) setRatePlanId(ratePlans[0].id);
  }, [ratePlans, ratePlanId]);

  const nights = Math.max(1, Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000));
  const selected = (avail ?? []).find((a) => a.roomType.id === roomTypeId);
  const subTotal = selected ? selected.ratePerNight * nights : 0;
  const tax = Math.round(subTotal * 0.18);
  const total = subTotal + tax;

  const save = useMutation({
    mutationFn: () => reservationsService.update(reservation.id, {
      checkIn, checkOut, adults, children, roomTypeId, ratePlanId,
      specialRequests: specialRequests || undefined,
    }),
    onSuccess: () => { toast.success("Reservation updated"); onSaved(); },
    onError: (e: unknown) => {
      const m = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(m) ? m[0] : m) ?? "Failed to update");
    },
  });

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated animate-fade-in">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h2 className="font-display text-[16px] font-semibold">Modify Reservation</h2>
            <p className="text-[11px] text-tertiary">{reservation.confirmationNumber}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"><X className="h-4 w-4" /></button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <L label="Check-in"><input type="date" className="einp" value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (checkOut <= e.target.value) { const d = new Date(e.target.value); d.setDate(d.getDate() + 1); setCheckOut(d.toISOString().slice(0, 10)); } }} /></L>
            <L label="Check-out"><input type="date" className="einp" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} /></L>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <L label="Adults"><input type="number" min={1} className="einp" value={adults} onChange={(e) => setAdults(Math.max(1, +e.target.value))} /></L>
            <L label="Children"><input type="number" min={0} className="einp" value={children} onChange={(e) => setChildren(Math.max(0, +e.target.value))} /></L>
          </div>
          <L label="Room type">
            <select className="einp" value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}>
              {(avail ?? []).map((a) => (
                <option key={a.roomType.id} value={a.roomType.id} disabled={a.available <= 0 && a.roomType.id !== roomTypeId}>
                  {a.roomType.name} — {inr(a.ratePerNight)}/night {a.available <= 0 ? "(full)" : `(${a.available} left)`}
                </option>
              ))}
            </select>
          </L>
          <L label="Rate plan">
            <select className="einp" value={ratePlanId} onChange={(e) => setRatePlanId(e.target.value)}>
              {(ratePlans ?? []).map((rp) => <option key={rp.id} value={rp.id}>{rp.name} ({rp.code})</option>)}
            </select>
          </L>
          <L label="Special requests"><textarea className="einp min-h-[60px] py-2" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Optional" /></L>

          <div className="rounded-lg border border-primary/30 bg-primary-muted/20 p-3">
            <Row label={`Room × ${nights} night${nights > 1 ? "s" : ""}`} value={inr(subTotal)} />
            <Row label="GST (18%)" value={inr(tax)} />
            <div className="mt-1.5 flex items-center justify-between border-t border-primary/20 pt-1.5">
              <span className="text-[13px] font-semibold text-foreground">New total</span>
              <span className="font-display text-[17px] font-bold tabular text-foreground">{inr(total)}</span>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border px-5 py-3">
          <button onClick={onClose} className="flex h-9 items-center rounded-md border border-border bg-background/40 px-4 text-[12px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground">Cancel</button>
          <button disabled={!datesValid || save.isPending} onClick={() => save.mutate()}
            className={cn("flex h-9 items-center gap-1.5 rounded-md gradient-primary px-4 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50")}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save changes
          </button>
        </footer>
        <style>{`.einp{width:100%;min-height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.einp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}textarea.einp{resize:vertical;padding-top:8px}select.einp{appearance:none;cursor:pointer}`}</style>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">{label}</span>{children}</label>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between py-0.5 text-[12px]"><span className="text-muted-foreground">{label}</span><span className="tabular text-foreground">{value}</span></div>;
}
