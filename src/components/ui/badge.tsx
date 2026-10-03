import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "neutral"
    | "primary"
    | "success"
    | "warning"
    | "info"
    | "bestseller"
    | "new";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    neutral: "bg-surface-3 text-ink",
    primary: "bg-primary-tint text-primary-active font-semibold",
    success: "bg-success-tint text-success font-semibold",
    warning: "bg-warning-tint text-warning font-semibold",
    info: "bg-info-tint text-info font-semibold",
    bestseller: "bg-cat-amber text-cat-amber-ink font-bold",
    new: "bg-cat-green text-cat-green-ink font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-badge tracking-tight uppercase select-none",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
