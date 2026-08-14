"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("manager@grandmeridian.in");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid email or password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-tertiary">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_oklch(0.62_0.18_265_/_0.15)]"
        />
      </label>

      <label className="block">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Password</span>
          <a href="#" className="text-[11px] font-medium text-primary hover:text-primary-hover">Forgot?</a>
        </div>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="h-10 w-full rounded-md border border-input bg-background px-3 pr-9 text-[13px] text-foreground outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_oklch(0.62_0.18_265_/_0.15)]"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </label>

      {error && <p className="text-[12px] font-medium text-danger">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-md gradient-primary text-[13px] font-semibold text-primary-foreground shadow-glow-primary transition hover:brightness-110 disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
          </>
        ) : (
          <>
            Sign in to HospitalityOS <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center">
          <span className="bg-surface px-2 text-[11px] text-tertiary">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background/40 text-[12px] font-medium hover:border-border-strong"
        >
          <span className="font-bold text-[#4285F4]">G</span> Google
        </button>
        <button
          type="button"
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background/40 text-[12px] font-medium hover:border-border-strong"
        >
          <span className="font-bold text-[#0078D4]">⊞</span> Azure AD
        </button>
      </div>
    </form>
  );
}
