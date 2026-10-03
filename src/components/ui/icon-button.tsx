import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "surface" | "ghost" | "on-dark";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", variant = "surface", children, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    };

    const variantClasses = {
      surface: "bg-surface-2 text-ink hover:bg-surface-3 active:bg-surface-4",
      ghost: "bg-transparent text-ink hover:bg-surface-2 active:bg-surface-3",
      "on-dark": "bg-ink-surface-2 text-white hover:bg-ink-surface-3 active:bg-ink",
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none select-none",
          "focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
