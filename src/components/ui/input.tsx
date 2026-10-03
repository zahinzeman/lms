import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-caption text-ink font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full h-12 px-4 rounded-sm text-body-md text-ink transition-colors",
              "bg-surface-2 hover:bg-surface-3 focus:bg-canvas",
              "placeholder:text-muted-soft",
              "focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "bg-error-tint focus:bg-canvas",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-caption-sm text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-caption-sm text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
