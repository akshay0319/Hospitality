"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  X, ArrowRight, ArrowLeft, Check, Loader2, CalendarDays, BedDouble, User, ClipboardCheck,
  Search, UserPlus, Users,
} from "lucide-react";
import { toast } from "sonner";
import { reservationsService } from "@/lib/services/reservations.service";
import { guestsService } from "@/lib/services/guests.service";
import { revenueService } from "@/lib/services/revenue.service";
import { inr } from "@/lib/format";
import { initials } from "@/lib/mappers";
import { cn } from "@/lib/utils";

interface AvailItem {
  roomType: { id: string; name: string; code: string; maxOccupancy: number; baseRate: string | number; amenities?: string[] | null };
  available: number;
  nights: number;
  ratePerNight: number;
  totalRate: number;
}
interface RatePlan { id: string; name: string; code: string }
interface GuestLite { id: string; firstName: string; lastName: string; email?: string | null; loyaltyTier?: string }

const STEPS = [
  { n: 1, label: "Dates", icon: CalendarDays },
  { n: 2, label: "Room", icon: BedDouble },
  { n: 3, label: "Guest", icon: User },
  { n: 4, label: "Confirm", icon: ClipboardCheck },
];
const CHANNELS = ["DIRECT", "PHONE", "WALK_IN", "BOOKING_COM", "AIRBNB", "EXPEDIA", "MAKEMYTRIP", "AGODA", "GOIBIBO", "OTHER"];

