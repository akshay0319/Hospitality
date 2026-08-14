import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-2xs font-semibold border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary border-primary/30",
        secondary: "bg-base-elevated text-text-secondary border-border",
        success: "bg-success/15 text-success border-success/30",
        warning: "bg-warning/15 text-warning border-warning/30",
        danger: "bg-danger/15 text-danger border-danger/30",
        info: "bg-info/15 text-info border-info/30",
        ai: "bg-ai/15 text-ai-hover border-ai/30",
        outline: "bg-transparent border-border text-text-secondary",
        // Reservation statuses
        "checked-in": "status-checked-in border",
        "checked-out": "status-checked-out border",
        confirmed: "status-confirmed border",
        pending: "status-pending border",
        cancelled: "status-cancelled border",
        maintenance: "status-maintenance border",
        // Room statuses
        dirty: "status-dirty border",
        cleaning: "status-cleaning border",
        clean: "status-clean border",
        inspecting: "status-inspecting border",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
