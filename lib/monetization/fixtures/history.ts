import { MOCK_EPOCH_ISO } from "@/lib/mock/clock";

export type HistoryKind = "trial" | "conversion" | "renewal" | "cancellation" | "expiration" | "restore";

export type MockHistoryEvent = {
  id: string;
  kind: HistoryKind;
  at: string;
  note: string;
  fictional: true;
};

const KINDS: HistoryKind[] = ["trial", "conversion", "renewal", "cancellation", "expiration", "restore"];

export function subscriptionHistory(count = 40): MockHistoryEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `sub-history-${index + 1}`,
    kind: KINDS[index % KINDS.length],
    at: MOCK_EPOCH_ISO,
    note: `Fictional ${KINDS[index % KINDS.length]} event for QA.`,
    fictional: true as const,
  }));
}

export function entitlementHistory(count = 40): MockHistoryEvent[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `ent-history-${index + 1}`,
    kind: KINDS[index % KINDS.length],
    at: MOCK_EPOCH_ISO,
    note: `Fictional entitlement transition ${index + 1}.`,
    fictional: true as const,
  }));
}

export function usageHistory(count = 40): { id: string; meter: "ai_requests" | "experiments"; used: number; at: string; fictional: true }[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `usage-history-${index + 1}`,
    meter: index % 2 === 0 ? "ai_requests" : "experiments",
    used: index % 6,
    at: MOCK_EPOCH_ISO,
    fictional: true as const,
  }));
}

export function paywallHistory(count = 40): { id: string; action: "first_view" | "repeat_view" | "closed" | "selected_annual" | "purchased"; at: string; fictional: true }[] {
  const actions = ["first_view", "repeat_view", "closed", "selected_annual", "purchased"] as const;
  return Array.from({ length: count }, (_, index) => ({
    id: `paywall-history-${index + 1}`,
    action: actions[index % actions.length],
    at: MOCK_EPOCH_ISO,
    fictional: true as const,
  }));
}

export function syntheticReceipt(productId: string): { kind: "SYNTHETIC_RECEIPT"; productId: string; body: string } {
  return {
    kind: "SYNTHETIC_RECEIPT",
    productId,
    body: `synthetic-not-for-production:${productId}`,
  };
}
