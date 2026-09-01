export type Tier = "free" | "plus" | "family" | "education";
export type BillingState = "active" | "trial" | "grace" | "expired" | "canceled" | "pending";

export type Entitlement = { feature: string; enabled: boolean; limit?: number; used?: number };
export type Subscription = { tier: Tier; state: BillingState; productId?: string; expiresAt?: string };
export type EntitlementStatus = "free" | "active" | "trial" | "grace" | "pending" | "expired" | "canceled" | "unavailable";
export type EntitlementSnapshot = { providerAvailable: boolean; subscription?: Subscription };
export type EntitlementResult = { status: EntitlementStatus; premiumAvailable: boolean };

const VALID_TIERS: readonly Tier[] = ["free", "plus", "family", "education"];
const VALID_BILLING_STATES: readonly BillingState[] = ["active", "trial", "grace", "expired", "canceled", "pending"];

export function isValidSubscription(value: unknown): value is Subscription {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Subscription>;
  if (!VALID_TIERS.includes(candidate.tier as Tier) || !VALID_BILLING_STATES.includes(candidate.state as BillingState)) return false;
  if (candidate.productId !== undefined && (typeof candidate.productId !== "string" || candidate.productId.trim().length === 0)) return false;
  if (candidate.expiresAt !== undefined && (typeof candidate.expiresAt !== "string" || !Number.isFinite(Date.parse(candidate.expiresAt)))) return false;
  return true;
}

export function getEntitlementStatus(snapshot: EntitlementSnapshot, now = Date.now()): EntitlementResult {
  if (!snapshot || snapshot.providerAvailable !== true) return { status: "unavailable", premiumAvailable: false };
  if (!snapshot.subscription) return { status: "free", premiumAvailable: false };
  if (!isValidSubscription(snapshot.subscription)) return { status: "unavailable", premiumAvailable: false };
  if (snapshot.subscription.tier === "free") return { status: "free", premiumAvailable: false };
  if (isExpired(snapshot.subscription, now)) return { status: "expired", premiumAvailable: false };
  if (!isUsable(snapshot.subscription.state)) return { status: snapshot.subscription.state, premiumAvailable: false };
  return { status: snapshot.subscription.state, premiumAvailable: true };
}
export type StoreProduct = { id: string; title: string; priceLabel: string; period: "month" | "year" };

export const PREMIUM_FEATURES = ["unlimited_tutor", "advanced_scans", "advanced_simulations", "physics_lens", "ai_lab_reports", "exam_generator", "personalized_study_plans", "priority_ai"] as const;

export function hasFeature(entitlements: Entitlement[], feature: string): boolean {
  return Boolean(entitlements.find((item) => item.feature === feature && item.enabled));
}

export function remaining(usage: { used: number; limit: number }): number {
  const used = Number.isFinite(usage.used) ? Math.max(0, usage.used) : 0;
  const limit = Number.isFinite(usage.limit) ? Math.max(0, usage.limit) : 0;
  return Math.max(0, limit - used);
}

export function consume(usage: { used: number; limit: number }, cost = 1) {
  if (!Number.isFinite(usage.used) || !Number.isFinite(usage.limit) || !Number.isFinite(cost) || usage.used < 0 || usage.limit <= 0 || cost <= 0) throw new Error("Invalid usage state");
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

export function annualSavings(monthly: number, annual: number): number {
  if (!Number.isFinite(monthly) || !Number.isFinite(annual) || monthly < 0 || annual < 0) return 0;
  return Math.max(0, monthly * 12 - annual);
}

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

const VALID_PERIODS: readonly StoreProduct["period"][] = ["month", "year"];

export function isValidProduct(product: Product): boolean {
  if (!product || typeof product !== "object") return false;
  const candidate = product as Partial<Product>;
  const strings = [candidate.id, candidate.storeProductId, candidate.title, candidate.description, candidate.priceLabel];
  return strings.every((value) => typeof value === "string" && value.trim().length > 0)
    && VALID_TIERS.includes(candidate.plan as Tier)
    && VALID_PERIODS.includes(candidate.period as StoreProduct["period"])
    && !/^(unknown|tbd|to be replaced|\$0(?:\.00)?)$/i.test(String(candidate.priceLabel).trim());
}

export function validateCatalog(products: Product[]): Product[] {
  if (!Array.isArray(products)) return [];
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
  const retryCount = Number.isFinite(attempts) ? Math.max(0, Math.floor(attempts)) : 0;
  for (let index = 0; index <= retryCount; index += 1) {
    try { return await operation(); } catch (error) { lastError = error; }
  }
  throw lastError instanceof Error ? lastError : new Error("Purchase failed");
}

export function isExpired(subscription: Subscription, now = Date.now()): boolean {
  if (!subscription.expiresAt) return false;
  const timestamp = Date.parse(subscription.expiresAt);
  return !Number.isFinite(timestamp) || timestamp <= now;
}

export function canUseSubscription(subscription: Subscription, now = Date.now()): boolean {
  return isValidSubscription(subscription) && subscription.tier !== "free" && isUsable(subscription.state) && !isExpired(subscription, now);
}
