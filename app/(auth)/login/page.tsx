import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden gradient-hero p-12 lg:flex">
        <div
          className="absolute inset-0 -z-10 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, oklch(0.5 0.18 265 / 0.4), transparent 60%), radial-gradient(circle at 80% 80%, oklch(0.5 0.22 295 / 0.3), transparent 50%)",
          }}
        />
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-[18px] font-semibold">HospitalityOS AI</span>
        </div>

        <div className="max-w-xl">
          <h1 className="font-display text-[48px] font-bold leading-[1.05] tracking-tight">
            The Operating System
            <br />
            of Your{" "}
            <span className="bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--ai)] bg-clip-text text-transparent">
              Property.
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            One intelligent platform for reservations, revenue, housekeeping, and guests — orchestrated by AI that never sleeps.
          </p>

          <div className="mt-10 flex h-8 items-center gap-3 text-[13px]">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-muted-foreground">2,400+ properties managed · ₹140 Crore+ revenue optimized</span>
          </div>
        </div>

        {/* Floating mini cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "Occupancy", v: "84%", tone: "text-success" },
            { l: "RevPAR", v: "₹6,913", tone: "text-primary" },
            { l: "AI Picks", v: "+₹4.2L", tone: "text-[color:var(--ai-hover)]" },
          ].map((c) => (
            <div key={c.l} className="glass rounded-xl p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-tertiary">{c.l}</div>
              <div className={`mt-1 font-display text-[22px] font-bold tabular ${c.tone}`}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full flex-col justify-center bg-surface px-8 py-12 lg:w-[440px] lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <h2 className="font-display text-[26px] font-bold">Welcome back</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Sign in to your property dashboard</p>

          <div className="mt-7">
            <LoginForm />
          </div>

          <p className="pt-6 text-center text-[12px] text-muted-foreground">
            New property?{" "}
            <Link href="/register" className="font-medium text-primary hover:text-primary-hover">
              Start free trial →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
