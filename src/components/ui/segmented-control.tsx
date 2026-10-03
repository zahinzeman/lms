"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: "h-9 p-0.5 text-body-sm",
    md: "h-11 p-1 text-title-md",
    lg: "h-12 p-1.5 text-title-md",
  };

  const itemSizeClasses = {
    sm: "px-3 py-1",
    md: "px-4 py-1.5",
    lg: "px-5 py-2",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center bg-surface-2 rounded-full select-none",
        sizeClasses[size],
        className
      )}
      role="tablist"
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 cursor-pointer",
              "focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
              itemSizeClasses[size],
              isSelected
                ? "bg-canvas text-ink font-semibold"
                : "text-muted hover:text-ink hover:bg-surface-3/50"
            )}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
