import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "AI Concierge" };

export default function ConciergePage() {
  return <ComingSoon title="AI Concierge" breadcrumb="AI Command Center" description="Omni-channel guest assistant over WhatsApp, web and app — order room service, book a cab, ask about amenities. Wiring goes live once a WhatsApp Business (or Twilio) account is connected." />;
}
