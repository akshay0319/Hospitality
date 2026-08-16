"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save, CalendarX } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { reservationsService, type CancellationPolicy } from "@/lib/services/reservations.service";

const PENALTY_OPTIONS: { value: CancellationPolicy["penaltyType"]; label: string; hint: string }[] = [
  { value: "NONE", label: "No penalty", hint: "Always fully refundable" },
  { value: "FIRST_NIGHT", label: "First night", hint: "Charge one night's rate" },
  { value: "PERCENT", label: "Percentage", hint: "Charge a % of the total" },
  { value: "FULL", label: "Non-refundable", hint: "Charge the full amount" },
];

export default function CancellationPolicyPage() {
  const { data, isLoading } = useQuery({ queryKey: ["cxl-policy"], queryFn: () => reservationsService.getCancellationPolicy(), retry: false });
  const [form, setForm] = useState<CancellationPolicy>({ name: "Standard", freeCancellationHours: 48, penaltyType: "FIRST_NIGHT", penaltyValue: 0 });

  useEffect(() => { if (data) setForm({ name: data.name, freeCancellationHours: data.freeCancellationHours, penaltyType: data.penaltyType, penaltyValue: Number(data.penaltyValue) }); }, [data]);

  const save = useMutation({
    mutationFn: () => reservationsService.updateCancellationPolicy(form),
    onSuccess: () => toast.success("Cancellation policy saved"),
    onError: () => toast.error("Could not save policy"),
  });

  return (
    <>
      <AppHeader title="Cancellation Policy" breadcrumb="Settings" />
      <div className="flex-1 p-6">
        <Link href="/settings" className="mb-4 inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Settings</Link>

        <div className="max-w-xl rounded-xl border border-border bg-surface p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted/60 text-primary"><CalendarX className="h-5 w-5" /></div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">Cancellation policy</h3>
              <p className="text-[12px] text-muted-foreground">Applied to every cancellation — direct, OTA, and guest self-service.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Policy name</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="sinp" />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Free cancellation window (hours before check-in)</span>
                <input type="number" min={0} value={form.freeCancellationHours} onChange={(e) => setForm({ ...form, freeCancellationHours: Math.max(0, +e.target.value) })} className="sinp" />
                <span className="mt-1 block text-[11px] text-muted-foreground">Cancel earlier than this and the guest is fully refunded.</span>
              </label>

              <div>
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Penalty inside the window</span>
                <div className="grid grid-cols-2 gap-2">
                  {PENALTY_OPTIONS.map((o) => (
                    <button key={o.value} onClick={() => setForm({ ...form, penaltyType: o.value })}
                      className={`rounded-lg border p-3 text-left transition ${form.penaltyType === o.value ? "border-primary bg-primary-muted/25" : "border-border bg-background/40 hover:border-border-strong"}`}>
                      <div className="text-[13px] font-semibold text-foreground">{o.label}</div>
                      <div className="text-[11px] text-muted-foreground">{o.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.penaltyType === "PERCENT" && (
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Penalty percentage</span>
                  <input type="number" min={0} max={100} value={form.penaltyValue} onChange={(e) => setForm({ ...form, penaltyValue: Math.min(100, Math.max(0, +e.target.value)) })} className="sinp" />
                </label>
              )}

              <button onClick={() => save.mutate()} disabled={save.isPending}
                className="flex h-11 items-center gap-2 rounded-lg gradient-primary px-5 text-[14px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-50">
                {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save policy
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`.sinp{width:100%;height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.sinp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}`}</style>
    </>
  );
}
