import type {
  Property,
  Guest,
  Reservation,
  Room,
  RoomType,
  HousekeepingTask,
  StaffMember,
  RevenueMetrics,
  AIRateRecommendation,
  AIAlert,
  AIMessage,
  KPICard,
} from "@/types";

// ─── Property ─────────────────────────────────────────────────────────────────

export const SAMPLE_PROPERTY: Property = {
  id: "prop_001",
  name: "The Grand Meridian",
  brand: "Meridian Hotels",
  chain: "Meridian Group",
  starRating: 5,
  address: "12, Barakhamba Road, Connaught Place",
  city: "New Delhi",
  country: "India",
  timezone: "Asia/Kolkata",
  currency: "INR",
  totalRooms: 142,
  createdAt: "2024-01-15T00:00:00Z",
};

// ─── Room Types ───────────────────────────────────────────────────────────────

export const ROOM_TYPES: RoomType[] = [
  {
    id: "rt_std", name: "Standard Room", code: "STD",
    description: "Comfortable room with city view", maxOccupancy: 2,
    baseRate: 5500, totalCount: 40,
    amenities: ["King Bed", "WiFi", "AC", "Mini Bar", "32\" TV"],
    images: [],
  },
  {
    id: "rt_dlx", name: "Deluxe Room", code: "DLX",
    description: "Spacious room with premium amenities", maxOccupancy: 3,
    baseRate: 7800, totalCount: 50,
    amenities: ["King Bed", "WiFi", "AC", "Mini Bar", "55\" TV", "Bathtub"],
    images: [],
  },
  {
    id: "rt_clb", name: "Club Room", code: "CLB",
    description: "Exclusive club floor access and lounge", maxOccupancy: 2,
    baseRate: 11500, totalCount: 30,
    amenities: ["King Bed", "Club Lounge", "WiFi", "AC", "55\" TV", "Bathtub", "Shower"],
    images: [],
  },
  {
    id: "rt_ste", name: "Suite", code: "STE",
    description: "Luxurious suite with separate living area", maxOccupancy: 4,
    baseRate: 22000, totalCount: 15,
    amenities: ["King Bed", "Living Room", "Club Lounge", "WiFi", "AC", "65\" TV", "Jacuzzi"],
    images: [],
  },
  {
    id: "rt_prs", name: "Presidential Suite", code: "PRS",
    description: "The ultimate luxury experience", maxOccupancy: 6,
    baseRate: 65000, totalCount: 7,
    amenities: ["King Bed", "2 Living Rooms", "Private Dining", "Butler", "Jacuzzi", "Kitchenette"],
    images: [],
  },
];

// ─── Guests ───────────────────────────────────────────────────────────────────

export const SAMPLE_GUESTS: Guest[] = [
  {
    id: "g_001", firstName: "Arjun", lastName: "Malhotra",
    email: "arjun.malhotra@gmail.com", phone: "+91 98765 43210",
    nationality: "Indian", loyaltyTier: "gold", loyaltyPoints: 12450,
    totalStays: 18, totalNights: 42, lifetimeValue: 485000,
    preferences: { roomType: "Deluxe", floor: "high", smoking: false, communicationChannel: "whatsapp" },
    tags: ["VIP", "Regular", "Corporate"],
    createdAt: "2022-03-15T00:00:00Z", lastStay: "2026-05-20T00:00:00Z",
  },
  {
    id: "g_002", firstName: "Priya", lastName: "Sharma",
    email: "priya.sharma@techcorp.com", phone: "+91 87654 32109",
    nationality: "Indian", loyaltyTier: "silver", loyaltyPoints: 3200,
    totalStays: 5, totalNights: 11, lifetimeValue: 124000,
    preferences: { dietary: ["Vegetarian"], smoking: false, earlyCheckIn: true },
    tags: ["Corporate"],
    createdAt: "2024-06-10T00:00:00Z",
  },
  {
    id: "g_003", firstName: "Rahul", lastName: "Gupta",
    email: "rahul.gupta@ventures.in", phone: "+91 76543 21098",
    nationality: "Indian", loyaltyTier: "platinum", loyaltyPoints: 48700,
    totalStays: 52, totalNights: 134, lifetimeValue: 2180000,
    preferences: { roomType: "Suite", floor: "high", pillow: "soft", smoking: false, noDisturbance: true },
    tags: ["VIP", "Platinum", "Owner Reference"],
    createdAt: "2020-01-10T00:00:00Z", lastStay: "2026-06-02T00:00:00Z",
  },
  {
    id: "g_004", firstName: "Neha", lastName: "Joshi",
    email: "neha.joshi@design.io", phone: "+91 65432 10987",
    nationality: "Indian", loyaltyTier: "bronze", loyaltyPoints: 850,
    totalStays: 2, totalNights: 5, lifetimeValue: 42000,
    preferences: { smoking: false, dietary: ["Vegan"] },
    tags: [],
    createdAt: "2026-01-20T00:00:00Z",
  },
  {
    id: "g_005", firstName: "Vikram", lastName: "Singh",
    email: "vikram.singh@infra.com", phone: "+91 54321 09876",
    nationality: "Indian", loyaltyTier: "gold", loyaltyPoints: 9800,
    totalStays: 14, totalNights: 31, lifetimeValue: 320000,
    preferences: { roomType: "Club Room", smoking: false, earlyCheckIn: true },
    tags: ["Corporate", "Regular"],
    createdAt: "2022-11-05T00:00:00Z", lastStay: "2026-04-15T00:00:00Z",
  },
];

