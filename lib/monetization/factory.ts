import { Platform } from "react-native";
import type { BillingPort } from "./billing-port";
import { isProductionRuntime } from "@/lib/mock/config";
import { MockBillingAdapter } from "./mock-adapter";
import { AndroidBillingAdapter, IosBillingAdapter, UnavailableBillingAdapter } from "./platform-adapters";
import { shouldUseMockBilling, type BillingFactoryOptions } from "./factory-policy";

export type { BillingFactoryOptions } from "./factory-policy";
export { shouldUseMockBilling, describeBillingBoundary } from "./factory-policy";

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
  if (Platform.OS === "ios") {
    return new IosBillingAdapter({ userId: options.userId, locale: options.locale });
  }
  if (Platform.OS === "android") {
    return new AndroidBillingAdapter({ userId: options.userId, locale: options.locale });
  }
  return new UnavailableBillingAdapter();
}
