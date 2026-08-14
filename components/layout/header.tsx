"use client";

import Link from "next/link";
import { Search, Bell, Brain, Command as CmdIcon, Menu } from "lucide-react";
import { useUIStore } from "@/store/ui";

export function AppHeader({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl">
      <button
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open menu"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 items-center gap-2">
        {breadcrumb && <span className="hidden text-[12px] text-tertiary sm:inline">{breadcrumb} /</span>}
        <h1 className="truncate text-[15px] font-semibold text-foreground">{title}</h1>
      </div>

      <div className="mx-auto hidden max-w-md flex-1 items-center md:flex">
        <div className="group flex w-full items-center gap-2 rounded-md border border-border bg-background/60 px-3 py-1.5 transition hover:border-border-strong">
          <Search className="h-3.5 w-3.5 text-tertiary" />
          <input
            placeholder="Search guests, reservations, rooms…"
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-tertiary focus:outline-none"
          />
          <kbd className="hidden items-center gap-0.5 rounded border border-border bg-elevated px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
            <CmdIcon className="h-2.5 w-2.5" />K
          </kbd>
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-2">
        <Link
          href="/ai-copilot"
          className="group relative flex items-center gap-1.5 rounded-md border border-[color:var(--ai)]/30 bg-[color:var(--ai-muted)]/40 px-2.5 py-1.5 text-[12px] font-semibold text-[color:var(--ai-hover)] transition hover:border-[color:var(--ai)]/60 hover:shadow-glow-ai"
        >
          <span className="absolute -left-0.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[color:var(--ai)] animate-breathe" />
          <Brain className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">AI Copilot</span>
        </Link>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-border-strong hover:text-foreground">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
            4
          </span>
        </button>
      </div>
    </header>
  );
}

/** Backward-compat alias for stub pages. */
export const Header = AppHeader;