// ─── Reservations ─────────────────────────────────────────────────────────────

export const SAMPLE_RESERVATIONS: Reservation[] = [
  {
    id: "r_001", confirmationNumber: "HOS-284731",
    guestId: "g_001", guest: SAMPLE_GUESTS[0],
    roomId: "room_301", roomNumber: "301", roomTypeId: "rt_dlx", roomTypeName: "Deluxe Room",
    checkIn: "2026-06-08", checkOut: "2026-06-11", nights: 3, adults: 2, children: 0,
    ratePlanId: "rp_bar", ratePlanName: "Best Available Rate",
    ratePerNight: 8200, totalAmount: 29028, paidAmount: 29028, balanceDue: 0,
    status: "checked-in", channel: "direct", extras: [],
    createdAt: "2026-06-01T10:00:00Z", updatedAt: "2026-06-08T14:30:00Z",
  },
  {
    id: "r_002", confirmationNumber: "HOS-319482",
    guestId: "g_002", guest: SAMPLE_GUESTS[1],
    roomTypeId: "rt_std", roomTypeName: "Standard Room",
    checkIn: "2026-06-08", checkOut: "2026-06-09", nights: 1, adults: 1, children: 0,
    ratePlanId: "rp_corp", ratePlanName: "Corporate Rate",
    ratePerNight: 5200, totalAmount: 6136, paidAmount: 0, balanceDue: 6136,
    status: "confirmed", channel: "booking.com", extras: [],
    createdAt: "2026-06-05T16:00:00Z", updatedAt: "2026-06-05T16:00:00Z",
  },
  {
    id: "r_003", confirmationNumber: "HOS-198402",
    guestId: "g_003", guest: SAMPLE_GUESTS[2],
    roomId: "room_512", roomNumber: "512", roomTypeId: "rt_ste", roomTypeName: "Suite",
    checkIn: "2026-06-06", checkOut: "2026-06-08", nights: 2, adults: 2, children: 1,
    ratePlanId: "rp_bar", ratePlanName: "Best Available Rate",
    ratePerNight: 24000, totalAmount: 56640, paidAmount: 56640, balanceDue: 0,
    status: "checked-out", channel: "direct", extras: [
      { id: "e_001", name: "Breakfast for 2", price: 1200, quantity: 2 },
      { id: "e_002", name: "Airport Pickup", price: 2500, quantity: 1 },
    ],
    createdAt: "2026-06-01T08:00:00Z", updatedAt: "2026-06-08T11:00:00Z",
  },
  {
    id: "r_004", confirmationNumber: "HOS-421893",
    guestId: "g_004", guest: SAMPLE_GUESTS[3],
    roomId: "room_408", roomNumber: "408", roomTypeId: "rt_dlx", roomTypeName: "Deluxe Room",
    checkIn: "2026-06-07", checkOut: "2026-06-08", nights: 1, adults: 1, children: 0,
    ratePlanId: "rp_bar", ratePlanName: "Best Available Rate",
    ratePerNight: 7800, totalAmount: 9204, paidAmount: 9204, balanceDue: 0,
    status: "checked-in", channel: "airbnb", extras: [],
    createdAt: "2026-06-03T12:00:00Z", updatedAt: "2026-06-07T15:00:00Z",
  },
  {
    id: "r_005", confirmationNumber: "HOS-503921",
    guestId: "g_005", guest: SAMPLE_GUESTS[4],
    roomTypeId: "rt_clb", roomTypeName: "Club Room",
    checkIn: "2026-06-09", checkOut: "2026-06-12", nights: 3, adults: 1, children: 0,
    ratePlanId: "rp_corp", ratePlanName: "Corporate Rate",
    ratePerNight: 10500, totalAmount: 37296, paidAmount: 15000, balanceDue: 22296,
    status: "confirmed", channel: "direct", extras: [
      { id: "e_003", name: "Breakfast Included", price: 900, quantity: 3 },
    ],
    createdAt: "2026-06-04T09:00:00Z", updatedAt: "2026-06-04T09:00:00Z",
  },
];

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const SAMPLE_ROOMS: Room[] = [
  { id: "room_101", number: "101", floor: 1, typeId: "rt_std", typeName: "Standard", status: "clean", isBlocked: false, features: ["City View"] },
  { id: "room_102", number: "102", floor: 1, typeId: "rt_std", typeName: "Standard", status: "dirty", isBlocked: false, features: [] },
  { id: "room_103", number: "103", floor: 1, typeId: "rt_std", typeName: "Standard", status: "cleaning", isBlocked: false, features: [] },
  { id: "room_201", number: "201", floor: 2, typeId: "rt_dlx", typeName: "Deluxe", status: "clean", isBlocked: false, features: ["Garden View"] },
  { id: "room_202", number: "202", floor: 2, typeId: "rt_dlx", typeName: "Deluxe", status: "inspecting", isBlocked: false, features: [] },
  { id: "room_203", number: "203", floor: 2, typeId: "rt_dlx", typeName: "Deluxe", status: "dirty", isBlocked: false, features: [] },
  { id: "room_204", number: "204", floor: 2, typeId: "rt_dlx", typeName: "Deluxe", status: "clean", isBlocked: false, features: ["Pool View"] },
  { id: "room_301", number: "301", floor: 3, typeId: "rt_dlx", typeName: "Deluxe", status: "clean", isBlocked: false, features: ["City View"] },
  { id: "room_302", number: "302", floor: 3, typeId: "rt_dlx", typeName: "Deluxe", status: "maintenance", isBlocked: true, blockReason: "AC Repair", features: [] },
  { id: "room_401", number: "401", floor: 4, typeId: "rt_clb", typeName: "Club", status: "clean", isBlocked: false, features: ["Club Lounge"] },
  { id: "room_408", number: "408", floor: 4, typeId: "rt_dlx", typeName: "Deluxe", status: "clean", isBlocked: false, features: [] },
  { id: "room_501", number: "501", floor: 5, typeId: "rt_ste", typeName: "Suite", status: "clean", isBlocked: false, features: ["Panoramic View"] },
  { id: "room_512", number: "512", floor: 5, typeId: "rt_ste", typeName: "Suite", status: "dirty", isBlocked: false, features: ["Pool View"] },
];

