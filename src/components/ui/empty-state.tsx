import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tint?: "rose" | "blue" | "green" | "amber" | "violet" | "plum";
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  tint = "rose",
  className,
}: EmptyStateProps) {
  const tintClasses = {
    rose: "bg-cat-rose text-cat-rose-ink",
    blue: "bg-cat-blue text-cat-blue-ink",
    green: "bg-cat-green text-cat-green-ink",
    amber: "bg-cat-amber text-cat-amber-ink",
    violet: "bg-cat-violet text-cat-violet-ink",
    plum: "bg-cat-plum text-cat-plum-ink",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-md mx-auto",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center mb-4 shrink-0",
            tintClasses[tint]
          )}
        >
          {React.isValidElement(icon) ? (
            React.cloneElement(icon as React.ReactElement<any>, {
              className: "h-8 w-8 stroke-[1.8]",
            })
          ) : (
            icon
          )}
        </div>
      )}
      <h3 className="text-display-sm text-ink font-bold mb-1.5">{title}</h3>
      {description && (
        <p className="text-body-sm text-muted mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
