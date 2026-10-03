import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface PriceProps {
  priceMinor: number;
  compareAtPriceMinor?: number | null;
  currency?: "BDT" | "USD";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Price({
  priceMinor,
  compareAtPriceMinor,
  currency = "BDT",
  className,
  size = "md",
}: PriceProps) {
  const isFree = priceMinor === 0;
  const hasDiscount =
    compareAtPriceMinor && compareAtPriceMinor > priceMinor && !isFree;

  const discountPercent = hasDiscount
    ? Math.round(
        ((compareAtPriceMinor - priceMinor) / compareAtPriceMinor) * 100
      )
    : 0;

  const sizeClasses = {
    sm: "text-body-sm font-semibold",
    md: "text-title-md font-bold",
    lg: "text-display-md font-bold",
  };

  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className || ""}`}>
      <span className={`text-ink ${sizeClasses[size]}`}>
        {isFree ? "Free" : formatCurrency(priceMinor, currency)}
      </span>

      {hasDiscount && (
        <>
          <span className="text-body-sm text-muted line-through font-normal">
            {formatCurrency(compareAtPriceMinor, currency)}
          </span>
          <Badge variant="primary">
            {discountPercent}% OFF
          </Badge>
        </>
      )}
    </div>
  );
}
