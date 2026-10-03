import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingProps {
  rating: number;
  count?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Rating({
  rating,
  count,
  showCount = true,
  size = "sm",
  className,
}: RatingProps) {
  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizes = {
    sm: "text-body-sm",
    md: "text-title-md",
    lg: "text-display-sm",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5 select-none", className)}>
      <Star
        className={cn(
          "fill-ink text-ink shrink-0",
          iconSizes[size]
        )}
      />
      <span className={cn("font-bold text-ink", textSizes[size])}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={cn("text-muted", textSizes[size])}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
