"use client";

import {
  LogIn, LogOut, CalendarPlus, Sparkles, Brain, IndianRupee, RefreshCw, Wrench
} from "lucide-react";
import { ACTIVITY_FEED } from "@/constants/sample-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "log-in": LogIn,
  "log-out": LogOut,
  "calendar-plus": CalendarPlus,
  sparkles: Sparkles,
  brain: Brain,
  "indian-rupee": IndianRupee,
  "refresh-cw": RefreshCw,
  tool: Wrench,
};

export function ActivityFeed() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Live Activity</CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success pulse-dot" />
            <span className="text-xs text-success font-medium">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <ul className="space-y-1">
          {ACTIVITY_FEED.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? Brain;
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-md hover:bg-base-elevated transition-colors cursor-default group"
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${item.color}18`, border: `1px solid ${item.color}25` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-snug">{item.message}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{item.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
