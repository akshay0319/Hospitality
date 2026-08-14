import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Channel Manager" };

export default function ChannelsPage() {
  return <ComingSoon title="Channel Manager" breadcrumb="Revenue" description="OTA connections, rate parity, and inventory sync across Booking.com, Expedia, and more — arriving in an upcoming milestone." />;
}
