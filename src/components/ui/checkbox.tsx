"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    accent?: "primary" | "ink";
  }
>(({ className, accent = "ink", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-xs bg-surface-4 transition-colors cursor-pointer select-none",
      "focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      accent === "primary"
        ? "data-[state=checked]:bg-primary data-[state=checked]:text-on-primary"
        : "data-[state=checked]:bg-ink data-[state=checked]:text-white",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
