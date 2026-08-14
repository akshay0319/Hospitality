import { AppHeader } from "@/components/layout/header";
import { Construction } from "lucide-react";

export function ComingSoon({
  title,
  breadcrumb,
  description = "This module is on the roadmap and lands in an upcoming milestone.",
}: {
  title: string;
  breadcrumb?: string;
  description?: string;
}) {
  return (
    <>
      <AppHeader title={title} breadcrumb={breadcrumb} />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--ai)]/25 bg-[color:var(--ai-muted)]/30">
            <Construction className="h-7 w-7 text-[color:var(--ai-hover)]" />
          </div>
          <h2 className="font-display text-[22px] font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[11px] font-semibold text-tertiary">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" /> In development
          </div>
        </div>
      </div>
    </>
  );
}
