import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s — HospitalityOS AI",
    default: "HospitalityOS AI — The Operating System of Your Property",
  },
  description:
    "AI-first Hospitality Operating System for Hotels, Resorts, and Vacation Rentals. PMS, Revenue Management, AI Copilot, Voice AI — all in one platform.",
  keywords: ["Hotel Management System", "PMS", "Revenue Management", "AI Hospitality", "Hotel Software"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${sora.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
