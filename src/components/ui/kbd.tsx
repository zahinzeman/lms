import { cn } from "@/lib/utils";

export function Kbd({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded-xs bg-surface-3 px-1.5 py-0.5 text-[11px] font-mono font-medium text-ink select-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
