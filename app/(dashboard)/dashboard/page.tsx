"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  BedDouble, DoorOpen, DoorClosed, IndianRupee, Hotel,
  Sparkles, Brain, CalendarPlus, Wrench, ArrowRight, Send, Loader2,
} from "lucide-react";
import { aiService } from "@/lib/services/ai.service";
import { AppHeader } from "@/components/layout/header";
import { KpiCard, StatusDot, Badge } from "@/components/ui-kit";
import {
  kpis as sampleKpis, occupancySpark, revenueSpark, activityFeed,
  reservations as sampleReservations, rooms as sampleRooms, type Reservation,
} from "@/lib/sample-data";
import { dashboardService } from "@/lib/services/dashboard.service";
import { reservationsService } from "@/lib/services/reservations.service";
import { roomsService } from "@/lib/services/rooms.service";
import { mapReservation, type ApiReservation } from "@/lib/mappers";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DoorOpen, DoorClosed, CalendarPlus, Sparkles, Brain, Wrench,
};

const activityTone: Record<string, string> = {
  "check-in": "text-success bg-success-muted/60",
  "check-out": "text-muted-foreground bg-elevated",
  booking: "text-primary bg-primary-muted/60",
  ai: "text-[color:var(--ai-hover)] bg-[color:var(--ai-muted)]/60",
  housekeeping: "text-info bg-info-muted/60",
  maintenance: "text-warning bg-warning-muted/60",
};

