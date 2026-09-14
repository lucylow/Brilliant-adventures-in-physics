import type { BillingPort } from "./billing-port";
import { createBillingPort } from "./factory";
import { catalogProducts, createDemoCatalog, findCatalogProduct, type ProductCatalog } from "./catalog";
import { getEntitlements, emptyEntitlements } from "./entitlements";
import { createBillingMachine, reduceBillingMachine, type BillingMachineSnapshot } from "./state-machine";
import { mapBillingError } from "./errors";
import { trackMonetizationEvent } from "./analytics";
import { writeEntitlementCache, clearEntitlementCache, readEntitlementCache, offlinePremiumAllowed } from "./cache";
import { emptyUsageSnapshot, type UsageSnapshot } from "./usage";
import type { CatalogProduct, CustomerEntitlements, Entitlements, PaywallVariantId, PurchaseResult, RestoreResult } from "./types";
import type { MockBillingScenarioId } from "./scenarios";
import { MockBillingAdapter } from "./mock-adapter";
import { assignPaywallVariant } from "./variants";

export type MonetizationStore = {
  ready: boolean;
  catalog: ProductCatalog | null;
  products: CatalogProduct[];
  selectedProductId?: string;
  machine: BillingMachineSnapshot;
  entitlements: Entitlements;
  customer?: CustomerEntitlements;
  usage: UsageSnapshot;
  connected: boolean;
  errorMessage: string | null;
  userId: string | null;
  variantId: PaywallVariantId;
  returnTo?: string;
};

type Listener = (store: MonetizationStore) => void;

const listeners = new Set<Listener>();
let port: BillingPort | null = null;
let initStarted = false;

let store: MonetizationStore = {
  ready: false,
  catalog: null,
  products: [],
  machine: createBillingMachine(),
  entitlements: emptyEntitlements(),
  usage: emptyUsageSnapshot(),
  connected: true,
  errorMessage: null,
  userId: null,
  variantId: "standard",
};

function emit(): void {
  for (const listener of listeners) listener(store);
}

function patch(partial: Partial<MonetizationStore>): void {
  store = { ...store, ...partial };
  emit();
}

export function getMonetizationStore(): MonetizationStore {
  return store;
}

export function subscribeMonetization(listener: Listener): () => void {
  listeners.add(listener);
  listener(store);
  return () => listeners.delete(listener);
}

export function getBillingPort(): BillingPort | null {
  return port;
}