// ─── Housekeeping ─────────────────────────────────────────────────────────────

export const SAMPLE_HK_TASKS: HousekeepingTask[] = [
  { id: "hk_001", roomId: "room_102", roomNumber: "102", floor: 1, taskType: "full-clean", priority: "high", status: "pending", assignedTo: "s_002", assigneeName: "Sunita Devi", estimatedMinutes: 45, nextCheckInTime: "2026-06-08T14:00:00Z" },
  { id: "hk_002", roomId: "room_203", roomNumber: "203", floor: 2, taskType: "full-clean", priority: "urgent", status: "in-progress", assignedTo: "s_001", assigneeName: "Raju Kumar", estimatedMinutes: 45, startedAt: "2026-06-08T10:15:00Z", nextCheckInTime: "2026-06-08T13:00:00Z" },
  { id: "hk_003", roomId: "room_202", roomNumber: "202", floor: 2, taskType: "inspection", priority: "normal", status: "inspecting", assignedTo: "s_003", assigneeName: "Meena Singh", estimatedMinutes: 15 },
  { id: "hk_004", roomId: "room_512", roomNumber: "512", floor: 5, taskType: "full-clean", priority: "urgent", status: "pending", assignedTo: "s_004", assigneeName: "Deepak Yadav", estimatedMinutes: 75, nextCheckInTime: "2026-06-08T15:00:00Z" },
  { id: "hk_005", roomId: "room_103", roomNumber: "103", floor: 1, taskType: "stayover", priority: "normal", status: "in-progress", assignedTo: "s_002", assigneeName: "Sunita Devi", estimatedMinutes: 25, startedAt: "2026-06-08T09:45:00Z" },
  { id: "hk_006", roomId: "room_201", roomNumber: "201", floor: 2, taskType: "turndown", priority: "low", status: "completed", assignedTo: "s_001", assigneeName: "Raju Kumar", estimatedMinutes: 20, completedAt: "2026-06-08T08:30:00Z" },
];