export default function DashboardPage() {
  const { data: kpi } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: () => dashboardService.getKPIs(),
    staleTime: 30_000,
    retry: false,
  });

  const { data: resData } = useQuery({
    queryKey: ["dashboard-reservations"],
    queryFn: () => reservationsService.findAll({ limit: 7 }),
    retry: false,
  });

  const { data: roomsData } = useQuery({
    queryKey: ["dashboard-rooms"],
    queryFn: () => roomsService.findAll(),
    retry: false,
  });

  const liveReservations: Reservation[] | null = resData?.data
    ? (resData.data as ApiReservation[]).map(mapReservation)
    : null;
  const reservations = liveReservations && liveReservations.length ? liveReservations : sampleReservations;

  const liveRooms = (roomsData?.data as { number: string; status: string }[] | undefined) ?? null;

  return (
    <>
      <AppHeader title="Dashboard" breadcrumb="Operations" />
      <div className="flex-1 space-y-6 p-6">
        {/* KPI Row */}
        <div data-tour="kpis" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard
            icon={Hotel}
            label="Occupancy Today"
            value={`${kpi ? kpi.occupancy.value : sampleKpis.occupancy}%`}
            delta={kpi ? kpi.occupancy.trend ?? undefined : sampleKpis.occupancyDelta}
            spark={occupancySpark}
            caption="vs yesterday"
          />
          <KpiCard
            icon={BedDouble}
            label="Available Rooms"
            value={`${kpi ? kpi.availableRooms.value : sampleKpis.available}`}
            caption={`of ${kpi ? kpi.totalRooms : 142} total`}
            iconClass="bg-info-muted/60 text-info"
          />
          <KpiCard
            icon={DoorOpen}
            label="Arrivals Today"
            value={`${kpi ? kpi.arrivalsToday.value : sampleKpis.arrivals}`}
            caption={`${kpi ? kpi.inHouse : sampleKpis.arrivalsCheckedIn} in-house`}
            iconClass="bg-success-muted/60 text-success"
          />
          <KpiCard
            icon={DoorClosed}
            label="Departures Today"
            value={`${kpi ? kpi.departuresToday.value : sampleKpis.departures}`}
            caption="expected today"
            iconClass="bg-warning-muted/60 text-warning"
          />
          <KpiCard
            icon={IndianRupee}
            label="Revenue Today"
            value={inr(kpi ? kpi.revenueToday.value : sampleKpis.revenue)}
            delta={kpi ? kpi.revenueToday.trend ?? undefined : sampleKpis.revenueDelta}
            spark={revenueSpark}
            caption="vs last week"
          />
        </div>

        {/* Timeline + Activity */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div data-tour="timeline" className="lg:col-span-3">
            <ReservationTimeline reservations={reservations} />
          </div>
          <div data-tour="activity" className="lg:col-span-2 flex">
            <ActivityFeed />
          </div>
        </div>

        {/* Housekeeping + AI Quick Ask */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div data-tour="housekeeping">
            <HousekeepingMini liveRooms={liveRooms} />
          </div>
          <div data-tour="ai-ask">
            <AIQuickAsk />
          </div>
        </div>
      </div>
    </>
  );
}

function ReservationTimeline({ reservations }: { reservations: Reservation[] }) {
  const hours = Array.from({ length: 12 }, (_, i) => i * 2);
  const rows = reservations.slice(0, 7);
  const tones: Record<string, string> = {
    "checked-in": "from-success/30 to-success/10 border-success/40 text-success",
    confirmed: "from-primary/30 to-primary/10 border-primary/40 text-primary",
    pending: "from-warning/30 to-warning/10 border-warning/40 text-warning",
    "checked-out": "from-muted-foreground/20 to-muted-foreground/5 border-muted-foreground/30 text-muted-foreground",
    cancelled: "from-danger/30 to-danger/10 border-danger/40 text-danger",
  };
  return (
    <section className="lg:col-span-3 overflow-hidden rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-[14px] font-semibold">Today&apos;s Reservation Timeline</h3>
          <p className="text-[11px] text-muted-foreground">Live view across all rooms · {reservations.length} active stays</p>
        </div>
        <Badge tone="primary">Live</Badge>
      </header>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[80px_1fr] border-b border-border bg-background/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
            <div>Room</div>
            <div className="grid grid-cols-12">
              {hours.map((h) => (
                <div key={h}>{h.toString().padStart(2, "0")}:00</div>
              ))}
            </div>
          </div>
          {rows.map((r, idx) => {
            const startCol = (idx * 1.7) % 8;
            const span = 3 + (idx % 4);
            return (
              <div key={r.id} className="grid grid-cols-[80px_1fr] items-center border-b border-border px-3 py-2 hover:bg-white/[0.02]">
                <div className="text-[12px] font-medium">
                  <div>{r.room}</div>
                  <div className="text-[10px] text-tertiary">{r.roomType}</div>
                </div>
                <div className="relative grid grid-cols-12 gap-px">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-9 border-r border-border/40" />
                  ))}
                  <div
                    className={cn(
                      "absolute top-1 bottom-1 flex items-center gap-1.5 overflow-hidden rounded-md border bg-gradient-to-r px-2 text-[11px] font-medium",
                      tones[r.status],
                    )}
                    style={{ left: `${(startCol / 12) * 100}%`, width: `${(span / 12) * 100}%` }}
                  >
                    <span className="truncate">{r.guest}</span>
                    <span className="opacity-60">· {r.nights}n</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ActivityFeed() {
  return (
    <section className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-[14px] font-semibold">Activity Feed</h3>
          <p className="text-[11px] text-muted-foreground">Real-time property events</p>
        </div>
        <StatusDot color="var(--success)" />
      </header>
      <ul className="flex-1 divide-y divide-border overflow-auto">
        {activityFeed.map((a) => {
          const Icon = iconMap[a.icon] || Sparkles;
          return (
            <li key={a.id} className="flex items-start gap-3 px-4 py-3 transition hover:bg-white/[0.02]">
              <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md", activityTone[a.type])}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-foreground">{a.text}</p>
                <p className="mt-0.5 text-[11px] text-tertiary">{a.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const ROOM_STATUS_COLOR: Record<string, string> = {
  clean: "var(--success)", CLEAN: "var(--success)",
  dirty: "var(--danger)", DIRTY: "var(--danger)",
  cleaning: "var(--warning)", CLEANING: "var(--warning)",
  inspecting: "var(--info)", INSPECTING: "var(--info)",
  MAINTENANCE: "var(--tertiary)", BLOCKED: "var(--tertiary)", OUT_OF_ORDER: "var(--tertiary)",
};

function HousekeepingMini({ liveRooms }: { liveRooms: { number: string; status: string }[] | null }) {
  const rooms = liveRooms && liveRooms.length
    ? liveRooms.slice(0, 16)
    : sampleRooms.map((r) => ({ number: r.number, status: r.status }));
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-[14px] font-semibold">Housekeeping Status</h3>
          <p className="text-[11px] text-muted-foreground">{rooms.length} rooms in rotation</p>
        </div>
        <a href="/housekeeping" className="flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary-hover">
          Open board <ArrowRight className="h-3 w-3" />
        </a>
      </header>
      <div className="p-4">
        <div className="grid grid-cols-8 gap-1.5">
          {rooms.map((r) => (
            <div
              key={r.number}
              title={`Room ${r.number} · ${r.status}`}
              className="group relative aspect-square rounded-md border border-border/60 transition hover:scale-110"
              style={{ background: `color-mix(in oklab, ${ROOM_STATUS_COLOR[r.status] ?? "var(--tertiary)"} 25%, transparent)` }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-foreground/90">
                {r.number}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {[
            { label: "Dirty", c: "var(--danger)" },
            { label: "Cleaning", c: "var(--warning)" },
            { label: "Inspecting", c: "var(--info)" },
            { label: "Clean", c: "var(--success)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: l.c }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AIQuickAsk() {
  const prompts = [
    "Give me a status of the hotel right now",
    "What should I prioritise today?",
    "What maintenance needs attention?",
  ];
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const ask = useMutation({
    mutationFn: (q: string) => aiService.copilot([{ role: "user", content: q }]),
    onSuccess: (res) => setAnswer(res.answer),
    onError: () => setAnswer("Couldn't reach the AI service. Try again."),
  });

  function submit(q: string) {
    const text = q.trim();
    if (!text || ask.isPending) return;
    setInput("");
    ask.mutate(text);
  }

  return (
    <section className="glass-ai relative overflow-hidden rounded-xl p-5">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{ background: "radial-gradient(circle at 80% 20%, oklch(0.5 0.22 295 / 0.4), transparent 60%)" }}
      />
      <header className="flex items-center gap-3">
        <div className="relative">
          <div className="h-9 w-9 rounded-full gradient-ai shadow-glow-ai animate-breathe" />
          <div className="absolute inset-0 m-auto h-9 w-9 rounded-full bg-[color:var(--ai)]/30 blur-md" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-foreground">AI Copilot</h3>
          <p className="text-[11px] text-[color:var(--ai-hover)]/80">Ask anything about your property</p>
        </div>
        <Link href="/ai-copilot" className="ml-auto"><Badge tone="ai">✦ Online</Badge></Link>
      </header>

      {answer !== null ? (
        <div className="mt-4 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-[color:var(--ai)]/20 bg-background/40 p-3 text-[13px] leading-relaxed text-foreground">
          {ask.isPending ? <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…</span> : answer}
          <div className="mt-2 border-t border-[color:var(--ai)]/15 pt-2">
            <Link href="/ai-copilot" className="text-[11px] font-medium text-[color:var(--ai-hover)] hover:underline">Continue in AI Copilot →</Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {prompts.map((p) => (
            <button key={p} onClick={() => submit(p)} disabled={ask.isPending}
              className="rounded-md border border-[color:var(--ai)]/25 bg-background/30 px-2.5 py-1.5 text-[12px] text-[color:var(--ai-hover)] transition hover:border-[color:var(--ai)]/60 hover:bg-[color:var(--ai-muted)]/40 disabled:opacity-50">
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[color:var(--ai)]/30 bg-background/50 p-2 focus-within:border-[color:var(--ai)] focus-within:shadow-glow-ai">
        <Brain className="ml-1 h-4 w-4 text-[color:var(--ai-hover)]" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(input); }}
          placeholder="Ask anything about your property..."
          className="flex-1 bg-transparent text-[13px] placeholder:text-tertiary focus:outline-none"
        />
        <button onClick={() => submit(input)} disabled={ask.isPending || !input.trim()}
          className="flex h-7 w-7 items-center justify-center rounded-md gradient-ai text-white shadow-glow-ai hover:brightness-110 disabled:opacity-50">
          {ask.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </button>
      </div>
    </section>
  );
}
