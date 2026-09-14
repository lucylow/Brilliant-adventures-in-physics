import { catalogProducts, createDemoCatalog, findCatalogProduct } from "./catalog";
import { addDays, defaultClock, monetizationIso } from "./clock";
import { BillingUnavailableError, PaymentFailedError, ProductUnavailableError, PurchaseCancelledError, PurchasePendingError, RestoreFailedError, StoreNotConfiguredError, errorFromCode } from "./errors";
import type { BillingAdapterOptions, BillingPort, PurchaseUpdateListener } from "./billing-port";
import type { BillingTransaction, CatalogProduct, CustomerEntitlements, ManagementDestination, PurchaseResult, RestoreResult } from "./types";
import { MOCK_BILLING_SCENARIOS, type MockBillingScenario, type MockBillingScenarioId } from "./scenarios";

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function syntheticTransaction(productId: string, state: BillingTransaction["state"]): BillingTransaction {
  return {
    id: `synthetic.mock.${productId}.${state}`,
    productId,
    storeProductId: productId,
    platform: "mock",
    state,
    purchasedAt: state === "purchased" || state === "restored" ? monetizationIso() : undefined,
    synthetic: true,
  };
}

function entitlementsFromScenario(scenario: MockBillingScenario): CustomerEntitlements {
  const productIds: string[] = [];
  if (scenario.lifetimeOwned && scenario.subscription?.productId) productIds.push(scenario.subscription.productId);
  else if (scenario.subscription?.productId && (scenario.subscription.state === "active" || scenario.subscription.state === "trial" || scenario.subscription.state === "grace")) {
    productIds.push(scenario.subscription.productId);
  }
  return {
    activeProductIds: productIds,
    subscription: scenario.subscription,
    lifetimeOwned: scenario.lifetimeOwned,
    trial: {
      available: scenario.trialState !== "ineligible",
      periodDays: 7,
      state: scenario.trialState,
      endsAt: scenario.subscription?.expiresAt,
    },
    rawEntitlements: [],
    providerAvailable: scenario.providerAvailable,
    refreshedAt: monetizationIso(),
  };
}

export class MockBillingAdapter implements BillingPort {
  readonly kind = "mock" as const;
  readonly platform = "mock" as const;
  private scenario: MockBillingScenario;
  private listeners = new Set<PurchaseUpdateListener>();
  private initialized = false;
  private lastPurchaseId: string | null = null;
  private lastRestoreAt = 0;

  constructor(
    private readonly options: BillingAdapterOptions & { scenarioId?: MockBillingScenarioId } = {},
  ) {
    this.scenario = MOCK_BILLING_SCENARIOS[options.scenarioId ?? "FREE_USER"];
  }

  setScenario(id: MockBillingScenarioId): void {
    this.scenario = MOCK_BILLING_SCENARIOS[id];
  }

  getScenario(): MockBillingScenario {
    return this.scenario;
  }

  async initialize(): Promise<void> {
    await delay(this.scenario.syncDelayMs);
    this.initialized = true;
  }

