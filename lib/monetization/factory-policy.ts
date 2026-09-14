import { isProductionRuntime } from "@/lib/mock/config";
import { getMonetizationConfig } from "./config";
import type { MockBillingScenarioId } from "./scenarios";

export type BillingFactoryOptions = {
  forceMock?: boolean;
  scenarioId?: MockBillingScenarioId;
  userId?: string;
  locale?: string;
  currencyCode?: string;
};

export function shouldUseMockBilling(options: BillingFactoryOptions = {}): boolean {
  if (isProductionRuntime()) return false;
  const config = getMonetizationConfig();
  if (!config.allowMockBilling) return false;
  if (options.forceMock) return true;
  if (config.environment === "test") return true;
  if (config.environment === "development") return true;
  return false;
}

export function describeBillingBoundary(): string {
  return [
    "B.A.V. does not ship a native IAP SDK in this Expo managed build.",
    "Development and tests use MockBillingAdapter.",
    "Production must use a StoreKit 2 / Play Billing adapter once product IDs are configured.",
    "No client boolean can mark a user as premium.",
  ].join(" ");
}
