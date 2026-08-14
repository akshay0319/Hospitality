import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-text-tertiary pointer-events-none">{leftIcon}</span>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "flex h-9 w-full rounded-md bg-base border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary",
              "transition-all duration-150",
              "focus:outline-none focus:border-primary focus:shadow-input",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-text-tertiary pointer-events-none">{rightIcon}</span>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md bg-base border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary",
          "transition-all duration-150",
          "focus:outline-none focus:border-primary focus:shadow-input",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