  async getProducts(): Promise<CatalogProduct[]> {
    if (!this.initialized) await this.initialize();
    if (this.scenario.configurationError) throw new StoreNotConfiguredError();
    if (!this.scenario.connected) throw errorFromCode("offline");
    if (!this.scenario.providerAvailable) throw new BillingUnavailableError("mock");
    if (!this.scenario.productsAvailable) return [];
    if (this.scenario.productsLoading) await delay(this.scenario.syncDelayMs || 400);
    return catalogProducts(createDemoCatalog({ locale: this.options.locale, currencyCode: this.options.currencyCode }));
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (this.lastPurchaseId === productId) {
      return { status: "pending", productId, error: new PurchasePendingError().toShape() };
    }
    this.lastPurchaseId = productId;
    try {
      if (!this.scenario.connected) return { status: "failed", productId, error: errorFromCode("offline").toShape() };
      if (this.scenario.configurationError || !this.scenario.providerAvailable) {
        return { status: "failed", productId, error: new StoreNotConfiguredError().toShape() };
      }
      const catalog = createDemoCatalog({ locale: this.options.locale, currencyCode: this.options.currencyCode });
      const product = findCatalogProduct(catalog, productId);
      if (!product) return { status: "failed", productId, error: new ProductUnavailableError(productId).toShape() };

      const outcome = this.scenario.purchaseOutcome;
      if (outcome === "cancelled") return { status: "cancelled", productId, error: new PurchaseCancelledError().toShape() };
      if (outcome === "failed") return { status: "failed", productId, error: new PaymentFailedError().toShape() };
      if (outcome === "offline") return { status: "failed", productId, error: errorFromCode("offline").toShape() };
      if (outcome === "unavailable") return { status: "failed", productId, error: new BillingUnavailableError("mock").toShape() };
      if (outcome === "pending") {
        return { status: "pending", productId, transaction: syntheticTransaction(product.storeProductId, "pending") };
      }
      if (outcome === "already_owned") {
        const entitlements = entitlementsFromScenario(this.scenario);
        return { status: "failed", productId, entitlements: undefined, error: errorFromCode("already_owned").toShape(), transaction: syntheticTransaction(product.storeProductId, "purchased") };
      }

      this.applySuccessfulPurchase(product);
      const entitlements = entitlementsFromScenario(this.scenario);
      const transaction = syntheticTransaction(product.storeProductId, "purchased");
      this.emit({ transaction, entitlements });
      return { status: "succeeded", productId, transaction, entitlements: undefined };
    } finally {
      queueMicrotask(() => {
        this.lastPurchaseId = null;
      });
    }
  }

  async restorePurchases(): Promise<RestoreResult> {
    const now = defaultClock.now();
    if (now - this.lastRestoreAt < 250) {
      return this.restoreFromScenario();
    }
    this.lastRestoreAt = now;
    if (!this.scenario.connected) return { outcome: "failed", productIds: [], error: errorFromCode("offline").toShape() };
    if (this.scenario.restoreOutcome === "failed") {
      return { outcome: "failed", productIds: [], error: new RestoreFailedError("Mock restore failed").toShape() };
    }
    if (this.scenario.restoreOutcome === "offline") {
      return { outcome: "failed", productIds: [], error: errorFromCode("offline").toShape() };
    }
    return this.restoreFromScenario();
  }

  async getCustomerEntitlements(): Promise<CustomerEntitlements> {
    return entitlementsFromScenario(this.scenario);
  }

  listenForPurchaseUpdates(listener: PurchaseUpdateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async presentManagement(): Promise<ManagementDestination> {
    if (this.scenario.lifetimeOwned) {
      return { kind: "unavailable", message: "Lifetime access is a one-time unlock. There is no recurring subscription to manage." };
    }
    return { kind: "unavailable", message: "Mock billing cannot open the real store subscription page." };
  }

  async disconnect(): Promise<void> {
    this.listeners.clear();
    this.initialized = false;
  }

  private restoreFromScenario(): RestoreResult {
    const entitlements = entitlementsFromScenario(this.scenario);
    if (this.scenario.restoreOutcome === "partial") {
      return { outcome: "partial", productIds: entitlements.activeProductIds, entitlements: undefined };
    }
    if (entitlements.activeProductIds.length === 0) {
      return { outcome: "nothing_found", productIds: [] };
    }
    return { outcome: "restored", productIds: entitlements.activeProductIds };
  }

  private applySuccessfulPurchase(product: CatalogProduct): void {
    if (product.isLifetime) {
      this.scenario = {
        ...MOCK_BILLING_SCENARIOS.LIFETIME_USER,
        subscription: { tier: "lifetime", state: "active", productId: product.storeProductId },
        lifetimeOwned: true,
      };
      return;
    }
    const period = product.billingPeriod === "annual" ? "PLUS_ANNUAL" : "PLUS_MONTHLY";
    const next = MOCK_BILLING_SCENARIOS[period];
    this.scenario = {
      ...next,
      subscription: {
        tier: "plus",
        state: product.trialAvailability ? "trial" : "active",
        productId: product.storeProductId,
        expiresAt: monetizationIso(addDays(defaultClock.now(), product.billingPeriod === "annual" ? 365 : 30)),
      },
    };
  }

  private emit(update: { transaction: BillingTransaction; entitlements: CustomerEntitlements }): void {
    for (const listener of this.listeners) listener(update);
  }
}
