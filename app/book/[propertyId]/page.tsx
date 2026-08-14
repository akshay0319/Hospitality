"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Building2, Star, CalendarDays, Users, BedDouble, Loader2, Check, CreditCard, ArrowLeft, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { bookingService, type BookingAvail, type BookInput, type PaymentOrder } from "@/lib/services/booking.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const ADDONS = [
  { name: "Breakfast (per stay)", price: 800 },
  { name: "Airport pickup", price: 1500 },
  { name: "Spa package", price: 2500 },
  { name: "Late checkout", price: 1200 },
];

interface RazorpayResult { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
type RazorpayInstance = { open: () => void };
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayInstance;

function loadRazorpay(): Promise<RazorpayCtor> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { Razorpay?: RazorpayCtor };
    if (w.Razorpay) return resolve(w.Razorpay);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve((window as unknown as { Razorpay: RazorpayCtor }).Razorpay);
    s.onerror = () => reject(new Error("Razorpay failed to load"));
    document.body.appendChild(s);
  });
}

function openRazorpay(order: PaymentOrder, prefill: { name: string; email: string; phone?: string }): Promise<RazorpayResult> {
  return new Promise(async (resolve, reject) => {
    try {
      const Razorpay = await loadRazorpay();
      const rzp = new Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency, order_id: order.orderId,
        name: prefill.name, description: "Room reservation",
        prefill: { email: prefill.email, contact: prefill.phone },
        theme: { color: "#6366f1" },
        handler: (resp: RazorpayResult) => resolve(resp),
        modal: { ondismiss: () => reject(new Error("dismissed")) },
      });
      rzp.open();
    } catch (e) { reject(e as Error); }
  });
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function addDays(base: string, n: number) { const d = new Date(base); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

export default function PublicBookingPage() {
  const propertyId = String(useParams().propertyId);
  const [view, setView] = useState<"search" | "rooms" | "done">("search");
  const [checkIn, setCheckIn] = useState(todayStr());
  const [checkOut, setCheckOut] = useState(addDays(todayStr(), 2));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selected, setSelected] = useState<BookingAvail | null>(null);
  const [guest, setGuest] = useState({ firstName: "", lastName: "", email: "", phone: "", specialRequests: "" });
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [paying, setPaying] = useState(false);
  const [confirmation, setConfirmation] = useState<{ confirmationNumber: string; total: number; nights: number } | null>(null);

  const { data: property } = useQuery({
    queryKey: ["be-property", propertyId],
    queryFn: () => bookingService.getProperty(propertyId),
    retry: false,
  });

  const avail = useQuery({
    queryKey: ["be-avail", propertyId, checkIn, checkOut, adults],
    queryFn: () => bookingService.availability(propertyId, checkIn, checkOut, adults),
    enabled: view === "rooms" && checkOut > checkIn,
    retry: false,
  });

  const book = useMutation({
    mutationFn: (dto: BookInput) => bookingService.book(propertyId, dto),
    onSuccess: (res) => { setConfirmation(res); setView("done"); },
  });

  const applyPromo = useMutation({
    mutationFn: () => bookingService.previewPromo(propertyId, { code: promoInput, roomTypeId: selected!.roomType.id, checkIn, checkOut }),
    onSuccess: (r) => {
      if (r.valid && r.discount) { setPromo({ code: r.code!, discount: r.discount, label: r.label! }); toast.success(`Promo applied — ${r.label}`); }
      else { setPromo(null); toast.error("Invalid promo code"); }
    },
  });

  const guestValid = guest.firstName.trim() && guest.lastName.trim() && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guest.email);
  const addonsTotal = ADDONS.filter((a) => addons[a.name]).reduce((s, a) => s + a.price, 0);

  async function handlePay() {
    if (!selected) return;
    const chosen = ADDONS.filter((a) => addons[a.name]).map((a) => ({ name: a.name, price: a.price, quantity: 1 }));
    const base: BookInput = {
      roomTypeId: selected.roomType.id, checkIn, checkOut, adults, children,
      firstName: guest.firstName.trim(), lastName: guest.lastName.trim(), email: guest.email.trim(),
      phone: guest.phone || undefined, specialRequests: guest.specialRequests || undefined,
      addons: chosen, promoCode: promo?.code,
    };
    setPaying(true);
    try {
      const order = await bookingService.createOrder(propertyId, { roomTypeId: base.roomTypeId, checkIn, checkOut, addons: chosen, promoCode: promo?.code });
      if (order.mock) { book.mutate({ ...base, paymentToken: "DEMO" }); return; }
      const r = await openRazorpay(order, { name: property?.name ?? "Hotel booking", email: base.email, phone: base.phone });
      book.mutate({ ...base, razorpayOrderId: r.razorpay_order_id, razorpayPaymentId: r.razorpay_payment_id, razorpaySignature: r.razorpay_signature });
    } catch {
      toast.error("Payment cancelled");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Brand bar */}
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow-primary"><Building2 className="h-5 w-5 text-primary-foreground" /></div>
          <div>
            <div className="font-display text-[16px] font-semibold">{property?.name ?? "Loading…"}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {property && <>{Array.from({ length: property.starRating }).map((_, i) => <Star key={i} className="h-2.5 w-2.5 fill-warning text-warning" />)}<span className="ml-1">{property.city}</span></>}
            </div>
          </div>
          <span className="ml-auto rounded-md border border-[color:var(--ai)]/30 bg-[color:var(--ai-muted)]/30 px-2 py-1 text-[11px] font-semibold text-[color:var(--ai-hover)]">Direct booking · best rate</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* SEARCH */}
        {view === "search" && (
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h1 className="font-display text-[22px] font-bold">Book your stay</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">Check live availability and reserve in under a minute.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Check-in" icon={<CalendarDays className="h-3.5 w-3.5" />}>
                <input type="date" min={todayStr()} value={checkIn} className="binp" onChange={(e) => { setCheckIn(e.target.value); if (checkOut <= e.target.value) setCheckOut(addDays(e.target.value, 1)); }} />
              </Field>
              <Field label="Check-out" icon={<CalendarDays className="h-3.5 w-3.5" />}>
                <input type="date" min={addDays(checkIn, 1)} value={checkOut} className="binp" onChange={(e) => setCheckOut(e.target.value)} />
              </Field>
              <Field label="Adults" icon={<Users className="h-3.5 w-3.5" />}>
                <input type="number" min={1} value={adults} className="binp" onChange={(e) => setAdults(Math.max(1, +e.target.value))} />
              </Field>
              <Field label="Children" icon={<Users className="h-3.5 w-3.5" />}>
                <input type="number" min={0} value={children} className="binp" onChange={(e) => setChildren(Math.max(0, +e.target.value))} />
              </Field>
            </div>
            <button onClick={() => setView("rooms")} disabled={checkOut <= checkIn}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg gradient-primary text-[14px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50">
              Search availability
            </button>
            <p className="mt-4 text-center text-[12px] text-muted-foreground">
              Already booked? <Link href={`/book/${propertyId}/manage`} className="font-semibold text-primary hover:underline">Manage your booking</Link>
            </p>
          </div>
        )}

        {/* ROOMS + CHECKOUT */}
        {view === "rooms" && (
          <div className="space-y-4">
            <button onClick={() => { setView("search"); setSelected(null); }} className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Change dates</button>
            <div className="text-[13px] text-muted-foreground">{checkIn} → {checkOut} · {adults} adult{adults > 1 ? "s" : ""}{children ? `, ${children} children` : ""}</div>

            {avail.isLoading && <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}

            <div className="grid gap-3">
              {(avail.data ?? []).map((a) => {
                const soldOut = a.available <= 0;
                const sel = selected?.roomType.id === a.roomType.id;
                return (
                  <button key={a.roomType.id} disabled={soldOut} onClick={() => { setSelected(a); setPromo(null); }}
                    className={cn("flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition",
                      sel ? "border-primary bg-primary-muted/25" : "border-border bg-surface hover:border-border-strong",
                      soldOut && "cursor-not-allowed opacity-50")}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted/60 text-primary"><BedDouble className="h-5 w-5" /></div>
                      <div>
                        <div className="text-[15px] font-semibold text-foreground">{a.roomType.name}</div>
                        <div className="text-[11px] text-tertiary">Sleeps {a.roomType.maxOccupancy} · {soldOut ? "Sold out" : `${a.available} left`}</div>
                        {a.roomType.amenities?.length ? <div className="mt-1 text-[11px] text-muted-foreground">{a.roomType.amenities.slice(0, 4).join(" · ")}</div> : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-[18px] font-bold tabular">{inr(a.totalRate)}</div>
                      <div className="text-[10px] text-tertiary">{inr(a.ratePerNight)}/night · {a.nights}N</div>
                      {sel && <Check className="ml-auto mt-1 h-4 w-4 text-primary" />}
                    </div>
                  </button>
                );
              })}
              {!avail.isLoading && (avail.data ?? []).length === 0 && <div className="rounded-xl border border-border bg-surface p-8 text-center text-[13px] text-muted-foreground">No rooms available for these dates.</div>}
            </div>

            {/* Guest + payment */}
            {selected && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="text-[14px] font-semibold">Guest details</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input className="binp" placeholder="First name" value={guest.firstName} onChange={(e) => setGuest({ ...guest, firstName: e.target.value })} />
                  <input className="binp" placeholder="Last name" value={guest.lastName} onChange={(e) => setGuest({ ...guest, lastName: e.target.value })} />
                  <input className="binp" type="email" placeholder="Email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
                  <input className="binp" placeholder="Phone (optional)" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
                  <input className="binp sm:col-span-2" placeholder="Special requests (optional)" value={guest.specialRequests} onChange={(e) => setGuest({ ...guest, specialRequests: e.target.value })} />
                </div>

                <h3 className="mt-5 text-[14px] font-semibold">Enhance your stay</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ADDONS.map((a) => (
                    <label key={a.name} className={cn("flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-[13px] transition", addons[a.name] ? "border-primary bg-primary-muted/25" : "border-border bg-background/40 hover:border-border-strong")}>
                      <span className="flex items-center gap-2">
                        <input type="checkbox" checked={!!addons[a.name]} onChange={(e) => setAddons({ ...addons, [a.name]: e.target.checked })} className="accent-[color:var(--primary)]" />
                        {a.name}
                      </span>
                      <span className="tabular text-muted-foreground">+{inr(a.price)}</span>
                    </label>
                  ))}
                </div>

                <h3 className="mt-5 text-[14px] font-semibold">Promo code</h3>
                {promo ? (
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-success/40 bg-success/5 px-3 py-2.5 text-[13px]">
                    <span className="text-success"><span className="font-semibold">{promo.code}</span> — {promo.label} (−{inr(promo.discount)})</span>
                    <button onClick={() => { setPromo(null); setPromoInput(""); }} className="text-[11px] text-muted-foreground hover:text-foreground">Remove</button>
                  </div>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <input className="binp flex-1" placeholder="e.g. WELCOME10" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} />
                    <button onClick={() => applyPromo.mutate()} disabled={!promoInput.trim() || applyPromo.isPending}
                      className="flex h-10 items-center gap-1.5 rounded-md border border-primary/40 px-4 text-[12px] font-semibold text-primary hover:bg-primary-muted/30 disabled:opacity-50">
                      {applyPromo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                )}

                <h3 className="mt-5 flex items-center gap-1.5 text-[14px] font-semibold"><CreditCard className="h-4 w-4 text-tertiary" /> Payment</h3>
                {property?.paymentLive ? (
                  <p className="text-[11px] text-tertiary">🔒 Secure payment via Razorpay — a checkout window opens when you confirm.</p>
                ) : (
                  <>
                    <p className="text-[11px] text-tertiary">Demo gateway — no real charge. Enter any test card.</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <input className="binp sm:col-span-2" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
                      <input className="binp" placeholder="MM/YY" defaultValue="12/29" />
                      <input className="binp" placeholder="CVV" defaultValue="123" />
                    </div>
                  </>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-tertiary">Total (incl. 18% GST{addonsTotal > 0 ? " + add-ons" : ""}{promo ? " − promo" : ""})</div>
                    <div className="font-display text-[22px] font-bold tabular text-foreground">{inr(Math.max(0, selected.totalRate * 1.18 + addonsTotal - (promo?.discount ?? 0)))}</div>
                  </div>
                  <button
                    onClick={handlePay}
                    disabled={!guestValid || book.isPending || paying}
                    className="flex h-11 items-center gap-2 rounded-lg gradient-primary px-6 text-[14px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50">
                    {(book.isPending || paying) ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <>Pay &amp; confirm</>}
                  </button>
                </div>
                {book.isError && <p className="mt-2 text-[12px] text-danger">Booking failed — those dates may have just sold out. Try again.</p>}
              </div>
            )}
          </div>
        )}

        {/* CONFIRMATION */}
        {view === "done" && confirmation && (
          <div className="rounded-2xl border border-success/30 bg-surface p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-muted/60 text-success"><Check className="h-7 w-7" /></div>
            <h1 className="mt-4 font-display text-[24px] font-bold">Booking confirmed!</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">A confirmation has been created for your stay at {property?.name}.</p>
            <div className="mx-auto mt-5 max-w-xs space-y-2 rounded-xl border border-border bg-background/40 p-4 text-left text-[13px]">
              <Row label="Confirmation" value={<span className="font-mono text-primary">{confirmation.confirmationNumber}</span>} />
              <Row label="Dates" value={`${checkIn} → ${checkOut}`} />
              <Row label="Nights" value={String(confirmation.nights)} />
              <Row label="Total paid" value={<span className="font-semibold">{inr(confirmation.total)}</span>} />
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => { setView("search"); setSelected(null); setConfirmation(null); setGuest({ firstName: "", lastName: "", email: "", phone: "", specialRequests: "" }); }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-4 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Book another stay
              </button>
              <Link href={`/book/${propertyId}/manage`} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-4 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground">
                Manage booking
              </Link>
            </div>
          </div>
        )}
      </main>

      <style>{`.binp{width:100%;height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.binp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}`}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-tertiary">{icon} {label}</span>
      {children}
    </label>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-tertiary">{label}</span><span className="text-foreground">{value}</span></div>;
}
