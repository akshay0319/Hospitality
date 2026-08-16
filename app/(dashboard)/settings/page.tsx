"use client";

import Link from "next/link";
import { Building2, Shield, Plug, CreditCard, ChevronRight, CalendarX } from "lucide-react";
import { AppHeader } from "@/components/layout/header";

const SETTINGS = [
  { href: "/settings/users", icon: Shield, title: "Users & Roles", desc: "Invite staff, assign roles, manage access", live: true, accent: "text-[color:var(--ai-hover)] bg-[color:var(--ai-muted)]/50" },
  { href: "/settings/property", icon: Building2, title: "Property Setup", desc: "Property details, check-in/out times, currency", live: true, accent: "text-primary bg-primary-muted/50" },
  { href: "/settings/cancellation", icon: CalendarX, title: "Cancellation Policy", desc: "Free-cancellation window and penalty rules for refunds", live: true, accent: "text-warning bg-warning-muted/50" },
  { href: "/settings", icon: Plug, title: "Integrations", desc: "OTAs, payment gateways, and channel connections", live: false, accent: "text-info bg-info-muted/50" },
  { href: "/settings", icon: CreditCard, title: "Billing", desc: "Subscription plan, invoices, and payment method", live: false, accent: "text-success bg-success-muted/50" },
];

export default function SettingsPage() {
  return (
    <>
      <AppHeader title="Settings" breadcrumb="Settings" />
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SETTINGS.map((s) => {
            const Card = (
              <div className={`group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 transition ${s.live ? "cursor-pointer hover:border-border-strong hover:shadow-card-hover" : "opacity-70"}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.accent}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-foreground">{s.title}</h3>
                    {!s.live && <span className="rounded bg-elevated px-1.5 py-0.5 text-[10px] font-semibold text-tertiary">Soon</span>}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
                {s.live && <ChevronRight className="h-4 w-4 shrink-0 text-tertiary transition group-hover:text-foreground" />}
              </div>
            );
            return s.live ? <Link key={s.title} href={s.href}>{Card}</Link> : <div key={s.title}>{Card}</div>;
          })}
        </div>
      </div>
    </>
  );
}
