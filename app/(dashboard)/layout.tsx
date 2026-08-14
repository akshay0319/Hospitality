"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/sidebar";
import { TourProvider } from "@/components/tour/tour";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import { tokenStore } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  const router = useRouter();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) {
      router.replace("/login");
      return;
    }
    // Validate token / hydrate user, but don't block render on it.
    fetchMe().catch(() => {});
    setReady(true);
  }, [router, fetchMe]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <TourProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <main
          className={cn(
            "flex min-w-0 flex-1 flex-col transition-all duration-200",
            sidebarCollapsed ? "lg:pl-[64px]" : "lg:pl-[248px]",
          )}
        >
          {children}
        </main>
      </div>
    </TourProvider>
  );
}
