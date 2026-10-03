import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6",
        className
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-display-xl text-ink font-bold tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-body-md text-muted max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-3">{action}</div>}
    </div>
  );
}

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-8", className)}>
      <div className="space-y-1">
        {eyebrow && (
          <span className="text-micro text-primary font-bold tracking-wider uppercase block">
            {eyebrow}
          </span>
        )}
        <h2 className="text-display-2xl text-ink font-bold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-body-md text-muted max-w-xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
