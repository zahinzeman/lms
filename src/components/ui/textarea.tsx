import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-caption text-ink font-medium">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full min-h-[100px] p-4 rounded-sm text-body-md text-ink transition-colors resize-y",
            "bg-surface-2 hover:bg-surface-3 focus:bg-canvas",
            "placeholder:text-muted-soft",
            "focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "bg-error-tint focus:bg-canvas",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-caption-sm text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-caption-sm text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
