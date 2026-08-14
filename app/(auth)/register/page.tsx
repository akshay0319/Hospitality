"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2, User, MapPin, Eye, EyeOff, ArrowRight, ArrowLeft, Check, Loader2,
  Sparkles, ShieldCheck, Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import type { RegisterPayload } from "@/lib/services/auth.service";

type Form = {
  firstName: string; lastName: string; email: string; password: string; phone: string;
  companyName: string; propertyName: string; propertyType: string; starRating: number; totalRooms: string;
  address: string; city: string; state: string; country: string; currency: string; propertyPhone: string;
};

const EMPTY: Form = {
  firstName: "", lastName: "", email: "", password: "", phone: "",
  companyName: "", propertyName: "", propertyType: "Hotel", starRating: 4, totalRooms: "",
  address: "", city: "", state: "", country: "India", currency: "INR", propertyPhone: "",
};

const STEPS = [
  { id: 1, label: "Your account", icon: User, hint: "Owner login credentials" },
  { id: 2, label: "Your property", icon: Building2, hint: "Company & hotel details" },
  { id: 3, label: "Location", icon: MapPin, hint: "Where guests find you" },
];

const PROPERTY_TYPES = ["Hotel", "Resort", "Vacation Rental", "Hostel", "Boutique", "Serviced Apartments", "Chain"];

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Form>(EMPTY);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof Form, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.firstName.trim()) e.firstName = "Required";
      if (!form.lastName.trim()) e.lastName = "Required";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Enter a valid email";
      if (form.password.length < 8) e.password = "At least 8 characters";
    }
    if (s === 2) {
      if (form.companyName.trim().length < 2) e.companyName = "Company name is required";
      if (form.propertyName.trim().length < 2) e.propertyName = "Property name is required";
      const rooms = parseInt(form.totalRooms);
      if (!rooms || rooms < 1) e.totalRooms = "Enter total rooms";
    }
    if (s === 3) {
      if (form.address.trim().length < 2) e.address = "Address is required";
      if (!form.city.trim()) e.city = "City is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(3, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    if (!validateStep(3)) return;
    setLoading(true);
    try {
      const payload: RegisterPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone || undefined,
        companyName: form.companyName.trim(),
        propertyName: form.propertyName.trim(),
        propertyType: form.propertyType,
        starRating: Number(form.starRating),
        totalRooms: parseInt(form.totalRooms),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state || undefined,
        country: form.country || "India",
        currency: form.currency || "INR",
        propertyPhone: form.propertyPhone || undefined,
      };
      await register(payload);
      // Trigger the guided tour on first dashboard load.
      if (typeof window !== "undefined") localStorage.setItem("hos-tour-autostart", "1");
      toast.success("Welcome to HospitalityOS AI!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      const text = Array.isArray(msg) ? msg[0] : msg ?? "Registration failed. Please try again.";
      toast.error(text);
      if (/email/i.test(text)) setStep(1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left hero */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden gradient-hero p-12 lg:flex">
        <div
          className="absolute inset-0 -z-10 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 25% 15%, oklch(0.5 0.18 265 / 0.4), transparent 60%), radial-gradient(circle at 85% 85%, oklch(0.5 0.22 295 / 0.3), transparent 50%)",
          }}
        />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-[18px] font-semibold">HospitalityOS AI</span>
        </div>

        <div className="max-w-lg">
          <h1 className="font-display text-[40px] font-bold leading-[1.08] tracking-tight">
            Start your{" "}
            <span className="bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--ai)] bg-clip-text text-transparent">
              14-day free trial.
            </span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Set up your property in under 3 minutes. No credit card required — your AI-powered command center is ready the moment you sign in.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              { icon: Rocket, t: "Live in minutes", d: "Reservations, rooms, and rates — configured instantly." },
              { icon: Sparkles, t: "AI from day one", d: "Rate recommendations and housekeeping optimization built in." },
              { icon: ShieldCheck, t: "Secure & multi-property", d: "Bank-grade auth, ready to scale to a whole chain." },
            ].map((f) => (
              <li key={f.t} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--ai-muted)]/40 text-[color:var(--ai-hover)]">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-foreground">{f.t}</div>
                  <div className="text-[12px] text-muted-foreground">{f.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-success" />
          </span>
          Trusted by 2,400+ properties · ₹140 Crore+ revenue optimized
        </div>
      </div>

      {/* Right wizard */}
      <div className="flex w-full flex-col justify-center overflow-y-auto bg-surface px-6 py-10 lg:w-[520px] lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>

          <h2 className="font-display text-[24px] font-bold">Create your account</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Step {step} of 3 — {STEPS[step - 1].hint}
          </p>

          {/* Stepper */}
          <div className="mt-6 flex items-center">
            {STEPS.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-[13px] font-semibold transition ${
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : active
                          ? "border-primary bg-primary-muted/50 text-primary"
                          : "border-border bg-background text-tertiary"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] font-medium ${active ? "text-foreground" : "text-tertiary"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-2 h-px flex-1 ${step > s.id ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-7 space-y-4">
            {/* ── Step 1: account ── */}
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" error={errors.firstName}>
                    <input className="inp" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Aarav" />
                  </Field>
                  <Field label="Last name" error={errors.lastName}>
                    <input className="inp" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Sharma" />
                  </Field>
                </div>
                <Field label="Work email" error={errors.email}>
                  <input className="inp" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@yourhotel.com" />
                </Field>
                <Field label="Password" error={errors.password} hint="Minimum 8 characters">
                  <div className="relative">
                    <input className="inp pr-9" type={showPw ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </Field>
                <Field label="Phone" hint="Optional">
                  <input className="inp" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                </Field>
              </>
            )}

            {/* ── Step 2: property ── */}
            {step === 2 && (
              <>
                <Field label="Company / group name" error={errors.companyName}>
                  <input className="inp" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Sunrise Hospitality Group" />
                </Field>
                <Field label="Property name" error={errors.propertyName}>
                  <input className="inp" value={form.propertyName} onChange={(e) => set("propertyName", e.target.value)} placeholder="Sunrise Grand" />
                </Field>
                <Field label="Property type">
                  <select className="inp" value={form.propertyType} onChange={(e) => set("propertyType", e.target.value)}>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Star rating">
                    <select className="inp" value={form.starRating} onChange={(e) => set("starRating", Number(e.target.value))}>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </Field>
                  <Field label="Total rooms" error={errors.totalRooms}>
                    <input className="inp" type="number" min={1} value={form.totalRooms} onChange={(e) => set("totalRooms", e.target.value)} placeholder="60" />
                  </Field>
                </div>
              </>
            )}

            {/* ── Step 3: location ── */}
            {step === 3 && (
              <>
                <Field label="Street address" error={errors.address}>
                  <input className="inp" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="221 Marine Drive" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" error={errors.city}>
                    <input className="inp" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Mumbai" />
                  </Field>
                  <Field label="State / region" hint="Optional">
                    <input className="inp" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Maharashtra" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Country">
                    <input className="inp" value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="India" />
                  </Field>
                  <Field label="Currency">
                    <select className="inp" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                      {["INR", "USD", "EUR", "GBP", "AED", "SGD"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Property phone" hint="Optional">
                  <input className="inp" value={form.propertyPhone} onChange={(e) => set("propertyPhone", e.target.value)} placeholder="+91 22 1234 5678" />
                </Field>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-7 flex items-center gap-3">
            {step > 1 && (
              <button onClick={back} className="flex h-10 items-center gap-1.5 rounded-md border border-border bg-background/40 px-4 text-[13px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={next} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md gradient-primary text-[13px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110">
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button onClick={submit} disabled={loading} className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md gradient-primary text-[13px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110 disabled:opacity-70">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : <>Create account <Check className="h-3.5 w-3.5" /></>}
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-[12px] text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary-hover">Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        .inp {
          width: 100%; height: 40px; padding: 0 12px;
          background: var(--background);
          border: 1px solid var(--input);
          border-radius: 8px; color: var(--foreground);
          font-size: 13px; transition: all .15s;
        }
        .inp:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px oklch(0.62 0.18 265 / 0.15); }
        select.inp { appearance: none; cursor: pointer; }
      `}</style>
    </div>
  );
}

function Field({
  label, error, hint, children,
}: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{label}</span>
        {hint && !error && <span className="text-[10px] text-tertiary">{hint}</span>}
        {error && <span className="text-[10px] font-medium text-danger">{error}</span>}
      </div>
      {children}
    </label>
  );
}
