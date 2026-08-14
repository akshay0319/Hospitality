import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

export function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  iconClass,
  spark,
  caption,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number;
  iconClass?: string;
  spark?: number[];
  caption?: string;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface to-elevated p-4 transition hover:border-border-strong hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconClass ?? "bg-primary-muted text-primary")}>
          <Icon className="h-4 w-4" />
        </div>
        {delta !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
              positive ? "bg-success-muted/60 text-success" : "bg-danger-muted/60 text-danger",
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-tertiary">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-[28px] font-bold tabular leading-none text-foreground">
          {value}
        </span>
      </div>
      {caption && <div className="mt-1 text-[11px] text-muted-foreground">{caption}</div>}
      {spark && <Sparkline data={spark} positive={positive} />}
    </div>
  );
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 100;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  const color = positive ? "var(--success)" : "var(--danger)";
  const gid = `g-${positive ? "up" : "down"}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-6 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`} />
    </svg>
  );
}

export function StatusDot({ color = "var(--success)" }: { color?: string }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inset-0 animate-ping rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
    </span>
  );
}

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "ai" | "primary" | "muted";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "bg-elevated text-muted-foreground border-border",
    success: "bg-success-muted/60 text-success border-success/30",
    warning: "bg-warning-muted/60 text-warning border-warning/30",
    danger: "bg-danger-muted/60 text-danger border-danger/30",
    info: "bg-info-muted/60 text-info border-info/30",
    primary: "bg-primary-muted/60 text-primary border-primary/30",
    ai: "bg-[color:var(--ai-muted)]/60 text-[color:var(--ai-hover)] border-[color:var(--ai)]/30",
    muted: "bg-elevated text-tertiary border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
