// ─────────────────────────────────────────────────────────────────────────────
// HospitalityOS AI — UI sample data (design-time). Mirrors the API response shapes.
// ─────────────────────────────────────────────────────────────────────────────

export const property = {
  name: "The Grand Meridian Hotel",
  location: "Connaught Place, New Delhi",
  stars: 5,
  totalRooms: 142,
};

export const kpis = {
  occupancy: 84,
  occupancyDelta: 3.2,
  available: 23,
  arrivals: 18,
  arrivalsCheckedIn: 11,
  departures: 12,
  departuresCheckedOut: 8,
  revenue: 187450,
  revenueDelta: 12.4,
  adr: 8230,
  revpar: 6913,
};

export const occupancySpark = [62, 65, 70, 68, 74, 78, 81, 79, 83, 84];
export const revenueSpark = [120, 135, 128, 142, 156, 148, 162, 170, 178, 187];

export type ResStatus =
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "pending"
  | "cancelled";

export type Reservation = {
  id: string;
  guest: string;
  initials: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  rate: string;
  amount: number;
  status: ResStatus;
  channel: string;
  loyalty?: "Gold" | "Platinum" | "Silver";
};

export const reservations: Reservation[] = [
  { id: "RES-48291", guest: "Arjun Malhotra", initials: "AM", room: "301", roomType: "Deluxe", checkIn: "2026-06-05", checkOut: "2026-06-09", nights: 4, adults: 2, children: 0, rate: "BAR", amount: 32920, status: "checked-in", channel: "Direct", loyalty: "Gold" },
  { id: "RES-48315", guest: "Priya Sharma", initials: "PS", room: "512", roomType: "Suite", checkIn: "2026-06-07", checkOut: "2026-06-10", nights: 3, adults: 2, children: 1, rate: "Best Flex", amount: 48600, status: "confirmed", channel: "Booking.com" },
  { id: "RES-48201", guest: "Rahul Gupta", initials: "RG", room: "215", roomType: "Club Room", checkIn: "2026-06-03", checkOut: "2026-06-07", nights: 4, adults: 1, children: 0, rate: "Corporate", amount: 28400, status: "checked-out", channel: "Direct", loyalty: "Platinum" },
  { id: "RES-48267", guest: "Neha Joshi", initials: "NJ", room: "408", roomType: "Deluxe", checkIn: "2026-06-04", checkOut: "2026-06-07", nights: 3, adults: 2, children: 0, rate: "BAR", amount: 24690, status: "checked-in", channel: "Airbnb" },
  { id: "RES-48344", guest: "Vikram Singh", initials: "VS", room: "110", roomType: "Standard", checkIn: "2026-06-08", checkOut: "2026-06-11", nights: 3, adults: 2, children: 0, rate: "Advance", amount: 18900, status: "confirmed", channel: "MakeMyTrip" },
  { id: "RES-48358", guest: "Anika Reddy", initials: "AR", room: "604", roomType: "Presidential", checkIn: "2026-06-09", checkOut: "2026-06-12", nights: 3, adults: 2, children: 0, rate: "Best Flex", amount: 124500, status: "pending", channel: "Direct", loyalty: "Platinum" },
  { id: "RES-48372", guest: "Karan Mehta", initials: "KM", room: "207", roomType: "Standard", checkIn: "2026-06-07", checkOut: "2026-06-08", nights: 1, adults: 1, children: 0, rate: "BAR", amount: 6300, status: "confirmed", channel: "Expedia" },
  { id: "RES-48389", guest: "Divya Iyer", initials: "DI", room: "419", roomType: "Deluxe", checkIn: "2026-06-06", checkOut: "2026-06-09", nights: 3, adults: 2, children: 2, rate: "Family", amount: 28500, status: "checked-in", channel: "Booking.com", loyalty: "Silver" },
  { id: "RES-48402", guest: "Sahil Khanna", initials: "SK", room: "318", roomType: "Club Room", checkIn: "2026-06-10", checkOut: "2026-06-14", nights: 4, adults: 2, children: 0, rate: "Corporate", amount: 36800, status: "confirmed", channel: "Direct" },
  { id: "RES-48118", guest: "Meera Nair", initials: "MN", room: "505", roomType: "Suite", checkIn: "2026-05-28", checkOut: "2026-06-02", nights: 5, adults: 2, children: 0, rate: "BAR", amount: 72500, status: "cancelled", channel: "Agoda" },
];

export const activityFeed = [
  { id: 1, type: "check-in", time: "2 min ago", icon: "DoorOpen", text: "Arjun Malhotra checked in to Room 301" },
  { id: 2, type: "booking", time: "8 min ago", icon: "CalendarPlus", text: "New booking from Booking.com — Priya Sharma, Suite 512" },
  { id: 3, type: "ai", time: "14 min ago", icon: "Sparkles", text: "AI flagged: 4 rooms likely unsold this weekend — review pricing" },
  { id: 4, type: "housekeeping", time: "21 min ago", icon: "Sparkles", text: "Room 408 marked clean & inspected" },
  { id: 5, type: "check-out", time: "34 min ago", icon: "DoorClosed", text: "Rahul Gupta checked out of Room 215 — folio cleared" },
  { id: 6, type: "ai", time: "48 min ago", icon: "Brain", text: "AI Copilot generated weekly revenue report" },
  { id: 7, type: "booking", time: "1 hr ago", icon: "CalendarPlus", text: "Direct booking — Vikram Singh, Standard 110" },
  { id: 8, type: "maintenance", time: "2 hr ago", icon: "Wrench", text: "AC repair completed in Room 612" },
];

