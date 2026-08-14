"use client";

import {
  Building2, BedDouble, LogIn, LogOut, IndianRupee,
  TrendingUp, TrendingDown
} from "lucide-react";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { KPICard } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "building-2": Building2,
  "bed-double": BedDouble,
  "log-in": LogIn,
  "log-out": LogOut,
  "indian-rupee": IndianRupee,
};

function formatValue(value: string | number, format?: KPICard["format"]): string {
  if (typeof value === "string") return value;
  if (format === "currency") return formatCurrency(value);
  if (format === "percent") return formatPercent(value as number, 0);
  return formatNumber(value);
}

export function KPICardWidget({ card }: { card: KPICard }) {
  const Icon = ICON_MAP[card.icon] ?? Building2;
  const isPositive = card.isPositiveTrend ?? true;

  return (
    <div className="rounded-lg bg-gradient-card border border-border-subtle shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-5 group cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${card.color}18`, border: `1px solid ${card.color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color: card.color }} />
        </div>
        {card.trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-2xs font-semibold px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-success/15 text-success"
                : "bg-danger/15 text-danger"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {formatPercent(Math.abs(card.trend), 1)}
          </div>
        )}
      </div>

      <div>
        <p className="text-3xl font-bold text-text-primary tabular-nums leading-none mb-1">
          {formatValue(card.value, card.format)}
        </p>
        <p className="text-xs text-text-tertiary font-medium uppercase tracking-wide">{card.label}</p>
        {card.trendLabel && (
          <p className="text-2xs text-text-tertiary mt-1">{card.trendLabel}</p>
        )}
      </div>
    </div>
  );
}
