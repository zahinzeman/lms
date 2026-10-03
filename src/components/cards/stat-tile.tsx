import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatTileProps {
  label: string;
  value: string | number;
  delta?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  variant?: "surface" | "canvas" | "on-dark";
  className?: string;
}

export function StatTile({
  label,
  value,
  delta,
  isPositive,
  icon,
  variant = "surface",
  className,
}: StatTileProps) {
  const variantClasses = {
    surface: "bg-surface-2 text-ink",
    canvas: "bg-canvas text-ink",
    "on-dark": "bg-ink-surface-2 text-white",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-md flex flex-col gap-2 select-none",
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-caption font-medium opacity-80">{label}</span>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>

      <div className="text-display-xl font-bold tracking-tight">{value}</div>

      {delta && (
        <div className="flex items-center gap-1.5 text-caption-sm font-semibold">
          <span className={isPositive ? "text-success" : "text-error"}>
            {isPositive ? "↑" : "↓"} {delta}
          </span>
          <span className="opacity-60 font-normal">vs previous period</span>
        </div>
      )}
    </div>
  );
}

export interface FeatureTileProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  tint?: "rose" | "blue" | "green" | "amber" | "violet" | "plum";
  variant?: "canvas" | "surface" | "on-dark";
  className?: string;
}

export function FeatureTile({
  icon,
  title,
  description,
  tint = "blue",
  variant = "canvas",
  className,
}: FeatureTileProps) {
  const tintClasses = {
    rose: "bg-cat-rose text-cat-rose-ink",
    blue: "bg-cat-blue text-cat-blue-ink",
    green: "bg-cat-green text-cat-green-ink",
    amber: "bg-cat-amber text-cat-amber-ink",
    violet: "bg-cat-violet text-cat-violet-ink",
    plum: "bg-cat-plum text-cat-plum-ink",
  };

  const bgClasses = {
    canvas: "bg-canvas text-ink",
    surface: "bg-surface-2 text-ink",
    "on-dark": "bg-ink-surface-2 text-white",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-lg flex flex-col gap-3 text-left transition-colors",
        bgClasses[variant],
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center shrink-0 mb-1",
            tintClasses[tint]
          )}
        >
          {React.isValidElement(icon) ? (
            React.cloneElement(icon as React.ReactElement<any>, {
              className: "h-6 w-6 stroke-[1.8]",
            })
          ) : (
            icon
          )}
        </div>
      )}
      <h4 className="text-display-sm font-bold tracking-tight">{title}</h4>
      <p className="text-body-sm opacity-80 leading-relaxed">{description}</p>
    </div>
  );
}
