// ─── Property / Tenant ───────────────────────────────────────────────────────

export interface Property {
  id: string;
  name: string;
  brand?: string;
  chain?: string;
  starRating: number;
  address: string;
  city: string;
  country: string;
  timezone: string;
  currency: string;
  totalRooms: number;
  logo?: string;
  createdAt: string;
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export type RoomStatus = "clean" | "dirty" | "cleaning" | "inspecting" | "maintenance" | "blocked";

export interface RoomType {
  id: string;
  name: string;
  code: string;
  description: string;
  maxOccupancy: number;
  baseRate: number;
  amenities: string[];
  images: string[];
  totalCount: number;
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  typeId: string;
  typeName: string;
  status: RoomStatus;
  isBlocked: boolean;
  blockReason?: string;
  features: string[];
}

// ─── Guest ────────────────────────────────────────────────────────────────────

export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  idType?: string;
  idNumber?: string;
  dateOfBirth?: string;
  loyaltyTier?: LoyaltyTier;
  loyaltyPoints: number;
  totalStays: number;
  totalNights: number;
  lifetimeValue: number;
  preferences: GuestPreferences;
  tags: string[];
  avatar?: string;
  createdAt: string;
  lastStay?: string;
}

export interface GuestPreferences {
  roomType?: string;
  floor?: string;
  pillow?: string;
  dietary?: string[];
  smoking: boolean;
  extraBed?: boolean;
  earlyCheckIn?: boolean;
  lateCheckOut?: boolean;
  noDisturbance?: boolean;
  communicationChannel?: "email" | "sms" | "whatsapp";
}

// ─── Reservation ──────────────────────────────────────────────────────────────

export type ReservationStatus =
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "cancelled"
  | "no-show"
  | "pending";

export type BookingChannel =
  | "direct"
  | "booking.com"
  | "airbnb"
  | "expedia"
  | "agoda"
  | "makemytrip"
  | "goibibo"
  | "phone"
  | "walk-in";

export interface Reservation {
  id: string;
  confirmationNumber: string;
  guestId: string;
  guest: Guest;
  roomId?: string;
  roomNumber?: string;
  roomTypeId: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  ratePlanId: string;
  ratePlanName: string;
  ratePerNight: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: ReservationStatus;
  channel: BookingChannel;
  specialRequests?: string;
  extras: ReservationExtra[];
  createdAt: string;
  updatedAt: string;
}

export interface ReservationExtra {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// ─── Housekeeping ─────────────────────────────────────────────────────────────

export type TaskPriority = "urgent" | "high" | "normal" | "low";
export type TaskType = "full-clean" | "stayover" | "turndown" | "deep-clean" | "inspection";
export type TaskStatus = "pending" | "in-progress" | "inspecting" | "completed" | "skipped";

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  floor: number;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string;
  assigneeName?: string;
  estimatedMinutes: number;
  startedAt?: string;
  completedAt?: string;
  nextCheckInTime?: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  assignedTasks: number;
  completedTasks: number;
  currentTask?: string;
}

// ─── Revenue ──────────────────────────────────────────────────────────────────

export interface RatePlan {
  id: string;
  name: string;
  code: string;
  type: "bar" | "corporate" | "ota" | "package" | "group";
  description?: string;
  restrictions?: {
    minStay?: number;
    maxStay?: number;
    ctaWeekdays?: number[];
    ctdWeekdays?: number[];
  };
}

export interface RevenueMetrics {
  date: string;
  occupancy: number;
  adr: number;
  revpar: number;
  totalRevenue: number;
  roomRevenue: number;
  fbRevenue: number;
  roomsSold: number;
  roomsAvailable: number;
}

export interface AIRateRecommendation {
  date: string;
  roomTypeId: string;
  roomTypeName: string;
  currentRate: number;
  recommendedRate: number;
  variance: number;
  variancePercent: number;
  demandScore: number;
  reason: string;
  accepted?: boolean;
}

// ─── Analytics / KPIs ─────────────────────────────────────────────────────────

export interface KPICard {
  label: string;
  value: string | number;
  previousValue?: string | number;
  trend?: number;
  trendLabel?: string;
  isPositiveTrend?: boolean;
  icon: string;
  color?: string;
  format?: "number" | "currency" | "percent";
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  dataSources?: string[];
  hasChart?: boolean;
  chartData?: unknown;
  actions?: AIAction[];
}

export interface AIAction {
  label: string;
  prompt: string;
}

export interface AIAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  module: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  isAI?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── User / Auth ──────────────────────────────────────────────────────────────

export type UserRole = "owner" | "gm" | "revenue-manager" | "front-desk" | "housekeeping" | "maintenance";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  propertyId: string;
  avatar?: string;
  permissions: string[];
}