export async function initializeMonetization(options?: { userId?: string | null; scenarioId?: MockBillingScenarioId }): Promise<void> {
  if (initStarted) return;
  initStarted = true;
  port = createBillingPort({ userId: options?.userId ?? undefined, scenarioId: options?.scenarioId });
  patch({ userId: options?.userId ?? null, variantId: assignPaywallVariant(options?.userId ?? "anonymous", "free").id });
  const cached = await readEntitlementCache();
  if (cached && cached.userId === (options?.userId ?? null) && offlinePremiumAllowed(cached)) {
    patch({ entitlements: { ...cached.entitlements, cache: "stale" } });
  }
  try {
    await Promise.race([
      port.initialize(),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    patch({ ready: true, errorMessage: null });
    return;
  }
  try {
    const products = await port.getProducts();
    const catalog = createDemoCatalog();
    const customer = await port.getCustomerEntitlements();
    const entitlements = getEntitlements({
      snapshot: { providerAvailable: customer.providerAvailable, subscription: customer.subscription },
      customer,
      lifetimeOwned: customer.lifetimeOwned,
    });
    patch({
      ready: true,
      catalog,
      products,
      customer,
      entitlements,
      machine: reduceBillingMachine(store.machine, { type: "PRODUCTS_LOADED" }),
      selectedProductId: products.find((item) => item.isFeatured)?.id ?? products[0]?.id,
    });
  } catch {
    patch({ ready: true, catalog: null, products: [], machine: reduceBillingMachine(store.machine, { type: "PRODUCTS_FAILED" }) });
  }
}

export async function refreshEntitlements(): Promise<Entitlements> {
  if (!port) return store.entitlements;
  try {
    const customer = await port.getCustomerEntitlements();
    const entitlements = getEntitlements({
      snapshot: { providerAvailable: customer.providerAvailable, subscription: customer.subscription },
      customer,
      lifetimeOwned: customer.lifetimeOwned,
    });
    patch({ customer, entitlements });
    await writeEntitlementCache({ entitlements, snapshot: { providerAvailable: customer.providerAvailable, subscription: customer.subscription }, customer, userId: store.userId });
    return entitlements;
  } catch {
    return store.entitlements;
  }
}

export async function purchaseSelected(): Promise<PurchaseResult> {
  if (!port) return { status: "failed" };
  const productId = store.selectedProductId;
  if (!productId || store.machine.inFlight) return { status: "failed" };
  patch({ machine: reduceBillingMachine(store.machine, { type: "PURCHASE" }, productId), errorMessage: null });
  trackMonetizationEvent("purchase_started", { productId });
  try {
    const result = await port.purchaseProduct(productId);
    if (result.status === "pending") {
      patch({ machine: reduceBillingMachine(store.machine, { type: "PURCHASE_PENDING" }) });
      trackMonetizationEvent("purchase_pending", { productId });
      return result;
    }
    if (result.status === "succeeded") {
      patch({ machine: reduceBillingMachine(store.machine, { type: "PURCHASE_SUCCEEDED" }) });
      trackMonetizationEvent("purchase_succeeded", { productId });
      patch({ machine: reduceBillingMachine(store.machine, { type: "SYNC" }) });
      await refreshEntitlements();
      patch({ machine: reduceBillingMachine(store.machine, { type: "ENTITLED" }) });
      return result;
    }
    const message = result.error?.userMessage ?? "Purchase did not complete.";
    patch({ machine: reduceBillingMachine(store.machine, { type: "PURCHASE_FAILED" }), errorMessage: message });
    trackMonetizationEvent("purchase_failed", { productId, code: result.error?.code ?? "unknown" });
    return result;
  } catch (error) {
    const mapped = mapBillingError(error);
    patch({ machine: reduceBillingMachine(store.machine, { type: "PURCHASE_FAILED" }), errorMessage: mapped.userMessage });
    trackMonetizationEvent("purchase_failed", { productId, code: mapped.code });
    return { status: "failed", productId, error: mapped.toShape() };
  }
}

export async function restorePurchases(): Promise<RestoreResult> {
  if (!port || store.machine.inFlight) return { outcome: "failed", productIds: [] };
  patch({ machine: reduceBillingMachine(store.machine, { type: "RESTORE" }), errorMessage: null });
  trackMonetizationEvent("restore_started");
  try {
    const result = await port.restorePurchases();
    if (result.outcome === "failed") {
      patch({ machine: reduceBillingMachine(store.machine, { type: "RESTORE_FAILED" }), errorMessage: result.error?.userMessage ?? "Restore failed." });
      trackMonetizationEvent("restore_failed", { code: result.error?.code ?? "unknown" });
      return result;
    }
    await refreshEntitlements();
    const entitled = store.entitlements.lifetimeOwned || store.entitlements.status === "unlimited" || store.entitlements.status === "trial";
    if (result.outcome === "nothing_found" || !entitled) {
      patch({ machine: reduceBillingMachine(store.machine, { type: "RESTORE_SUCCEEDED" }) });
      trackMonetizationEvent("restore_succeeded", { found: false });
      return { ...result, outcome: "nothing_found" };
    }
    patch({ machine: reduceBillingMachine(store.machine, { type: "RESTORE_SUCCEEDED" }) });
    trackMonetizationEvent("restore_succeeded", { found: true });
    patch({ machine: reduceBillingMachine(store.machine, { type: "ENTITLED" }) });
    return result;
  } catch (error) {
    const mapped = mapBillingError(error);
    patch({ machine: reduceBillingMachine(store.machine, { type: "RESTORE_FAILED" }), errorMessage: mapped.userMessage });
    trackMonetizationEvent("restore_failed", { code: mapped.code });
    return { outcome: "failed", productIds: [], error: mapped.toShape() };
  }
}

export function selectPlan(productId: string): void {
  if (store.machine.inFlight) return;
  if (!store.products.some((product) => product.id === productId)) return;
  patch({ selectedProductId: productId });
  trackMonetizationEvent("plan_selected", { productId });
}

export function setPaywallReturnTo(route?: string): void {
  patch({ returnTo: route });
}

export async function onAccountChange(userId: string | null): Promise<void> {
  await clearEntitlementCache();
  patch({ userId, entitlements: emptyEntitlements(), customer: undefined });
  initStarted = false;
  await initializeMonetization({ userId });
}

export async function onSignOut(): Promise<void> {
  await onAccountChange(null);
}

export function setMockScenario(id: MockBillingScenarioId): void {
  if (port instanceof MockBillingAdapter) {
    port.setScenario(id);
    void refreshEntitlements();
  }
}

export function setConnected(connected: boolean): void {
  patch({ connected });
}

export function setUsageSnapshot(usage: UsageSnapshot): void {
  patch({ usage });
}

export function selectedProduct(): CatalogProduct | undefined {
  if (!store.selectedProductId) return store.products[0];
  return findCatalogProduct(store.catalog ?? createDemoCatalog(), store.selectedProductId) ?? store.products.find((item) => item.id === store.selectedProductId);
}

export function availableProducts(): CatalogProduct[] {
  return store.catalog ? catalogProducts(store.catalog) : store.products;
}

export function resetMonetizationRuntime(): void {
  initStarted = false;
  port = null;
  store = {
    ready: false,
    catalog: null,
    products: [],
    machine: createBillingMachine(),
    entitlements: emptyEntitlements(),
    usage: emptyUsageSnapshot(),
    connected: true,
    errorMessage: null,
    userId: null,
    variantId: "standard",
  };
}
