"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Save, Building2 } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { propertiesService, type Property } from "@/lib/services/properties.service";
import { useAuthStore } from "@/store/auth";

const FIELDS = ["name", "brand", "address", "city", "state", "phone", "email", "gstNumber"] as const;
const LABELS: Record<string, string> = {
  name: "Property name", brand: "Brand", address: "Address", city: "City",
  state: "State", phone: "Phone", email: "Email", gstNumber: "GST number",
};

export default function PropertySetupPage() {
  const propertyId = useAuthStore((s) => s.user?.propertyId);
  const [form, setForm] = useState<Record<string, string | number>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => propertiesService.get(propertyId!),
    enabled: !!propertyId,
    retry: false,
  });

  useEffect(() => {
    if (data) setForm({
      name: data.name ?? "", brand: data.brand ?? "", address: data.address ?? "",
      city: data.city ?? "", state: data.state ?? "", phone: data.phone ?? "",
      email: data.email ?? "", gstNumber: data.gstNumber ?? "", starRating: data.starRating ?? 3,
      currency: data.currency ?? "INR", timezone: data.timezone ?? "Asia/Kolkata",
      checkInTime: data.checkInTime ?? "14:00", checkOutTime: data.checkOutTime ?? "12:00",
    });
  }, [data]);

  const save = useMutation({
    mutationFn: () => propertiesService.update(propertyId!, {
      ...form, starRating: Number(form.starRating),
    } as Partial<Property>),
    onSuccess: () => toast.success("Property updated"),
    onError: (e: unknown) => {
      const m = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error((Array.isArray(m) ? m[0] : m) ?? "Failed to save");
    },
  });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <AppHeader title="Property Setup" breadcrumb="Settings" />
      <div className="flex-1 p-6">
        {isLoading || !data ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-glow-primary"><Building2 className="h-5 w-5 text-primary-foreground" /></div>
              <div>
                <div className="text-[14px] font-semibold text-foreground">{data.name}</div>
                <div className="text-[11px] text-muted-foreground">{data.totalRooms} rooms · {data.city}</div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {FIELDS.map((k) => (
                  <label key={k} className={k === "address" ? "sm:col-span-2 block" : "block"}>
                    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">{LABELS[k]}</span>
                    <input className="pinp" value={String(form[k] ?? "")} onChange={(e) => set(k, e.target.value)} />
                  </label>
                ))}
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Star rating</span>
                  <select className="pinp" value={form.starRating ?? 3} onChange={(e) => set("starRating", Number(e.target.value))}>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Currency</span>
                  <select className="pinp" value={String(form.currency ?? "INR")} onChange={(e) => set("currency", e.target.value)}>
                    {["INR", "USD", "EUR", "GBP", "AED", "SGD"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Check-in time</span>
                  <input type="time" className="pinp" value={String(form.checkInTime ?? "14:00")} onChange={(e) => set("checkInTime", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Check-out time</span>
                  <input type="time" className="pinp" value={String(form.checkOutTime ?? "12:00")} onChange={(e) => set("checkOutTime", e.target.value)} />
                </label>
              </div>

              <div className="mt-5 flex justify-end">
                <button onClick={() => save.mutate()} disabled={save.isPending}
                  className="flex h-10 items-center gap-1.5 rounded-md gradient-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-60">
                  {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`.pinp{width:100%;height:40px;padding:0 12px;background:var(--background);border:1px solid var(--input);border-radius:8px;color:var(--foreground);font-size:13px}.pinp:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px oklch(0.62 0.18 265 / 0.15)}select.pinp{appearance:none;cursor:pointer}`}</style>
    </>
  );
}
