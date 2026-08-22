export type Tier = "free" | "plus" | "family" | "education";
export type BillingState = "active" | "trial" | "grace" | "expired" | "canceled" | "pending";

export type Entitlement = { feature: string; enabled: boolean; limit?: number; used?: number };
export type Subscription = { tier: Tier; state: BillingState; productId?: string; expiresAt?: string };
export type StoreProduct = { id: string; title: string; priceLabel: string; period: "month" | "year" };

export const PREMIUM_FEATURES = ["unlimited_tutor", "advanced_scans", "advanced_simulations", "physics_lens", "ai_lab_reports", "exam_generator", "personalized_study_plans", "priority_ai"] as const;

export function hasFeature(entitlements: Entitlement[], feature: string): boolean {
  return Boolean(entitlements.find((item) => item.feature === feature && item.enabled));
}

export function remaining(usage: { used: number; limit: number }): number { return Math.max(0, usage.limit - usage.used); }

export function consume(usage: { used: number; limit: number }, cost = 1) {
  if (usage.used + cost > usage.limit) throw new Error("Usage limit reached");
  return { ...usage, used: usage.used + cost };
}

export function gate(entitlements: Entitlement[], feature: string): { allowed: boolean; reason?: "premium" | "limit" } {
  return hasFeature(entitlements, feature) ? { allowed: true } : { allowed: false, reason: "premium" };
}

export function isUsable(state: BillingState): boolean { return state === "active" || state === "trial" || state === "grace"; }

export function buildPaywall(context: "scan" | "tutor" | "lab" | "exam") {
  const benefits = {
    scan: ["More problem scans", "Faster multimodal analysis"],
    tutor: ["More AI tutoring", "Step-by-step physics coaching"],
    lab: ["Physics Lens", "Advanced experiment analysis"],
    exam: ["More exam practice", "Personalized review plans"],
  }[context];
  return { title: "Unlock deeper physics learning", subtitle: "Core learning stays free. Upgrade when premium tools help.", benefits, primary: "See plans", secondary: "Not now" };
}

export function annualSavings(monthly: number, annual: number): number { return Math.max(0, monthly * 12 - annual); }

export interface BillingProvider {
  loadProducts(ids: string[]): Promise<StoreProduct[]>;
  purchase(productId: string): Promise<{ transactionId: string; receipt: string }>;
  restore(): Promise<void>;
}

export async function buy(provider: BillingProvider, productId: string) {
  if (!productId) throw new Error("Product is required");
  return provider.purchase(productId);
}

export const ethicalCopy = { noFakeScarcity: true, noForcedCountdowns: true, clearRenewal: true, clearPricing: true, easyDismiss: true } as const;
