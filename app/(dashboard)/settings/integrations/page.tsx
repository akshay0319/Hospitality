"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Brain, Globe, Mail, HardDrive, CheckCircle2, XCircle, Plug } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { useAuthStore } from "@/store/auth";
import { aiService } from "@/lib/services/ai.service";
import { bookingService } from "@/lib/services/booking.service";
import { channelsService } from "@/lib/services/channels.service";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const propertyId = useAuthStore((s) => s.user?.propertyId) ?? "";
  const ai = useQuery({ queryKey: ["int-ai"], queryFn: () => aiService.status(), retry: false });
  const pay = useQuery({ queryKey: ["int-pay", propertyId], queryFn: () => bookingService.getProperty(propertyId), enabled: !!propertyId, retry: false });
  const ch = useQuery({ queryKey: ["int-ch"], queryFn: () => channelsService.list(), retry: false });

  const rows = [
    { icon: CreditCard, name: "Razorpay", desc: "Payment gateway for the booking engine", on: !!pay.data?.paymentLive, detail: pay.data?.paymentLive ? "Live (test mode)" : "Mock gateway — add keys to go live" },
    { icon: Brain, name: "OpenAI", desc: "Powers Copilot, Voice and CRM campaigns", on: !!ai.data?.live, detail: ai.data?.live ? "Connected (gpt-4o-mini)" : "Not configured — Copilot runs in demo mode" },
    { icon: Globe, name: "Channel Manager", desc: "OTA distribution (Booking.com, Expedia…)", on: (ch.data?.summary.connected ?? 0) > 0, detail: ch.data ? `${ch.data.summary.connected}/${ch.data.summary.total} channels connected` : "—" },
    { icon: Mail, name: "Email (SMTP)", desc: "Confirmation & campaign delivery", on: false, detail: "Not configured — add SMTP credentials" },
    { icon: HardDrive, name: "AWS S3", desc: "Document & ID uploads", on: false, detail: "Not configured — optional" },
  ];

  return (
    <>
      <AppHeader title="Integrations" breadcrumb="Settings" />
      <div className="flex-1 space-y-3 p-6">
        <p className="text-[13px] text-muted-foreground">External services connected to this property. Green = active.</p>
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", r.on ? "bg-success-muted/50 text-success" : "bg-elevated text-muted-foreground")}>
              <r.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-foreground">{r.name}</span>
                <span className={cn("flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold", r.on ? "border-success/40 bg-success/10 text-success" : "border-border text-muted-foreground")}>
                  {r.on ? <><CheckCircle2 className="h-3 w-3" /> Active</> : <><XCircle className="h-3 w-3" /> Inactive</>}
                </span>
              </div>
              <div className="text-[12px] text-muted-foreground">{r.desc}</div>
              <div className="mt-0.5 text-[11px] text-tertiary">{r.detail}</div>
            </div>
            <Plug className="h-4 w-4 text-tertiary" />
          </div>
        ))}
      </div>
    </>
  );
}
