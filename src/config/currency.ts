export type Currency = "BDT" | "USD";

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  rateToUSD: number; // For rough conversion display when needed
}

export const currencies: Record<Currency, CurrencyConfig> = {
  BDT: {
    code: "BDT",
    symbol: "৳",
    name: "Bangladeshi Taka",
    rateToUSD: 0.0083, // ~120 BDT per 1 USD
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    rateToUSD: 1.0,
  },
};

export const defaultCurrency: Currency = "BDT";
