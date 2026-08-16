"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Building2, Loader2, Search, CalendarDays, BedDouble, XCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { bookingService, type ManagedBooking } from "@/lib/services/booking.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "border-primary/40 bg-primary-muted/25 text-primary",
  CHECKED_IN: "border-success/40 bg-success/10 text-success",
  CHECKED_OUT: "border-border bg-background/40 text-muted-foreground",
  CANCELLED: "border-danger/40 bg-danger/10 text-danger",
  NO_SHOW: "border-warning/40 bg-warning/10 text-warning",
};

export default function ManageBookingPage() {
  const propertyId = String(useParams().propertyId);
  const [conf, setConf] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<ManagedBooking | null>(null);

  const { data: property } = useQuery({
    queryKey: ["be-property", propertyId],
    queryFn: () => bookingService.getProperty(propertyId),
    retry: false,
  });

  const lookup = useMutation({
    mutationFn: () => bookingService.getReservation(propertyId, conf.trim(), email.trim()),
    onSuccess: (b) => setBooking(b),
    onError: () => { setBooking(null); toast.error("Booking not found. Check the confirmation number and email."); },
  });

  const quote = useQuery({
    queryKey: ["cancel-quote", propertyId, booking?.confirmationNumber, booking?.cancellable],
    queryFn: () => bookingService.cancelQuote(propertyId, conf.trim(), email.trim()),
    enabled: !!booking?.cancellable,
    retry: false,
  });

  const cancel = useMutation({
    mutationFn: () => bookingService.cancelReservation(propertyId, conf.trim(), email.trim()),
    onSuccess: (b) => { setBooking(b); toast.success("Booking cancelled."); },
    onError: () => toast.error("Could not cancel — this booking may already be checked in or closed."),
  });

  const canSearch = conf.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow-primary"><Building2 className="h-5 w-5 text-primary-foreground" /></div>
          <div className="font-display text-[16px] font-semibold">{property?.name ?? "Loading…"}</div>
          <Link href={`/book/${propertyId}`} className="ml-auto flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> New booking</Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="font-display text-[22px] font-bold">Manage your booking</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Enter your confirmation number and the email you booked with.</p>

        <form onSubmit={(e) => { e.preventDefault(); if (canSearch) lookup.mutate(); }} className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className="binp" placeholder="Confirmation no. (e.g. HOS-123456)" value={conf} onChange={(e) => setConf(e.target.value.toUpperCase())} />
            <input className="binp" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={!canSearch || lookup.isPending}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg gradient-primary text-[14px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50">
            {lookup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /> Find booking</>}
          </button>
        </form>

        {booking && (
          <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[15px] font-semibold text-primary">{booking.confirmationNumber}</div>
              <span className={cn("rounded-md border px-2.5 py-1 text-[11px] font-semibold", STATUS_STYLE[booking.status] ?? "border-border text-muted-foreground")}>
                {booking.status.replace("_", " ")}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <Info icon={<BedDouble className="h-3.5 w-3.5" />} label="Room" value={`${booking.roomType}${booking.room ? ` · ${booking.room}` : ""}`} />
              <Info icon={<CalendarDays className="h-3.5 w-3.5" />} label="Guest" value={booking.guest} />
              <Info icon={<CalendarDays className="h-3.5 w-3.5" />} label="Check-in" value={booking.checkIn} />
              <Info icon={<CalendarDays className="h-3.5 w-3.5" />} label="Check-out" value={booking.checkOut} />
              <Info icon={<CalendarDays className="h-3.5 w-3.5" />} label="Nights" value={`${booking.nights} · ${booking.adults} adult${booking.adults > 1 ? "s" : ""}${booking.children ? `, ${booking.children} child` : ""}`} />
              <Info icon={<CalendarDays className="h-3.5 w-3.5" />} label="Total paid" value={inr(booking.paid)} />
            </div>

            {booking.extras.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-tertiary">Extras</div>
                {booking.extras.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-[12px] text-muted-foreground">
                    <span>{e.name}{e.quantity > 1 ? ` ×${e.quantity}` : ""}</span>
                    <span className="tabular">{inr(e.price * e.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 border-t border-border pt-4">
              {booking.cancellable ? (
                <div className="space-y-3">
                  {quote.data && (
                    <div className="rounded-lg border border-border bg-background/40 px-3 py-2.5 text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cancellation policy</span>
                        <span className="text-foreground">{quote.data.policy.name}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-muted-foreground">Refund if cancelled now</span>
                        <span className="font-semibold text-success">{inr(quote.data.refund)}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-tertiary">
                        {quote.data.free
                          ? "Within the free cancellation window — full refund."
                          : `A penalty of ${inr(quote.data.fee)} applies (free until ${quote.data.policy.freeCancellationHours}h before check-in).`}
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => { if (confirm(`Cancel this booking?${quote.data ? ` You'll be refunded ${inr(quote.data.refund)}.` : ""} This can't be undone.`)) cancel.mutate(); }}
                    disabled={cancel.isPending}
                    className="flex h-10 items-center gap-2 rounded-lg border border-danger/40 px-4 text-[13px] font-semibold text-danger hover:bg-danger/10 disabled:opacity-50">
                    {cancel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Cancel booking
                  </button>
                </div>
              ) : booking.status === "CANCELLED" ? (
                <p className="flex items-center gap-1.5 text-[13px] text-danger"><XCircle className="h-4 w-4" /> This booking has been cancelled.</p>
              ) : (
                <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" /> This booking is {booking.status.replace("_", " ").toLowerCase()} and can no longer be cancelled online. Please contact the front desk.</p>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`.binp{width:100%;height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.binp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}`}</style>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-tertiary">{icon} {label}</div>
      <div className="mt-0.5 text-foreground">{value}</div>
    </div>
  );
}
