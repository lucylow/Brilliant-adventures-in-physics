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

export type PlanId = Tier;
export type PurchaseState = "idle" | "loading" | "pending" | "success" | "cancelled" | "failed" | "restoring";
export type PurchaseSession = { state: PurchaseState; productId?: string; error?: string };
export type Product = StoreProduct & { plan: PlanId; storeProductId: string; description: string };
export type PurchaseReceipt = { transactionId: string; productId: string; receipt?: unknown };

export interface StoreAdapter {
  initialize(): Promise<void>;
  loadProducts(ids: string[]): Promise<Product[]>;
  purchase(productId: string): Promise<PurchaseReceipt>;
  restore(): Promise<PurchaseReceipt[]>;
  openManageSubscriptions(): Promise<void>;
}

export interface ProductRepository { listProducts(): Promise<Product[]>; getProduct(id: string): Promise<Product | undefined> }

export function isValidProduct(product: Product): boolean {
  return Boolean(product.id && product.storeProductId && product.plan && product.title && product.description && product.priceLabel && !/^(unknown|tbd|to be replaced|\$0(?:\.00)?)$/i.test(product.priceLabel));
}

export function validateCatalog(products: Product[]): Product[] {
  return products.filter(isValidProduct).filter((product, index, all) => all.findIndex((candidate) => candidate.id === product.id) === index);
}

export function purchaseReducer(state: PurchaseSession, action: { type: "START"; productId: string } | { type: "PENDING" } | { type: "SUCCESS" } | { type: "CANCEL" } | { type: "RESTORE" } | { type: "ERROR"; message: string }): PurchaseSession {
  switch (action.type) {
    case "START": return { state: "loading", productId: action.productId };
    case "PENDING": return { ...state, state: "pending" };
    case "SUCCESS": return { ...state, state: "success", error: undefined };
    case "CANCEL": return { ...state, state: "cancelled", error: undefined };
    case "RESTORE": return { state: "restoring" };
    case "ERROR": return { ...state, state: "failed", error: action.message };
    default: return state;
  }
}

export function mapPurchaseError(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "unknown";
  return ({ cancelled: "Purchase cancelled.", network: "Connection problem. Try again.", timeout: "The store took too long to respond. Try again.", not_allowed: "Purchases are unavailable on this device.", unknown: "We couldn't complete the purchase." } as Record<string, string>)[code] ?? "We couldn't complete the purchase.";
}

export async function retryPurchase<T>(operation: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let index = 0; index <= attempts; index += 1) {
    try { return await operation(); } catch (error) { lastError = error; }
  }
  throw lastError instanceof Error ? lastError : new Error("Purchase failed");
}

export function isExpired(subscription: Subscription, now = Date.now()): boolean {
  return Boolean(subscription.expiresAt && Number.isFinite(Date.parse(subscription.expiresAt)) && Date.parse(subscription.expiresAt) <= now);
}

export function canUseSubscription(subscription: Subscription, now = Date.now()): boolean {
  return isUsable(subscription.state) && !isExpired(subscription, now);
}
