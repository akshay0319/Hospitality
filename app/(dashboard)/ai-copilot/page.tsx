"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Mic, Sparkles, Loader2, Database, AlertCircle, FileText } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, CartesianGrid, Tooltip } from "recharts";
import { toast } from "sonner";
import { AppHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui-kit";
import { aiService, type CopilotMessage, type RevPoint } from "@/lib/services/ai.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";

const TOOL_LABEL: Record<string, string> = {
  list_reservations: "Reservations", search_guests: "Guests",
  get_revenue_analytics: "Revenue", list_open_maintenance: "Maintenance",
};
type UiMsg = { role: "user" | "ai"; content: string; tools?: string[]; chart?: RevPoint[] };

const prompts = [
  "Give me a status of the hotel right now",
  "What maintenance needs attention?",
  "Who are our most valuable guests?",
  "What should I prioritise today?",
];

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong> : p,
  );
}

export default function CopilotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMsg[]>([
    { role: "ai", content: "Hi! I'm your Operations Copilot. Ask me anything about **The Grand Meridian** — occupancy, guests, revenue, maintenance, or what needs attention today." },
  ]);
  const [allowWrites, setAllowWrites] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const viaVoice = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const { data: status } = useQuery({ queryKey: ["ai-status"], queryFn: () => aiService.status(), retry: false });

  const send = useMutation({
    mutationFn: (history: UiMsg[]) =>
      aiService.copilot(history.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }) as CopilotMessage), allowWrites),
    onSuccess: (res) => {
      setMessages((prev) => [...prev, { role: "ai", content: res.answer, tools: res.toolsUsed, chart: res.chart ?? undefined }]);
      if (viaVoice.current) { speak(res.answer); viaVoice.current = false; }
    },
    onError: () => setMessages((prev) => [...prev, { role: "ai", content: "Sorry — I couldn't reach the AI service just now. Please try again." }]),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, send.isPending]);

  function submit(text: string) {
    const q = text.trim();
    if (!q || send.isPending) return;
    const next: UiMsg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    send.mutate(next);
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.replace(/[*#•]/g, ""));
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function toggleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input needs Chrome/Edge."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = "en-IN"; rec.interimResults = false; rec.maxAlternatives = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => { viaVoice.current = true; setListening(false); submit(e.results[0][0].transcript); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start(); setListening(true);
  }

  return (
    <>
      <AppHeader title="AI Copilot" breadcrumb="Intelligence" />
      <div className="grid flex-1 grid-cols-1 gap-4 p-6 lg:grid-cols-[1fr_360px]">
        {/* Chat */}
        <section className="flex h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-xl border border-[color:var(--ai)]/20 bg-surface">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-9 w-9 rounded-full gradient-ai shadow-glow-ai animate-breathe" />
                <div className="absolute inset-0 rounded-full bg-[color:var(--ai)]/40 blur-lg" />
              </div>
              <div>
                <h2 className="font-display text-[16px] font-semibold">AI Copilot</h2>
                <p className="text-[11px] text-[color:var(--ai-hover)]/80">Powered by HospitalityOS Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAllowWrites((v) => !v)}
                title={allowWrites ? "Copilot can create tickets & block rooms" : "Copilot is read-only"}
                className="flex items-center gap-1.5 text-[11px] font-medium"
              >
                <span className={allowWrites ? "text-warning" : "text-tertiary"}>Actions</span>
                <span className={cn("relative h-4 w-7 rounded-full transition", allowWrites ? "bg-warning" : "bg-border-strong")}>
                  <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all", allowWrites ? "left-3.5" : "left-0.5")} />
                </span>
              </button>
              <Badge tone={status?.live ? "ai" : "warning"}>{status?.live ? "✦ Online · GPT-4o" : "◐ Demo mode"}</Badge>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-6">
            {messages.map((m, i) => (
              <Message key={i} role={m.role} text={m.content} chart={m.chart}
                sources={m.tools?.length ? m.tools.map((t) => TOOL_LABEL[t] ?? t) : undefined} />
            ))}
            {send.isPending && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-ai shadow-glow-ai">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-[color:var(--ai)]/20 bg-[color:var(--ai-muted)]/15 px-4 py-3 text-[13px] text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[color:var(--ai-hover)]" /> Thinking…
                </div>
              </div>
            )}
          </div>

          <footer className="border-t border-border p-4">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => submit(p)}
                  disabled={send.isPending}
                  className="rounded-md border border-[color:var(--ai)]/20 bg-background/40 px-2.5 py-1 text-[11px] text-[color:var(--ai-hover)] hover:border-[color:var(--ai)]/50 hover:bg-[color:var(--ai-muted)]/30 disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 p-2 focus-within:border-[color:var(--ai)] focus-within:shadow-glow-ai">
              <Sparkles className="ml-1 h-4 w-4 text-[color:var(--ai-hover)]" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(input); }}
                placeholder="Ask about your property..."
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-tertiary focus:outline-none"
              />
              <button onClick={toggleVoice} title={listening ? "Listening… click to stop" : "Ask by voice"}
                className={cn("flex h-8 w-8 items-center justify-center rounded-md border transition",
                  listening ? "border-[color:var(--ai)] bg-[color:var(--ai-muted)]/40 text-[color:var(--ai-hover)] animate-pulse" : "border-border text-muted-foreground hover:bg-elevated hover:text-foreground")}>
                <Mic className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => submit(input)}
                disabled={send.isPending || !input.trim()}
                className="flex h-8 items-center gap-1.5 rounded-md gradient-ai px-3 text-[12px] font-semibold text-white shadow-glow-ai hover:brightness-110 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </div>
          </footer>
        </section>

        {/* Context Panel */}
        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-tertiary">Data Sources</h3>
            <div className="grid grid-cols-2 gap-2">
              {["PMS", "CRM", "Revenue", "Channels", "Reviews", "External"].map((s) => (
                <div key={s} className="flex items-center gap-2 rounded-md border border-border bg-background/40 px-2.5 py-1.5">
                  <Database className="h-3 w-3 text-success" />
                  <span className="text-[12px]">{s}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface">
            <header className="border-b border-border px-4 py-3">
              <h3 className="text-[13px] font-semibold">Active Alerts</h3>
              <p className="text-[11px] text-muted-foreground">AI-generated proactive insights</p>
            </header>
            <ul className="divide-y divide-border">
              {[
                { t: "Suite 604 — VIP arrival in 2hr, room not yet inspected", sev: "danger" as const },
                { t: "Booking.com pricing 8% below comp set — review", sev: "warning" as const },
                { t: "12 dormant corporate accounts ripe for outreach", sev: "info" as const },
                { t: "Forecast: Sat night likely 8 unsold rooms", sev: "warning" as const },
              ].map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3">
                  <AlertCircle
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 shrink-0",
                      a.sev === "danger" && "text-danger",
                      a.sev === "warning" && "text-warning",
                      a.sev === "info" && "text-info",
                    )}
                  />
                  <div className="flex-1 text-[12px] leading-snug text-foreground">{a.t}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-surface">
            <header className="border-b border-border px-4 py-3">
              <h3 className="text-[13px] font-semibold">Recent Reports</h3>
            </header>
            <ul className="divide-y divide-border">
              {["Weekly Revenue Brief", "Channel Performance Q2", "Guest Sentiment May", "Forecast vs Actual"].map((r) => (
                <li key={r} className="flex items-center gap-2 p-3 text-[12px] hover:bg-white/[0.02]">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" /> {r}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}

function Message({ role, text, chart, sources }: { role: "user" | "ai"; text: string; chart?: RevPoint[]; sources?: string[] }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-border bg-elevated px-4 py-2.5 text-[13px]">
          {text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-ai shadow-glow-ai">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="max-w-[85%] flex-1 rounded-2xl rounded-tl-sm border border-[color:var(--ai)]/20 bg-[color:var(--ai-muted)]/15 p-4">
        <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">{renderText(text)}</div>
        {chart && chart.length > 0 && (
          <div className="mt-3 h-[150px] overflow-hidden rounded-md border border-border bg-background/40 p-2">
            <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-tertiary">Revenue — last {chart.length} days</div>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="dropG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.65 0.22 295)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.65 0.22 295)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.28 0.06 265)" strokeDasharray="2 4" />
                <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} tick={{ fill: "oklch(0.55 0.05 260)", fontSize: 9 }} interval={3} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.24 0.05 265)", border: "1px solid oklch(0.35 0.08 265)", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [inr(v), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.74 0.20 295)" strokeWidth={2} fill="url(#dropG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[color:var(--ai)]/15 pt-2.5">
          <Badge tone="success">Confidence: High</Badge>
          {sources && <span className="text-[10px] text-tertiary">Sources: {sources.join(" · ")}</span>}
        </div>
      </div>
    </div>
  );
}
