import type { Reservation, ResStatus } from "@/lib/sample-data";

// ── Enum → display maps ────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, ResStatus> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked-in",
  CHECKED_OUT: "checked-out",
  CANCELLED: "cancelled",
  NO_SHOW: "cancelled",
};

const CHANNEL_MAP: Record<string, string> = {
  DIRECT: "Direct",
  BOOKING_COM: "Booking.com",
  AIRBNB: "Airbnb",
  EXPEDIA: "Expedia",
  AGODA: "Agoda",
  MAKEMYTRIP: "MakeMyTrip",
  GOIBIBO: "Goibibo",
  PHONE: "Phone",
  WALK_IN: "Walk-in",
  OTHER: "Other",
};

const LOYALTY_MAP: Record<string, Reservation["loyalty"]> = {
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
  // BRONZE → undefined (no badge shown)
};

export function initials(first?: string, last?: string): string {
  return `${(first?.[0] ?? "").toUpperCase()}${(last?.[0] ?? "").toUpperCase()}`;
}

function isoToDate(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}

// ── Backend reservation → UI Reservation ──────────────────────────────────────

export interface ApiReservation {
  id: string;
  confirmationNumber: string;
  guestId?: string;
  roomId?: string | null;
  roomTypeId?: string;
  ratePlanId?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalAmount: string | number;
  specialRequests?: string | null;
  status: string;
  channel: string;
  guest?: { firstName?: string; lastName?: string; loyaltyTier?: string };
  room?: { number?: string } | null;
  roomType?: { id?: string; name?: string };
  ratePlan?: { id?: string; name?: string; code?: string };
}

export function mapReservation(r: ApiReservation): Reservation {
  return {
    id: r.confirmationNumber || r.id,
    guest: `${r.guest?.firstName ?? ""} ${r.guest?.lastName ?? ""}`.trim() || "Guest",
    initials: initials(r.guest?.firstName, r.guest?.lastName),
    room: r.room?.number ?? "—",
    roomType: r.roomType?.name ?? "—",
    checkIn: isoToDate(r.checkIn),
    checkOut: isoToDate(r.checkOut),
    nights: r.nights,
    adults: r.adults,
    children: r.children,
    rate: r.ratePlan?.code ?? r.ratePlan?.name ?? "BAR",
    amount: Number(r.totalAmount) || 0,
    status: STATUS_MAP[r.status] ?? "confirmed",
    channel: CHANNEL_MAP[r.channel] ?? r.channel,
    loyalty: r.guest?.loyaltyTier ? LOYALTY_MAP[r.guest.loyaltyTier] : undefined,
  };
}
