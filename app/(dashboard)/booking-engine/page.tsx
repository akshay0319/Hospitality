"use client";

import { useState } from "react";
import { ShoppingBag, ExternalLink, Copy, Check, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { useAuthStore } from "@/store/auth";

export default function BookingEnginePage() {
  const propertyId = useAuthStore((s) => s.user?.propertyId);
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = propertyId ? `${origin}/book/${propertyId}` : "";

  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <>
      <AppHeader title="Booking Engine" breadcrumb="Revenue" />
      <div className="flex-1 space-y-5 p-6">
        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-glow-primary"><ShoppingBag className="h-5 w-5 text-primary-foreground" /></div>
            <div className="flex-1">
              <h3 className="font-display text-[16px] font-semibold">Your direct booking page is live</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">Commission-free bookings straight into your PMS. Share this link on your website, social, or Google Business profile.</p>

              <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-2">
                <span className="flex-1 truncate font-mono text-[12px] text-primary">{url || "…"}</span>
                <button onClick={copy} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                  {copied ? <><Check className="h-3 w-3 text-success" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                </button>
                <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-md gradient-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110">
                  <ExternalLink className="h-3 w-3" /> Preview
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { t: "Live availability", d: "Real-time rooms & rates from your rate grid — no overbooking." },
            { t: "Instant confirmation", d: "Guest + reservation created in the PMS the moment they pay." },
            { t: "18% GST included", d: "Totals shown tax-inclusive; folio settled automatically." },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--ai-muted)]/50 text-[color:var(--ai-hover)]"><Sparkles className="h-4 w-4" /></div>
              <div className="mt-3 text-[13px] font-semibold text-foreground">{f.t}</div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">{f.d}</div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-tertiary">Payments run through a demo gateway — connect Razorpay/Stripe keys to take real cards.</p>
      </div>
    </>
  );
}
