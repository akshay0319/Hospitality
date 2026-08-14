import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Voice AI" };

export default function VoiceAIPage() {
  return <ComingSoon title="Voice AI" breadcrumb="AI Command Center" description="AI voice agents for reservations, front-desk calls, and guest requests — arriving in an upcoming milestone." />;
}