export const SAMPLE_STAFF: StaffMember[] = [
  { id: "s_001", name: "Raju Kumar", role: "Housekeeper", department: "Housekeeping", assignedTasks: 4, completedTasks: 1, currentTask: "Room 203 - Full Clean" },
  { id: "s_002", name: "Sunita Devi", role: "Housekeeper", department: "Housekeeping", assignedTasks: 5, completedTasks: 0, currentTask: "Room 103 - Stayover" },
  { id: "s_003", name: "Meena Singh", role: "Supervisor", department: "Housekeeping", assignedTasks: 3, completedTasks: 2, currentTask: "Room 202 - Inspection" },
  { id: "s_004", name: "Deepak Yadav", role: "Housekeeper", department: "Housekeeping", assignedTasks: 3, completedTasks: 0, currentTask: undefined },
];

// ─── Revenue Metrics ──────────────────────────────────────────────────────────

export const REVENUE_METRICS: RevenueMetrics[] = [
  { date: "2026-06-01", occupancy: 76, adr: 7850, revpar: 5966, totalRevenue: 892000, roomRevenue: 745000, fbRevenue: 147000, roomsSold: 108, roomsAvailable: 142 },
  { date: "2026-06-02", occupancy: 81, adr: 8100, revpar: 6561, totalRevenue: 948000, roomRevenue: 796000, fbRevenue: 152000, roomsSold: 115, roomsAvailable: 142 },
  { date: "2026-06-03", occupancy: 79, adr: 7980, revpar: 6304, totalRevenue: 921000, roomRevenue: 768000, fbRevenue: 153000, roomsSold: 112, roomsAvailable: 142 },
  { date: "2026-06-04", occupancy: 72, adr: 7500, revpar: 5400, totalRevenue: 854000, roomRevenue: 706000, fbRevenue: 148000, roomsSold: 102, roomsAvailable: 142 },
  { date: "2026-06-05", occupancy: 68, adr: 7200, revpar: 4896, totalRevenue: 795000, roomRevenue: 652000, fbRevenue: 143000, roomsSold: 97, roomsAvailable: 142 },
  { date: "2026-06-06", occupancy: 82, adr: 8350, revpar: 6847, totalRevenue: 971000, roomRevenue: 812000, fbRevenue: 159000, roomsSold: 116, roomsAvailable: 142 },
  { date: "2026-06-07", occupancy: 88, adr: 8900, revpar: 7832, totalRevenue: 1087000, roomRevenue: 921000, fbRevenue: 166000, roomsSold: 125, roomsAvailable: 142 },
  { date: "2026-06-08", occupancy: 84, adr: 8230, revpar: 6913, totalRevenue: 1024000, roomRevenue: 862000, fbRevenue: 162000, roomsSold: 119, roomsAvailable: 142 },
];

// ─── AI Rate Recommendations ──────────────────────────────────────────────────