function addDays(base: string, days: number) {
  const d = new Date(base); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function todayStr() { return new Date().toISOString().slice(0, 10); }

export function ReservationWizard({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState(todayStr());
  const [checkOut, setCheckOut] = useState(addDays(todayStr(), 2));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [roomTypeId, setRoomTypeId] = useState<string>("");
  const [ratePlanId, setRatePlanId] = useState<string>("");

  const [guestMode, setGuestMode] = useState<"existing" | "new">("existing");
  const [guestSearch, setGuestSearch] = useState("");
  const [guestId, setGuestId] = useState<string>("");
  const [newGuest, setNewGuest] = useState({ firstName: "", lastName: "", email: "", phone: "" });

  const [channel, setChannel] = useState("DIRECT");
  const [specialRequests, setSpecialRequests] = useState("");

  const datesValid = checkIn && checkOut && checkOut > checkIn;

  const { data: avail, isFetching: availLoading } = useQuery({
    queryKey: ["wiz-avail", checkIn, checkOut, adults, children],
    queryFn: () => reservationsService.checkAvailability({ checkIn, checkOut, roomTypeId: undefined }) as Promise<AvailItem[]>,
    enabled: step >= 2 && !!datesValid,
    retry: false,
  });
  const { data: ratePlans } = useQuery({
    queryKey: ["wiz-rateplans"],
    queryFn: () => revenueService.findRatePlans() as Promise<RatePlan[]>,
    retry: false,
  });
  const { data: guestResults } = useQuery({
    queryKey: ["wiz-guests", guestSearch],
    queryFn: () => guestsService.findAll({ limit: 8, search: guestSearch || undefined }).then((r) => (r.data as GuestLite[]) ?? []),
    enabled: step === 3 && guestMode === "existing",
    retry: false,
  });

  const selectedRT = (avail ?? []).find((a) => a.roomType.id === roomTypeId);
  const nights = selectedRT?.nights ?? Math.max(1, Math.round((+new Date(checkOut) - +new Date(checkIn)) / 86400000));
  const subTotal = selectedRT ? selectedRT.ratePerNight * nights : 0;
  const tax = Math.round(subTotal * 0.18);
  const total = subTotal + tax;

  // default rate plan to first (BAR)
  useEffect(() => {
    if (ratePlans && ratePlans.length && !ratePlanId) setRatePlanId(ratePlans[0].id);
  }, [ratePlans, ratePlanId]);

  const submit = useMutation({
    mutationFn: async () => {
      let gid = guestId;
      if (guestMode === "new") {
        const g = (await guestsService.create({
          firstName: newGuest.firstName.trim(),
          lastName: newGuest.lastName.trim(),
          email: newGuest.email || undefined,
          phone: newGuest.phone || undefined,
        })) as { id: string };
        gid = g.id;
      }
      return reservationsService.create({
        guestId: gid,
        roomTypeId,
        ratePlanId,
        checkIn,
        checkOut,
        adults,
        children,
        channel,
        specialRequests: specialRequests || undefined,
      });
    },
    onSuccess: (res: unknown) => {
      const cn = (res as { confirmationNumber?: string })?.confirmationNumber;
      toast.success(cn ? `Reservation ${cn} created` : "Reservation created");
      onCreated();
    },
    onError: (e: unknown) => {
      const m = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(m) ? m[0] : m) ?? "Failed to create reservation");
    },
  });

  const canNext =
    step === 1 ? !!datesValid && adults >= 1 :
    step === 2 ? !!roomTypeId && !!ratePlanId :
    step === 3 ? (guestMode === "existing" ? !!guestId : newGuest.firstName.trim() && newGuest.lastName.trim()) :
    true;

  const selectedGuest = guestMode === "new"
    ? `${newGuest.firstName} ${newGuest.lastName}`.trim()
    : (guestResults?.find((g) => g.id === guestId) ? `${guestResults.find((g) => g.id === guestId)!.firstName} ${guestResults.find((g) => g.id === guestId)!.lastName}` : "—");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated animate-fade-in">
        {/* Header + stepper */}
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-display text-[16px] font-semibold">New Reservation</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"><X className="h-4 w-4" /></button>
        </header>
        <div className="flex items-center gap-1 border-b border-border px-5 py-3">
          {STEPS.map((s, i) => {
            const done = step > s.n, active = step === s.n;
            return (
              <div key={s.n} className="flex flex-1 items-center last:flex-none">
                <div className="flex items-center gap-2">
                  <div className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-semibold",
                    done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary bg-primary-muted/50 text-primary" : "border-border bg-background text-tertiary")}>
                    {done ? <Check className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                  </div>
                  <span className={cn("text-[11px] font-medium", active ? "text-foreground" : "text-tertiary")}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={cn("mx-2 h-px flex-1", step > s.n ? "bg-primary" : "bg-border")} />}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* STEP 1 — dates */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <L label="Check-in"><input type="date" className="winp" value={checkIn} min={todayStr()} onChange={(e) => { setCheckIn(e.target.value); if (checkOut <= e.target.value) setCheckOut(addDays(e.target.value, 1)); }} /></L>
                <L label="Check-out"><input type="date" className="winp" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} /></L>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <L label="Adults"><input type="number" min={1} className="winp" value={adults} onChange={(e) => setAdults(Math.max(1, +e.target.value))} /></L>
                <L label="Children"><input type="number" min={0} className="winp" value={children} onChange={(e) => setChildren(Math.max(0, +e.target.value))} /></L>
              </div>
              <div className="rounded-lg border border-border bg-background/40 p-3 text-[12px] text-muted-foreground">
                {datesValid ? <>Stay length: <span className="font-semibold text-foreground">{nights} night{nights > 1 ? "s" : ""}</span></> : <span className="text-danger">Check-out must be after check-in.</span>}
              </div>
            </div>
          )}

          {/* STEP 2 — room type + rate plan */}
          {step === 2 && (
            <div className="space-y-4">
              {availLoading && <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
              {!availLoading && (avail ?? []).map((a) => {
                const soldOut = a.available <= 0;
                const sel = roomTypeId === a.roomType.id;
                return (
                  <button key={a.roomType.id} disabled={soldOut} onClick={() => setRoomTypeId(a.roomType.id)}
                    className={cn("flex w-full items-center justify-between rounded-lg border p-3 text-left transition",
                      sel ? "border-primary bg-primary-muted/30" : "border-border bg-background/40 hover:border-border-strong",
                      soldOut && "cursor-not-allowed opacity-50")}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-foreground">{a.roomType.name}</span>
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", soldOut ? "bg-danger-muted/60 text-danger" : "bg-success-muted/60 text-success")}>
                          {soldOut ? "Sold out" : `${a.available} available`}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-tertiary">Max {a.roomType.maxOccupancy} guests · {inr(a.ratePerNight)}/night</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-[16px] font-bold tabular text-foreground">{inr(a.totalRate)}</div>
                      <div className="text-[10px] text-tertiary">{a.nights}N total</div>
                    </div>
                  </button>
                );
              })}
              {!availLoading && (avail ?? []).length === 0 && <div className="py-8 text-center text-[13px] text-muted-foreground">No room types available for these dates.</div>}

              <L label="Rate plan">
                <select className="winp" value={ratePlanId} onChange={(e) => setRatePlanId(e.target.value)}>
                  {(ratePlans ?? []).map((rp) => <option key={rp.id} value={rp.id}>{rp.name} ({rp.code})</option>)}
                </select>
              </L>
            </div>
          )}

          {/* STEP 3 — guest */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background/40 p-1">
                <button onClick={() => setGuestMode("existing")} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium", guestMode === "existing" ? "bg-primary-muted/60 text-foreground" : "text-muted-foreground")}><Users className="h-3.5 w-3.5" /> Existing guest</button>
                <button onClick={() => setGuestMode("new")} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium", guestMode === "new" ? "bg-primary-muted/60 text-foreground" : "text-muted-foreground")}><UserPlus className="h-3.5 w-3.5" /> New guest</button>
              </div>

              {guestMode === "existing" ? (
                <>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                    <Search className="h-3.5 w-3.5 text-tertiary" />
                    <input value={guestSearch} onChange={(e) => setGuestSearch(e.target.value)} placeholder="Search guests…" className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-tertiary focus:outline-none" />
                  </div>
                  <div className="max-h-56 space-y-1.5 overflow-y-auto">
                    {(guestResults ?? []).map((g) => (
                      <button key={g.id} onClick={() => setGuestId(g.id)}
                        className={cn("flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition", guestId === g.id ? "border-primary bg-primary-muted/30" : "border-border bg-background/40 hover:border-border-strong")}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-muted text-[11px] font-bold text-primary">{initials(g.firstName, g.lastName)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-foreground">{g.firstName} {g.lastName}</div>
                          <div className="truncate text-[11px] text-tertiary">{g.email ?? "No email"}</div>
                        </div>
                        {guestId === g.id && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                    {(guestResults ?? []).length === 0 && <div className="py-6 text-center text-[12px] text-muted-foreground">No guests found — try New guest.</div>}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <L label="First name"><input className="winp" value={newGuest.firstName} onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })} placeholder="Arjun" /></L>
                    <L label="Last name"><input className="winp" value={newGuest.lastName} onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })} placeholder="Malhotra" /></L>
                  </div>
                  <L label="Email"><input className="winp" type="email" value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} placeholder="Optional" /></L>
                  <L label="Phone"><input className="winp" value={newGuest.phone} onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })} placeholder="Optional" /></L>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-background/40 p-4">
                <div className="grid grid-cols-2 gap-y-2 text-[12px]">
                  <Rev label="Guest" value={selectedGuest} />
                  <Rev label="Room type" value={selectedRT?.roomType.name ?? "—"} />
                  <Rev label="Check-in" value={checkIn} />
                  <Rev label="Check-out" value={checkOut} />
                  <Rev label="Nights" value={String(nights)} />
                  <Rev label="Occupancy" value={`${adults}A ${children}C`} />
                  <Rev label="Rate plan" value={(ratePlans ?? []).find((r) => r.id === ratePlanId)?.code ?? "—"} />
                  <Rev label="Channel" value={channel.replace(/_/g, " ")} />
                </div>
              </div>
              <L label="Special requests"><textarea className="winp min-h-[70px] py-2" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Late check-in, high floor, etc. (optional)" /></L>
              <L label="Booking channel">
                <select className="winp" value={channel} onChange={(e) => setChannel(e.target.value)}>
                  {CHANNELS.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </L>
              <div className="rounded-lg border border-primary/30 bg-primary-muted/20 p-4">
                <PriceRow label={`Room × ${nights} night${nights > 1 ? "s" : ""}`} value={inr(subTotal)} />
                <PriceRow label="GST (18%)" value={inr(tax)} />
                <div className="mt-2 flex items-center justify-between border-t border-primary/20 pt-2">
                  <span className="text-[13px] font-semibold text-foreground">Total</span>
                  <span className="font-display text-[18px] font-bold tabular text-foreground">{inr(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border px-5 py-3">
          <button onClick={step === 1 ? onClose : () => setStep((s) => s - 1)}
            className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-background/40 px-3 text-[12px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground">
            {step === 1 ? "Cancel" : <><ArrowLeft className="h-3.5 w-3.5" /> Back</>}
          </button>
          {step < 4 ? (
            <button disabled={!canNext} onClick={() => setStep((s) => s + 1)}
              className="flex h-9 items-center gap-1.5 rounded-md gradient-primary px-4 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50">
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button disabled={submit.isPending} onClick={() => submit.mutate()}
              className="flex h-9 items-center gap-1.5 rounded-md gradient-primary px-4 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-60">
              {submit.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <>Create reservation <Check className="h-3.5 w-3.5" /></>}
            </button>
          )}
        </footer>
        <style>{`.winp{width:100%;min-height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.winp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}textarea.winp{resize:vertical;padding-top:8px}select.winp{appearance:none;cursor:pointer}input[type=date].winp{cursor:pointer}`}</style>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">{label}</span>{children}</label>;
}
function Rev({ label, value }: { label: string; value: string }) {
  return <><span className="text-tertiary">{label}</span><span className="text-right font-medium text-foreground">{value}</span></>;
}
function PriceRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between py-0.5 text-[12px]"><span className="text-muted-foreground">{label}</span><span className="tabular text-foreground">{value}</span></div>;
}
