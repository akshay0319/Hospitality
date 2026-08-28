"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageSquare, ArrowRight, Megaphone } from "lucide-react";
import { AppHeader } from "@/components/layout/header";
import { guestsService } from "@/lib/services/guests.service";

export default function CommsPage() {
  const campaigns = useQuery({ queryKey: ["comms-campaigns"], queryFn: () => guestsService.listCampaigns(), retry: false });
  const list = campaigns.data ?? [];
  const totalReach = list.reduce((s, c) => s + (c.audienceCount ?? 0), 0);

  return (
    <>
      <AppHeader title="Communications" breadcrumb="Guests" />
      <div className="flex-1 space-y-5 p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Stat label="Campaigns" value={String(list.length)} icon={<Megaphone className="h-4 w-4" />} />
          <Stat label="Total reach" value={totalReach.toLocaleString()} icon={<Mail className="h-4 w-4" />} />
          <Stat label="Channels" value="Email" icon={<MessageSquare className="h-4 w-4" />} />
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-foreground">Campaigns</h3>
          <Link href="/crm" className="flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary-hover">Create in CRM <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-10 text-center text-[13px] text-muted-foreground">
            No campaigns yet. Head to <Link href="/crm" className="font-semibold text-primary hover:underline">CRM</Link> to draft one with AI.
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-foreground">{c.name}</span>
                  <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{c.status}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-tertiary">{c.segment} · {c.audienceCount} recipients · {new Date(c.createdAt).toLocaleDateString()}</div>
                {c.subject && <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground"><Mail className="h-3.5 w-3.5 text-tertiary" /> {c.subject}</div>}
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-tertiary">Delivery over email/SMS/WhatsApp activates once a provider is connected — see <Link href="/settings/integrations" className="text-primary hover:underline">Integrations</Link>.</p>
      </div>
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-tertiary">{icon}<span className="text-[11px] uppercase tracking-wider">{label}</span></div>
      <div className="mt-1 font-display text-[20px] font-bold tabular leading-none text-foreground">{value}</div>
    </div>
  );
}