export const AI_RATE_RECOMMENDATIONS: AIRateRecommendation[] = [
  { date: "2026-06-09", roomTypeId: "rt_std", roomTypeName: "Standard", currentRate: 5500, recommendedRate: 6200, variance: 700, variancePercent: 12.7, demandScore: 82, reason: "Weekend demand surge + cricket match at Feroz Shah Kotla" },
  { date: "2026-06-09", roomTypeId: "rt_dlx", roomTypeName: "Deluxe", currentRate: 7800, recommendedRate: 9100, variance: 1300, variancePercent: 16.7, demandScore: 85, reason: "High weekend demand — competitors priced at ₹9,500+" },
  { date: "2026-06-10", roomTypeId: "rt_std", roomTypeName: "Standard", currentRate: 5500, recommendedRate: 6500, variance: 1000, variancePercent: 18.2, demandScore: 88, reason: "Sunday peak — school holiday weekend" },
  { date: "2026-06-11", roomTypeId: "rt_dlx", roomTypeName: "Deluxe", currentRate: 7800, recommendedRate: 6900, variance: -900, variancePercent: -11.5, demandScore: 55, reason: "Monday post-weekend — low business travel. Suggest discount." },
  { date: "2026-06-12", roomTypeId: "rt_clb", roomTypeName: "Club Room", currentRate: 11500, recommendedRate: 12800, variance: 1300, variancePercent: 11.3, demandScore: 74, reason: "Corporate conference in CP area — mid-week demand spike" },
];

// ─── KPI Cards ────────────────────────────────────────────────────────────────

export const DASHBOARD_KPIS: KPICard[] = [
  { label: "Occupancy Today", value: "84%", previousValue: "81%", trend: 3.7, trendLabel: "vs yesterday", isPositiveTrend: true, icon: "building-2", color: "#4F6EF7", format: "percent" },
  { label: "Available Rooms", value: 23, previousValue: 27, trend: -14.8, trendLabel: "vs yesterday", isPositiveTrend: true, icon: "bed-double", color: "#10B981", format: "number" },
  { label: "Arrivals Today", value: 18, previousValue: 12, trend: 50, trendLabel: "vs yesterday", isPositiveTrend: true, icon: "log-in", color: "#06B6D4", format: "number" },
  { label: "Departures Today", value: 12, previousValue: 15, trend: -20, trendLabel: "vs yesterday", isPositiveTrend: false, icon: "log-out", color: "#F59E0B", format: "number" },
  { label: "Revenue Today", value: 187450, previousValue: 164200, trend: 14.2, trendLabel: "vs yesterday", isPositiveTrend: true, icon: "indian-rupee", color: "#10B981", format: "currency" },
];

// ─── AI Alerts ────────────────────────────────────────────────────────────────

export const AI_ALERTS: AIAlert[] = [
  { id: "al_001", title: "Occupancy Risk — This Weekend", description: "Sunday Jun 9 shows 23% unsold rooms vs 8% same day last week. Consider a flash promotion.", severity: "high", module: "Revenue", timestamp: "2026-06-08T08:00:00Z", isRead: false },
  { id: "al_002", title: "Competitor Price Drop Detected", description: "The Leela Palace reduced Suite rates by ₹8,000 for June 10-12. Review your positioning.", severity: "medium", module: "Channel Manager", timestamp: "2026-06-08T06:30:00Z", isRead: false },
  { id: "al_003", title: "Housekeeping Backlog Building", description: "7 rooms pending clean. 3 check-ins expected before 2 PM. Auto-reassignment recommended.", severity: "high", module: "Housekeeping", timestamp: "2026-06-08T10:00:00Z", isRead: false },
  { id: "al_004", title: "Room 302 Maintenance Overdue", description: "AC repair ticket open for 48 hours. Room blocked and unavailable for upcoming peak weekend.", severity: "medium", module: "Maintenance", timestamp: "2026-06-07T14:00:00Z", isRead: true },
  { id: "al_005", title: "High-Value Guest Arriving Tomorrow", description: "Vikram Singh (Platinum, ₹32L LTV) arrives Jun 9. Recommend suite upgrade offer.", severity: "low", module: "CRM", timestamp: "2026-06-08T07:00:00Z", isRead: false },
];

// ─── AI Copilot Sample Conversations ─────────────────────────────────────────

