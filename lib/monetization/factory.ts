import { Platform } from "react-native";
import { isProductionRuntime } from "@/lib/mock/config";
import type { BillingPort } from "./billing-port";
import { getMonetizationConfig } from "./config";
import { MockBillingAdapter } from "./mock-adapter";
import { AndroidBillingAdapter, IosBillingAdapter, UnavailableBillingAdapter } from "./platform-adapters";
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

export function createBillingPort(options: BillingFactoryOptions = {}): BillingPort {
  if (isProductionRuntime() && options.forceMock) {
    throw new Error("Mock billing cannot be created in production");
  }
  if (shouldUseMockBilling(options)) {
    return new MockBillingAdapter({
      userId: options.userId,
      locale: options.locale,
      currencyCode: options.currencyCode,
      scenarioId: options.scenarioId,
    });
  }
  if (Platform.OS === "ios") return new IosBillingAdapter({ userId: options.userId, locale: options.locale });
  if (Platform.OS === "android") return new AndroidBillingAdapter({ userId: options.userId, locale: options.locale });
  return new UnavailableBillingAdapter();
}

export function describeBillingBoundary(): string {
  return [
    "B.A.V. does not ship a native IAP SDK in this Expo managed build.",
    "Development and tests use MockBillingAdapter.",
    "Production must use a StoreKit 2 / Play Billing adapter once product IDs are configured.",
    "No client boolean can mark a user as premium.",
  ].join(" ");
}
