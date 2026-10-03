import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" | "dark" | "secondary" | "ghost" | "link" | "on-dark";
  size?: "sm" | "md" | "lg" | "icon";
  shape?: "rounded" | "pill";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      shape = "rounded",
      loading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const variantClasses = {
      primary: "bg-primary text-on-primary hover:bg-primary-active active:bg-primary-active disabled:bg-primary-soft disabled:text-on-primary",
      dark: "bg-ink text-white hover:bg-ink-surface-2 active:bg-ink-surface-3 disabled:bg-surface-4 disabled:text-muted-soft",
      secondary: "bg-surface-2 text-ink hover:bg-surface-3 active:bg-surface-4 disabled:bg-surface-1 disabled:text-muted-soft",
      ghost: "bg-transparent text-ink hover:bg-surface-2 active:bg-surface-3 disabled:text-muted-soft",
      link: "bg-transparent text-ink underline-offset-4 hover:underline disabled:text-muted-soft p-0 h-auto",
      "on-dark": "bg-white text-ink hover:bg-surface-2 active:bg-surface-3 disabled:bg-surface-3 disabled:text-muted-soft",
    };

    const sizeClasses = {
      sm: "h-9 px-3.5 text-body-sm font-medium",
      md: "h-11 px-5 text-title-md font-semibold",
      lg: "h-12 px-7 text-title-md font-semibold",
      icon: "h-10 w-10 p-0 flex items-center justify-center",
    };

    const shapeClasses = {
      rounded: "rounded-sm",
      pill: "rounded-full",
    };

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer select-none",
          "focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
          "disabled:pointer-events-none disabled:cursor-not-allowed",
          variantClasses[variant],
          variant !== "link" && sizeClasses[size],
          shapeClasses[shape],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