export const AI_SAMPLE_CONVERSATIONS: AIMessage[] = [
  {
    id: "m_001", role: "user", content: "Why did occupancy drop this week?",
    timestamp: "2026-06-08T09:00:00Z",
  },
  {
    id: "m_002", role: "assistant",
    content: `I analyzed your occupancy data from June 1–8 against the same period last year. Here's what I found:\n\n**Root cause: Mid-week slump on Jun 4–5 (72% and 68%)**\n\n- **Corporate travel down 18%** — Two large corporate accounts (Infosys, TCS block bookings) shifted to a competitor property in Aerocity that opened last month.\n- **OTA rate mismatch** — Your Expedia rates were ₹1,200 higher than Booking.com for those dates, causing lower conversions on Expedia (your second-biggest channel).\n- **No local events** — Jun 4–5 had no conferences or events in CP area, unlike the previous week which had the retail summit.\n\n**What's recovering:** Weekend Jun 7–8 bounced back to 84–88% — in line with seasonality.\n\n**Recommended actions:**\n1. Re-engage the Infosys account with a revised corporate rate\n2. Sync Expedia rates with Booking.com parity\n3. Run a flash deal for next mid-week via email to past guests`,
    timestamp: "2026-06-08T09:00:05Z",
    dataSources: ["PMS", "CRM", "Channel Manager", "Revenue"],
    hasChart: true,
  },
  {
    id: "m_003", role: "user", content: "Show me rooms likely to stay unsold this weekend",
    timestamp: "2026-06-08T09:05:00Z",
  },
  {
    id: "m_004", role: "assistant",
    content: `Based on current booking pace and demand signals, here are the **rooms at highest unsold risk this Sunday (Jun 9):**\n\n| Room Type | Available | Booking Pace | Risk |\n|---|---|---|---|\n| Standard | 14 rooms | Slow | 🔴 High |\n| Deluxe | 8 rooms | Moderate | 🟡 Medium |\n| Club Room | 3 rooms | Good | 🟢 Low |\n\n**Why Standard rooms are at risk:**\n- Booking.com shows 12 Standard rooms available at ₹5,500 — but 3 competing hotels are at ₹4,800\n- Your last-minute conversion for Sunday is historically 40% below weekday average\n\n**AI Recommendation:** Drop Standard rate to ₹4,900 for Jun 9 only via a "Tonight Deal" on Booking.com. Based on price elasticity data, this should convert 8–10 of the 14 rooms and generate ₹43,000–₹49,000 additional revenue vs ₹0 for unsold rooms.`,
    timestamp: "2026-06-08T09:05:04Z",
    dataSources: ["PMS", "Revenue", "Channel Manager"],
    hasChart: false,
    actions: [
      { label: "Apply Recommended Rate", prompt: "Apply ₹4,900 rate for Standard rooms on Jun 9" },
      { label: "Send Flash Deal Email", prompt: "Send flash deal email to past guests for this Sunday" },
    ],
  },
];

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const ACTIVITY_FEED = [
  { id: "act_001", type: "check-in", message: "Arjun Malhotra checked into Room 301", time: "2 min ago", icon: "log-in", color: "#10B981" },
  { id: "act_002", type: "booking", message: "New booking from Booking.com — Priya Sharma", time: "8 min ago", icon: "calendar-plus", color: "#4F6EF7" },
  { id: "act_003", type: "housekeeping", message: "Room 202 marked as Clean and Inspected", time: "12 min ago", icon: "sparkles", color: "#10B981" },
  { id: "act_004", type: "ai-alert", message: "AI Alert: Housekeeping backlog detected — 7 rooms", time: "22 min ago", icon: "brain", color: "#8B5CF6" },
  { id: "act_005", type: "check-out", message: "Rahul Gupta checked out from Room 512", time: "35 min ago", icon: "log-out", color: "#6B7280" },
  { id: "act_006", type: "payment", message: "Payment received ₹56,640 — Reservation HOS-198402", time: "35 min ago", icon: "indian-rupee", color: "#F59E0B" },
  { id: "act_007", type: "booking", message: "Airbnb sync — 2 new reservations imported", time: "1 hr ago", icon: "refresh-cw", color: "#06B6D4" },
  { id: "act_008", type: "maintenance", message: "Room 302 — Maintenance ticket raised: AC Repair", time: "2 hr ago", icon: "tool", color: "#F97316" },
];
