"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#141D35",
              border: "1px solid #253460",
              color: "#F0F4FF",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
