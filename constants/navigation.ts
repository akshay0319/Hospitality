import type { NavGroup } from "@/types";

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "OPERATIONS",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
      { label: "Reservations", href: "/reservations", icon: "calendar-days" },
      { label: "Front Desk", href: "/front-desk", icon: "door-open" },
      { label: "Housekeeping", href: "/housekeeping", icon: "sparkles" },
      { label: "Maintenance", href: "/maintenance", icon: "wrench" },
    ],
  },
  {
    label: "REVENUE",
    items: [
      { label: "Rate Management", href: "/revenue", icon: "trending-up" },
      { label: "Channel Manager", href: "/channels", icon: "globe" },
      { label: "Booking Engine", href: "/booking-engine", icon: "shopping-bag" },
    ],
  },
  {
    label: "GUESTS",
    items: [
      { label: "Guest Profiles", href: "/guests", icon: "users" },
      { label: "CRM", href: "/crm", icon: "heart-handshake" },
      { label: "Communications", href: "/crm/communications", icon: "message-square" },
      { label: "Loyalty", href: "/crm/loyalty", icon: "star" },
    ],
  },
  {
    label: "AI COMMAND CENTER",
    items: [
      { label: "AI Copilot", href: "/ai-copilot", icon: "brain", isAI: true },
      { label: "AI Agents", href: "/ai-copilot/agents", icon: "bot", isAI: true },
      { label: "Voice AI", href: "/voice-ai", icon: "mic", isAI: true },
      { label: "Concierge AI", href: "/ai-copilot/concierge", icon: "bell-concierge", isAI: true },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      { label: "Revenue Analytics", href: "/analytics", icon: "bar-chart-3" },
      { label: "Operations Report", href: "/analytics/operations", icon: "activity" },
      { label: "Guest Analytics", href: "/analytics/guests", icon: "pie-chart" },
    ],
  },
];

export const SETTINGS_NAV = [
  { label: "Property Setup", href: "/settings/property", icon: "building-2" },
  { label: "Users & Roles", href: "/settings/users", icon: "shield" },
  { label: "Integrations", href: "/settings/integrations", icon: "plug" },
  { label: "Billing", href: "/settings/billing", icon: "credit-card" },
];
