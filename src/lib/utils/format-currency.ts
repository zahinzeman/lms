/**
 * Formats minor units (cents / poisha) to currency string.
 * Example: 125000 poisha / cents = ৳1,250 or $1,250.00
 */
export function formatCurrency(
  amountMinor: number,
  currency: "BDT" | "USD" = "BDT"
): string {
  const amount = amountMinor / 100;
  if (currency === "BDT") {
    const formatted = Math.round(amount).toLocaleString("en-IN");
    return `৳${formatted}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatBDT(amountMinor: number): string {
  return formatCurrency(amountMinor, "BDT");
}
