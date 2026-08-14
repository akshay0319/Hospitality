import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency in Indian locale */
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format number in Indian locale (1,87,450) */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/** Format percentage */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format date */
export function formatDate(date: string | Date, pattern = "dd MMM yyyy"): string {
  return format(new Date(date), pattern);
}

/** Format relative time */
export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Truncate text */
export function truncate(text: string, length = 30): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

/** Get initials from name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Calculate trend direction */
export function getTrend(current: number, previous: number): { value: number; isPositive: boolean } {
  if (previous === 0) return { value: 0, isPositive: true };
  const diff = ((current - previous) / previous) * 100;
  return { value: Math.abs(diff), isPositive: diff >= 0 };
}

/** Generate confirmation number */
export function generateConfirmationNumber(): string {
  const prefix = "HOS";
  const num = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix}-${num}`;
}

/** Get status color class */
export function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    "checked-in": "status-checked-in",
    "checked-out": "status-checked-out",
    confirmed: "status-confirmed",
    pending: "status-pending",
    cancelled: "status-cancelled",
    maintenance: "status-maintenance",
    dirty: "status-dirty",
    cleaning: "status-cleaning",
    clean: "status-clean",
    inspecting: "status-inspecting",
  };
  return map[status.toLowerCase()] ?? "status-confirmed";
}

/** Debounce function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
