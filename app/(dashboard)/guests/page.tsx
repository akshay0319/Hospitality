"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Plus, Crown, X, Mail, Phone, MapPin, Loader2, Users, Repeat, Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { Badge } from "@/components/ui-kit";
import { guestsService } from "@/lib/services/guests.service";
import { analyticsService } from "@/lib/services/analytics.service";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/mappers";

interface ApiGuest {
  id: string; firstName: string; lastName: string; email?: string | null; phone?: string | null;
  nationality?: string | null; loyaltyTier: string; loyaltyPoints: number;
  totalStays: number; totalNights: number; lifetimeValue: string | number;
  isVip: boolean; tags?: string[] | null;
}

const TIER_TONE: Record<string, "warning" | "muted" | "info" | "ai"> = {
  PLATINUM: "ai", GOLD: "warning", SILVER: "info", BRONZE: "muted",
};

export default function GuestsPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["guests", search],
    queryFn: () => guestsService.findAll({ limit: 100, search: search || undefined }),
    retry: false,
  });
  const { data: stats } = useQuery({
    queryKey: ["guest-stats"],
    queryFn: () => analyticsService.getGuestStats() as Promise<{ total: number; vip: number; returning: number; newGuests: number }>,
    retry: false,
  });

  const guests = (data?.data as ApiGuest[] | undefined) ?? [];

  return (
    <>
      <AppHeader title="Guest Profiles" breadcrumb="Guests" />
      <div className="flex-1 space-y-5 p-6">
        {/* Stat row */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={Users} label="Total Guests" value={stats?.total ?? guests.length} tone="text-primary bg-primary-muted/60" />
          <StatTile icon={Crown} label="VIP Guests" value={stats?.vip ?? guests.filter((g) => g.isVip).length} tone="text-[color:var(--ai-hover)] bg-[color:var(--ai-muted)]/60" />
          <StatTile icon={Repeat} label="Returning" value={stats?.returning ?? 0} tone="text-success bg-success-muted/60" />
          <StatTile icon={Sparkles} label="New Guests" value={stats?.newGuests ?? 0} tone="text-info bg-info-muted/60" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
            <Search className="h-3.5 w-3.5 text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-tertiary focus:outline-none"
            />
          </div>
          <button className="flex h-9 items-center gap-1.5 rounded-md gradient-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-glow-primary hover:brightness-110">
            <Plus className="h-3.5 w-3.5" /> New Guest
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-border bg-background/40">
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                  <th className="px-4 py-2.5">Guest</th>
                  <th className="px-4 py-2.5">Contact</th>
                  <th className="px-4 py-2.5">Tier</th>
                  <th className="px-4 py-2.5 text-right">Points</th>
                  <th className="px-4 py-2.5 text-right">Stays</th>
                  <th className="px-4 py-2.5 text-right">Nights</th>
                  <th className="px-4 py-2.5 text-right">Lifetime Value</th>
                  <th className="px-4 py-2.5">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" /></td></tr>
                )}
                {!isLoading && guests.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px] text-muted-foreground">No guests found.</td></tr>
                )}
                {guests.map((g) => (
                  <tr key={g.id} onClick={() => setSelectedId(g.id)}
                    className={cn("cursor-pointer text-[13px] transition hover:bg-white/[0.02]", selectedId === g.id && "bg-primary-muted/30")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary-muted text-[11px] font-bold text-primary">
                          {initials(g.firstName, g.lastName)}
                          {g.isVip && <Crown className="absolute -right-1 -top-1 h-3 w-3 text-[color:var(--ai-hover)]" />}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{g.firstName} {g.lastName}</div>
                          <div className="text-[11px] text-tertiary">{g.nationality ?? "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[12px] text-muted-foreground">{g.email ?? "—"}</div>
                      <div className="text-[11px] text-tertiary">{g.phone ?? ""}</div>
                    </td>
                    <td className="px-4 py-3"><Badge tone={TIER_TONE[g.loyaltyTier]}>{g.loyaltyTier}</Badge></td>
                    <td className="px-4 py-3 text-right tabular text-muted-foreground">{g.loyaltyPoints.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 text-right tabular text-muted-foreground">{g.totalStays}</td>
                    <td className="px-4 py-3 text-right tabular text-muted-foreground">{g.totalNights}</td>
                    <td className="px-4 py-3 text-right tabular font-medium text-foreground">{inr(Number(g.lifetimeValue))}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(g.tags ?? []).slice(0, 2).map((t) => (
                          <span key={t} className="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedId && <GuestDrawer guestId={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  );
}

function StatTile({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-surface to-elevated p-4">
      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tone)}><Icon className="h-4 w-4" /></div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-tertiary">{label}</div>
      <div className="mt-1 font-display text-[24px] font-bold tabular leading-none text-foreground">{value}</div>
    </div>
  );
}

interface GuestDetail extends ApiGuest {
  preferences?: { pillowType?: string | null; dietaryRestrictions?: string[] | null; smokingRoom?: boolean; earlyCheckIn?: boolean; lateCheckOut?: boolean } | null;
  reservations?: { id: string; confirmationNumber: string; checkIn: string; checkOut: string; nights: number; totalAmount: string | number; status: string; roomType?: { name?: string } }[];
  loyaltyTxns?: { id: string; points: number; type: string; description: string; createdAt: string }[];
}

function GuestDrawer({ guestId, onClose }: { guestId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["guest", guestId],
    queryFn: () => guestsService.findOne(guestId) as Promise<GuestDetail>,
    retry: false,
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <aside onClick={(e) => e.stopPropagation()}
        className="relative h-full w-full max-w-[440px] overflow-y-auto border-l border-border bg-surface shadow-elevated animate-slide-in-right">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-3 backdrop-blur">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Guest Profile</div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-elevated hover:text-foreground"><X className="h-4 w-4" /></button>
        </header>

        {isLoading || !data ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-muted text-[16px] font-bold text-primary">
                {initials(data.firstName, data.lastName)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-[20px] font-semibold leading-tight">{data.firstName} {data.lastName}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge tone={TIER_TONE[data.loyaltyTier]}>{data.loyaltyTier}</Badge>
                  {data.isVip && <Badge tone="ai"><Crown className="h-3 w-3" /> VIP</Badge>}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Points" value={data.loyaltyPoints.toLocaleString("en-IN")} />
              <MiniStat label="Stays" value={String(data.totalStays)} />
              <MiniStat label="LTV" value={inr(Number(data.lifetimeValue), { compact: true })} />
            </div>

            <Section title="Contact">
              <Row icon={<Mail className="h-3.5 w-3.5" />} value={data.email ?? "—"} />
              <Row icon={<Phone className="h-3.5 w-3.5" />} value={data.phone ?? "—"} />
              <Row icon={<MapPin className="h-3.5 w-3.5" />} value={data.nationality ?? "—"} />
            </Section>

            {data.preferences && (
              <Section title="Preferences">
                {data.preferences.pillowType && <PrefRow label="Pillow" value={data.preferences.pillowType} />}
                {data.preferences.dietaryRestrictions?.length ? <PrefRow label="Dietary" value={data.preferences.dietaryRestrictions.join(", ")} /> : null}
                <PrefRow label="Early check-in" value={data.preferences.earlyCheckIn ? "Yes" : "No"} />
                <PrefRow label="Late check-out" value={data.preferences.lateCheckOut ? "Yes" : "No"} />
                <PrefRow label="Smoking room" value={data.preferences.smokingRoom ? "Yes" : "No"} />
              </Section>
            )}

            <Section title={`Stay History (${data.reservations?.length ?? 0})`}>
              {(data.reservations ?? []).length === 0 && <p className="text-[12px] text-muted-foreground">No stays yet.</p>}
              {(data.reservations ?? []).map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b border-border/60 py-2 last:border-0">
                  <div>
                    <div className="text-[12px] font-medium text-foreground">{r.roomType?.name ?? "Room"}</div>
                    <div className="text-[11px] text-tertiary">{r.checkIn.slice(0, 10)} → {r.checkOut.slice(0, 10)} · {r.nights}n</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] tabular font-medium">{inr(Number(r.totalAmount))}</div>
                    <div className="text-[10px] text-tertiary">{r.status.replace(/_/g, " ").toLowerCase()}</div>
                  </div>
                </div>
              ))}
            </Section>

            <Section title="Guest Insights">
              <PrefRow label="Avg spend / stay" value={data.totalStays ? inr(Number(data.lifetimeValue) / data.totalStays, { compact: true }) : "—"} />
              <PrefRow
                label="Upcoming stays"
                value={String((data.reservations ?? []).filter((r) => new Date(r.checkIn) > new Date() && (r.status === "CONFIRMED" || r.status === "PENDING")).length)}
              />
              <PrefRow label="Avg nights / stay" value={data.totalStays ? (data.totalNights / data.totalStays).toFixed(1) : "—"} />
            </Section>

            {data.loyaltyTxns?.length ? (
              <Section title="Loyalty Activity">
                {data.loyaltyTxns.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center justify-between border-b border-border/60 py-1.5 text-[12px] last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-foreground">{t.description}</div>
                      <div className="text-[10px] text-tertiary">{t.createdAt.slice(0, 10)} · {t.type}</div>
                    </div>
                    <span className={cn("ml-2 tabular font-semibold", t.points >= 0 ? "text-success" : "text-danger")}>
                      {t.points >= 0 ? "+" : ""}{t.points.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </Section>
            ) : null}

            {data.tags?.length ? (
              <Section title="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.map((t) => <span key={t} className="rounded-md bg-elevated px-2 py-0.5 text-[11px] text-muted-foreground">{t}</span>)}
                </div>
              </Section>
            ) : null}
          </div>
        )}
      </aside>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-2.5 text-center">
      <div className="font-display text-[15px] font-bold tabular text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-tertiary">{label}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-tertiary">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ icon, value }: { icon: React.ReactNode; value: React.ReactNode }) {
  return <div className="flex items-center gap-2 py-1 text-[12px] text-muted-foreground"><span className="text-tertiary">{icon}</span>{value}</div>;
}
function PrefRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between py-1 text-[12px]"><span className="text-muted-foreground">{label}</span><span className="text-foreground">{value}</span></div>;
}
