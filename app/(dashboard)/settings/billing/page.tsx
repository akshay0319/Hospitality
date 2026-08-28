import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return <ComingSoon title="Billing & Subscription" breadcrumb="Settings" description="Your HospitalityOS plan, usage, invoices and payment method — arriving with the commercial launch." />;
}