export type RoomStatus = "dirty" | "cleaning" | "inspecting" | "clean";

export type Room = {
  number: string;
  type: string;
  status: RoomStatus;
  priority?: "urgent" | "high" | "normal";
  assignee?: string;
  assigneeInitials?: string;
  eta?: string;
  nextCheckIn?: string;
};

export const rooms: Room[] = [
  { number: "204", type: "Deluxe", status: "dirty", priority: "urgent", nextCheckIn: "1:30 PM" },
  { number: "308", type: "Club", status: "dirty", priority: "urgent", nextCheckIn: "2:00 PM" },
  { number: "412", type: "Suite", status: "dirty", priority: "urgent", nextCheckIn: "2:00 PM" },
  { number: "117", type: "Standard", status: "dirty", priority: "normal" },
  { number: "523", type: "Deluxe", status: "dirty", priority: "high" },
  { number: "301", type: "Deluxe", status: "cleaning", priority: "high", assignee: "Sunita", assigneeInitials: "SU", eta: "15 min" },
  { number: "419", type: "Club", status: "cleaning", priority: "normal", assignee: "Ramesh", assigneeInitials: "RA", eta: "25 min" },
  { number: "215", type: "Standard", status: "cleaning", priority: "normal", assignee: "Lakshmi", assigneeInitials: "LA", eta: "10 min" },
  { number: "606", type: "Suite", status: "inspecting", priority: "high", assignee: "Manoj", assigneeInitials: "MA" },
  { number: "108", type: "Standard", status: "inspecting", assignee: "Manoj", assigneeInitials: "MA" },
  { number: "402", type: "Deluxe", status: "clean" },
  { number: "318", type: "Club", status: "clean" },
  { number: "210", type: "Standard", status: "clean" },
  { number: "511", type: "Suite", status: "clean" },
  { number: "115", type: "Standard", status: "clean" },
  { number: "224", type: "Deluxe", status: "clean" },
];

export const staff = [
  { name: "Sunita Devi", initials: "SU", assigned: 6, done: 4, current: "Room 301" },
  { name: "Ramesh Kumar", initials: "RA", assigned: 5, done: 3, current: "Room 419" },
  { name: "Lakshmi P.", initials: "LA", assigned: 7, done: 5, current: "Room 215" },
  { name: "Manoj Singh", initials: "MA", assigned: 4, done: 2, current: "Inspecting" },
];

export const revenueTrend = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  thisYear: 120000 + Math.round(Math.sin(i / 3) * 30000 + ((i * 37) % 20000) + i * 1500),
  lastYear: 100000 + Math.round(Math.sin(i / 3) * 25000 + ((i * 29) % 15000) + i * 900),
}));

export const channelMix = [
  { name: "Direct", value: 38, color: "var(--primary)" },
  { name: "Booking.com", value: 28, color: "var(--ai)" },
  { name: "Airbnb", value: 14, color: "var(--info)" },
  { name: "Expedia", value: 10, color: "var(--success)" },
  { name: "MakeMyTrip", value: 10, color: "var(--warning)" },
];

export const aiRateRecs = [
  { date: "Fri Jun 13", current: 8500, ai: 9800, variance: 15 },
  { date: "Sat Jun 14", current: 9000, ai: 11200, variance: 24 },
  { date: "Sun Jun 15", current: 8500, ai: 10500, variance: 23 },
  { date: "Mon Jun 16", current: 7500, ai: 7200, variance: -4 },
  { date: "Tue Jun 17", current: 7500, ai: 7800, variance: 4 },
  { date: "Wed Jun 18", current: 8000, ai: 8400, variance: 5 },
  { date: "Thu Jun 19", current: 8500, ai: 9100, variance: 7 },
];

export const demandForecast = Array.from({ length: 30 }, (_, i) => ({
  day: `Jun ${i + 8}`,
  occupancy: Math.min(100, 55 + Math.round(Math.sin(i / 2.5) * 25 + (i % 7 >= 5 ? 18 : 0) + ((i * 13) % 8))),
}));

export const aiConversations = [
  { role: "user" as const, text: "Why did occupancy drop this week?" },
  {
    role: "ai" as const,
    text: "Occupancy dropped **6.2%** week-over-week (from 90.1% to 83.9%), driven by three factors:\n\n• **Corporate cancellations** — 14 rooms across Tue–Thu from two MICE accounts (Infosys, Wipro)\n• **OTA underperformance** — Expedia bookings down 41% vs prior week; competitor pricing 8% lower\n• **Weather** — Delhi heatwave (47°C) suppressed walk-ins by ~22%",
    chart: "occupancy",
    sources: ["PMS", "Channels", "External"],
  },
  { role: "user" as const, text: "Top revenue opportunities this week" },
  {
    role: "ai" as const,
    text: "I've identified **₹4.2L of upside** across three plays:\n\n• **Push Fri–Sat rate +18%** on Deluxe & Club — demand index 0.91, low cancellation risk → est. ₹1.8L\n• **Upsell suite to 12 returning Gold guests** arriving this week → est. ₹1.4L\n• **Reactivate dormant corporates** — 8 accounts with 90+ day silence, ICICI & HUL highest LTV → est. ₹1.0L",
    sources: ["Revenue", "CRM", "Forecast"],
  },
];
