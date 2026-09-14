import { isMockEntitlementsEnabled } from "./config";
import { getMockDataset } from "./registry";
import type { Entitlement, EntitlementSnapshot, Subscription } from "@/lib/monetization";

/**
 * Development-only entitlements. Never treat these as a real purchase confirmation.
 * Production builds always see mock entitlements as disabled.
 */
export const MOCK_ENTITLEMENTS_ENABLED = "MOCK_ENTITLEMENTS_ENABLED" as const;

export function getMockEntitlementSnapshot(): EntitlementSnapshot {
  if (!isMockEntitlementsEnabled()) {
    return { providerAvailable: false };
  }
  const dataset = getMockDataset();
  return {
    providerAvailable: true,
    subscription: dataset.subscription,
  };
}

export function getMockEntitlements(): Entitlement[] {
  if (!isMockEntitlementsEnabled()) return [];
  return [...getMockDataset().entitlements];
}

export function getMockSubscription(): Subscription | undefined {
  if (!isMockEntitlementsEnabled()) return undefined;
  return getMockDataset().subscription;
}
