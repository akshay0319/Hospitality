import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-primary text-white shadow-glow-primary/0 hover:shadow-glow-primary hover:brightness-110 active:scale-[0.97]",
        secondary:
          "bg-transparent border border-border text-text-primary hover:bg-base-elevated hover:border-border-strong active:scale-[0.97]",
        ghost:
          "bg-transparent text-text-secondary hover:bg-base-elevated hover:text-text-primary active:scale-[0.97]",
        danger:
          "bg-transparent border border-danger/40 text-danger hover:bg-danger/10 active:scale-[0.97]",
        ai: "bg-gradient-ai border border-ai/40 text-ai-hover shadow-glow-ai/0 hover:shadow-glow-ai active:scale-[0.97]",
        link: "bg-transparent text-primary hover:text-primary-hover underline-offset-4 hover:underline p-0 h-auto",
        icon: "bg-transparent border border-border text-text-secondary hover:bg-base-elevated hover:text-text-primary active:scale-[0.97]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
