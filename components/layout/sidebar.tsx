"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, CalendarDays, CalendarRange, DoorOpen, Sparkles, Wrench,
  TrendingUp, Globe, ShoppingBag, Users2,
  Users, HeartHandshake, MessageSquare, Star,
  Brain, Bot, Mic, ConciergeBell,
  BarChart3, Activity, PieChart,
  Building2, Shield, Plug, CreditCard,
  Settings, LogOut, ChevronDown, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { property } from "@/lib/sample-data";
import { getInitials } from "@/lib/utils";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }>; ai?: boolean };

const groups: { label: string; items: Item[]; ai?: boolean }[] = [
  {
    label: "Operations",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutGrid },
      { title: "Reservations", url: "/reservations", icon: CalendarDays },
      { title: "Groups", url: "/groups", icon: Users2 },
      { title: "Front Desk", url: "/front-desk", icon: DoorOpen },
      { title: "Inventory", url: "/inventory", icon: CalendarRange },
      { title: "Housekeeping", url: "/housekeeping", icon: Sparkles },
      { title: "Maintenance", url: "/maintenance", icon: Wrench },
    ],
  },
  {
    label: "Revenue",
    items: [
      { title: "Rate Management", url: "/revenue", icon: TrendingUp },
      { title: "Channel Manager", url: "/channels", icon: Globe },
      { title: "Booking Engine", url: "/booking-engine", icon: ShoppingBag },
    ],
  },
  {
    label: "Guests",
    items: [
      { title: "Guest Profiles", url: "/guests", icon: Users },
      { title: "CRM", url: "/crm", icon: HeartHandshake },
      { title: "Communications", url: "/comms", icon: MessageSquare },
      { title: "Loyalty", url: "/loyalty", icon: Star },
    ],
  },
  {
    label: "AI Command Center",
    ai: true,
    items: [
      { title: "AI Copilot", url: "/ai-copilot", icon: Brain, ai: true },
      { title: "AI Agents", url: "/agents", icon: Bot, ai: true },
      { title: "Voice AI", url: "/voice-ai", icon: Mic, ai: true },
      { title: "Concierge", url: "/concierge", icon: ConciergeBell, ai: true },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Revenue Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Operations Report", url: "/analytics/ops", icon: Activity },
      { title: "Guest Analytics", url: "/analytics/guests", icon: PieChart },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Property Setup", url: "/settings", icon: Building2 },
      { title: "Users & Roles", url: "/settings/users", icon: Shield },
      { title: "Integrations", url: "/settings/integrations", icon: Plug },
      { title: "Billing", url: "/settings/billing", icon: CreditCard },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // "collapsed" = visually collapsed. An open mobile drawer always shows full labels.
  const collapsed = sidebarCollapsed && !mobileNavOpen;
  const isActive = (url: string) =>
    url === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(url);

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Rohan Kapoor";
  const role = user?.role?.replace(/_/g, " ") ?? "General Manager";

  return (
    <>
      {/* Mobile overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}
      <aside
        data-tour="nav"
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 ${
          sidebarCollapsed ? "w-[248px] lg:w-[64px]" : "w-[248px]"
        } ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
      {/* Header */}
      <div className="border-b border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg gradient-primary shadow-glow-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-[13px] font-semibold text-foreground">HospitalityOS</div>
              <div className="truncate text-[11px] text-muted-foreground">AI Edition</div>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden rounded p-1 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground lg:block"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {!collapsed && (
          <button className="mt-3 flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-background/40 px-2.5 py-2 text-left transition hover:border-border-strong hover:bg-elevated">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-muted text-[10px] font-bold text-primary">
              GM
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium text-foreground">{property.name}</div>
              <div className="truncate text-[10px] text-muted-foreground">{property.location}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-1 py-2">
        {groups.map((group) => (
          <div key={group.label} className="py-1">
            {!collapsed && (
              <div
                className={`px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                  group.ai ? "text-[color:var(--ai-hover)]" : "text-tertiary"
                }`}
              >
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.url);
                const Icon = item.icon;
                return (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      onClick={() => setMobileNavOpen(false)}
                      title={collapsed ? item.title : undefined}
                      className={`group/btn flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors ${
                        active
                          ? item.ai
                            ? "bg-[color:var(--ai-muted)]/40 text-[color:var(--ai-hover)] border-l-2 border-[color:var(--ai)] rounded-l-none"
                            : "bg-primary-muted/40 text-foreground border-l-2 border-primary rounded-l-none"
                          : "text-sidebar-foreground hover:bg-white/[0.04] hover:text-foreground"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          item.ai
                            ? "text-[color:var(--ai-hover)]"
                            : active
                            ? "text-primary"
                            : "text-muted-foreground group-hover/btn:text-foreground"
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / user */}
      <div className="border-t border-sidebar-border px-2 py-2">
        <div className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-white/[0.04]">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-muted text-[10px] font-semibold text-primary">
            {getInitials(fullName)}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-foreground">{fullName}</div>
                <div className="truncate text-[10px] capitalize text-muted-foreground">{role.toLowerCase()}</div>
              </div>
              <div className="flex items-center gap-0.5">
                <Link href="/settings" className="rounded p-1 text-muted-foreground hover:bg-elevated hover:text-foreground">
                  <Settings className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => logout()}
                  className="rounded p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      </aside>
    </>
  );
}
