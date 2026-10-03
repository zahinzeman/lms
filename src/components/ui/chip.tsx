import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onClear?: (e: React.MouseEvent) => void;
  leadingIcon?: React.ReactNode;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      className,
      selected = false,
      onClear,
      leadingIcon,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center gap-2 h-9 px-4 rounded-full text-body-sm font-medium transition-colors cursor-pointer select-none whitespace-nowrap",
          "focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
          selected
            ? "bg-ink text-white hover:bg-ink-surface-2"
            : "bg-surface-2 text-ink hover:bg-surface-3 active:bg-surface-4",
          className
        )}
        {...props}
      >
        {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
        <span>{children}</span>
        {onClear && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onClear(e);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onClear(e as any);
              }
            }}
            className="shrink-0 -mr-1.5 p-0.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>
    );
  }
);
Chip.displayName = "Chip";
