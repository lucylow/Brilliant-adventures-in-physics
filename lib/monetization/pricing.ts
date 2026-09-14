const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "CLP"]);

export function microsToMajor(amountMicros: number, currencyCode: string): number {
  if (!Number.isFinite(amountMicros) || amountMicros < 0) return 0;
  return ZERO_DECIMAL.has(currencyCode.toUpperCase()) ? amountMicros / 1_000_000 : amountMicros / 1_000_000;
}

export function formatStorePrice(amountMicros: number | null, currencyCode: string, locale = "en-US"): string | null {
  if (amountMicros === null || !Number.isFinite(amountMicros) || amountMicros < 0) return null;
  const currency = currencyCode.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return null;
  const major = microsToMajor(amountMicros, currency);
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(major);
  } catch {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(major);
    } catch {
      return null;
    }
  }
}

export function formatLocalizedPrice(input: {
  amountMicros: number | null;
  currencyCode: string;
  locale?: string;
  storeDisplayPrice?: string | null;
}): string | null {
  if (input.storeDisplayPrice && input.storeDisplayPrice.trim().length > 0) return input.storeDisplayPrice.trim();
  return formatStorePrice(input.amountMicros, input.currencyCode, input.locale ?? "en-US");
}

export function periodLabel(period: "none" | "monthly" | "annual" | "lifetime"): string {
  if (period === "monthly") return "month";
  if (period === "annual") return "year";
  if (period === "lifetime") return "one-time";
  return "";
}

export function formatPriceWithPeriod(displayPrice: string | null, period: "none" | "monthly" | "annual" | "lifetime"): string {
  if (!displayPrice) return "Price unavailable";
  if (period === "monthly") return `${displayPrice} / month`;
  if (period === "annual") return `${displayPrice} / year`;
  if (period === "lifetime") return `${displayPrice} one-time`;
  return displayPrice;
}

export const SUPPORTED_DEMO_CURRENCIES = ["USD", "CAD", "EUR", "GBP", "JPY", "AUD"] as const;

export type SupportedDemoCurrency = (typeof SUPPORTED_DEMO_CURRENCIES)[number];

const DEMO_FX_FROM_USD: Record<SupportedDemoCurrency, number> = {
  USD: 1,
  CAD: 1.36,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 149,
  AUD: 1.52,
};

export function convertDemoMicros(amountMicrosUsd: number, currency: SupportedDemoCurrency): number {
  const factor = DEMO_FX_FROM_USD[currency];
  return Math.round(amountMicrosUsd * factor);
}

export function longPriceStressLabel(currencyCode = "USD", locale = "de-DE"): string {
  return formatStorePrice(12_345_678_900, currencyCode, locale) ?? "12.345.678,90";
}
