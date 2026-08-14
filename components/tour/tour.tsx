"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

// ── Step definitions ───────────────────────────────────────────────────────────
export interface TourStep {
  selector: string;         // [data-tour="..."]
  title: string;
  body: string;
  placement?: "top" | "bottom" | "auto";
}

const STEPS: TourStep[] = [
  {
    selector: '[data-tour="nav"]',
    title: "Your navigation hub",
    body: "Everything is grouped here — Operations, Revenue, Guests, the AI Command Center, and Analytics. Collapse it anytime with the arrow at the top.",
    placement: "auto",
  },
  {
    selector: '[data-tour="kpis"]',
    title: "Today at a glance",
    body: "These live cards show occupancy, available rooms, arrivals, departures, and revenue — refreshed straight from your property data.",
    placement: "bottom",
  },
  {
    selector: '[data-tour="timeline"]',
    title: "Reservation timeline",
    body: "See who is staying in which room across the day. Each bar is a live reservation — colored by status (in-house, confirmed, pending).",
    placement: "top",
  },
  {
    selector: '[data-tour="activity"]',
    title: "Live activity feed",
    body: "A real-time stream of check-ins, new bookings, housekeeping updates, and AI alerts as they happen across the property.",
    placement: "auto",
  },
  {
    selector: '[data-tour="housekeeping"]',
    title: "Housekeeping status",
    body: "A color-coded map of every room's cleaning state — dirty, cleaning, inspecting, or clean & ready. Click through to the full board.",
    placement: "top",
  },
  {
    selector: '[data-tour="ai-ask"]',
    title: "Ask the AI Copilot",
    body: "Type a question in plain English — “Why did occupancy drop?” or “Where can I earn more this weekend?” — and get instant, data-backed answers.",
    placement: "top",
  },
  {
    selector: '[data-tour="help"]',
    title: "Replay this tour anytime",
    body: "Stuck later? Click this help button in the corner to restart the walkthrough whenever you need a refresher.",
    placement: "top",
  },
];

const SEEN_KEY = "hos-tour-seen";
const AUTOSTART_KEY = "hos-tour-autostart";

// ── Context ─────────────────────────────────────────────────────────────────────
interface TourCtx { start: () => void; }
const TourContext = createContext<TourCtx>({ start: () => {} });
export const useTour = () => useContext(TourContext);

interface Rect { top: number; left: number; width: number; height: number; }

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => setMounted(true), []);

  const finish = useCallback(() => {
    setActive(false);
    setRect(null);
    if (typeof window !== "undefined") localStorage.setItem(SEEN_KEY, "1");
  }, []);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  // Auto-start: right after registration, or on a user's very first visit.
  useEffect(() => {
    if (!mounted) return;
    const autostart = localStorage.getItem(AUTOSTART_KEY) === "1";
    const seen = localStorage.getItem(SEEN_KEY) === "1";
    if (autostart || !seen) {
      localStorage.removeItem(AUTOSTART_KEY);
      const t = setTimeout(() => start(), 700); // let the dashboard paint first
      timers.current.push(t);
    }
    return () => { timers.current.forEach(clearTimeout); };
  }, [mounted, start]);

  // Measure the current target; skip missing ones.
  const measure = useCallback(() => {
    if (!active) return;
    const step = STEPS[index];
    if (!step) return finish();
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      // target not on this page — advance (or finish if last)
      setIndex((i) => (i >= STEPS.length - 1 ? -1 : i + 1));
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [active, index, finish]);

  useLayoutEffect(() => {
    if (index === -1) { finish(); return; }
    measure();
    const t = setTimeout(measure, 260); // re-measure after smooth scroll settles
    timers.current.push(t);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure, index, finish]);

  const next = () => setIndex((i) => (i >= STEPS.length - 1 ? -1 : i + 1));
  const prev = () => setIndex((i) => Math.max(0, i - 1));

  const step = STEPS[index];

  return (
    <TourContext.Provider value={{ start }}>
      {children}

      {/* Floating help button */}
      {mounted && createPortal(
        <button
          data-tour="help"
          onClick={start}
          aria-label="Restart product tour"
          className="fixed bottom-5 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full gradient-ai text-white shadow-glow-ai transition hover:brightness-110 hover:scale-105"
          title="Restart dashboard tour"
        >
          <HelpCircle className="h-5 w-5" />
        </button>,
        document.body,
      )}

      {/* Coachmark overlay */}
      {mounted && active && rect && step && createPortal(
        <TourOverlay
          rect={rect}
          step={step}
          index={index}
          total={STEPS.length}
          onNext={next}
          onPrev={prev}
          onClose={finish}
        />,
        document.body,
      )}
    </TourContext.Provider>
  );
}

function TourOverlay({
  rect, step, index, total, onNext, onPrev, onClose,
}: {
  rect: Rect; step: TourStep; index: number; total: number;
  onNext: () => void; onPrev: () => void; onClose: () => void;
}) {
  const pad = 8;
  const isLast = index === total - 1;

  // Popup placement
  const popupW = 340;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const spaceBelow = vh - (rect.top + rect.height);
  const placeBelow = step.placement === "bottom" || (step.placement !== "top" && spaceBelow > 260);
  const top = placeBelow ? rect.top + rect.height + pad + 8 : Math.max(12, rect.top - pad - 8 - 230);
  let left = rect.left + rect.width / 2 - popupW / 2;
  left = Math.max(12, Math.min(left, vw - popupW - 12));

  return (
    <div className="fixed inset-0 z-[55]">
      {/* Spotlight: transparent center with a huge shadow dimming the rest */}
      <div
        className="pointer-events-none absolute rounded-lg transition-all duration-200"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          boxShadow: "0 0 0 9999px rgba(3, 6, 18, 0.72)",
          border: "2px solid var(--ai)",
          outline: "1px solid oklch(0.74 0.20 295 / 0.4)",
        }}
      />

      {/* Popup card */}
      <div
        className="absolute w-[340px] rounded-xl border border-[color:var(--ai)]/30 bg-elevated p-4 shadow-elevated animate-fade-in"
        style={{ top, left }}
      >
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md gradient-ai text-white shadow-glow-ai">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--ai-hover)]">
              Step {index + 1} of {total}
            </div>
            <h4 className="mt-0.5 font-display text-[15px] font-semibold text-foreground">{step.title}</h4>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tour"
            className="rounded-md p-1 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>

        {/* Progress dots */}
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-[color:var(--ai)]" : "w-1.5 bg-border-strong"
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-[12px] font-medium text-tertiary transition hover:text-foreground"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                onClick={onPrev}
                className="flex h-8 items-center gap-1 rounded-md border border-border bg-background/40 px-2.5 text-[12px] font-medium text-muted-foreground hover:border-border-strong hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            <button
              onClick={isLast ? onClose : onNext}
              className="flex h-8 items-center gap-1 rounded-md gradient-ai px-3 text-[12px] font-semibold text-white shadow-glow-ai hover:brightness-110"
            >
              {isLast ? "Finish" : "Next"} {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
