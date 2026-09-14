import { Platform } from "react-native";
import { catalogProducts, createDemoCatalog } from "./catalog";
import { getMonetizationConfig, storeIdsAreConfigured } from "./config";
import { BillingUnavailableError, StoreNotConfiguredError } from "./errors";
import type { BillingAdapterOptions, BillingPort, PurchaseUpdateListener } from "./billing-port";
import type { CatalogProduct, CustomerEntitlements, ManagementDestination, PurchaseResult, RestoreResult } from "./types";

/**
 * iOS StoreKit 2 integration boundary.
 * This app is Expo managed and does not currently include a native IAP SDK.
 * The adapter never invents transaction IDs or marks premium as purchased.
 */
export class IosBillingAdapter implements BillingPort {
  readonly kind = "ios" as const;
  readonly platform = "ios" as const;
  private listeners = new Set<PurchaseUpdateListener>();

  constructor(private readonly options: BillingAdapterOptions = {}) {}

  async initialize(): Promise<void> {
    if (Platform.OS !== "ios") throw new BillingUnavailableError("ios");
    if (!storeIdsAreConfigured(getMonetizationConfig().storeIds)) throw new StoreNotConfiguredError();
    throw new StoreNotConfiguredError();
  }

  async getProducts(): Promise<CatalogProduct[]> {
    if (this.options.connected === false) throw new BillingUnavailableError("ios");
    throw new StoreNotConfiguredError();
  }

  async purchaseProduct(): Promise<PurchaseResult> {
    return { status: "failed", error: new StoreNotConfiguredError().toShape() };
  }

  async restorePurchases(): Promise<RestoreResult> {
    return { outcome: "failed", productIds: [], error: new StoreNotConfiguredError().toShape() };
  }

  async getCustomerEntitlements(): Promise<CustomerEntitlements> {
    return {
      activeProductIds: [],
      lifetimeOwned: false,
      rawEntitlements: [],
      providerAvailable: false,
      refreshedAt: new Date(0).toISOString(),
    };
  }

  listenForPurchaseUpdates(listener: PurchaseUpdateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async presentManagement(): Promise<ManagementDestination> {
    return {
      kind: "store",
      url: "https://apps.apple.com/account/subscriptions",
      message: "Manage subscriptions in your Apple ID settings.",
    };
  }

  async disconnect(): Promise<void> {
    this.listeners.clear();
  }
}

/**
 * Google Play Billing integration boundary.
 * Never reports a successful production purchase without Play Billing.
 */
export class AndroidBillingAdapter implements BillingPort {
  readonly kind = "android" as const;
  readonly platform = "android" as const;
  private listeners = new Set<PurchaseUpdateListener>();

  constructor(private readonly options: BillingAdapterOptions = {}) {}

  async initialize(): Promise<void> {
    if (Platform.OS !== "android") throw new BillingUnavailableError("android");
    throw new StoreNotConfiguredError();
  }

  async getProducts(): Promise<CatalogProduct[]> {
    if (this.options.connected === false) throw new BillingUnavailableError("android");
    throw new StoreNotConfiguredError();
  }

  async purchaseProduct(): Promise<PurchaseResult> {
    return { status: "failed", error: new StoreNotConfiguredError().toShape() };
  }

  async restorePurchases(): Promise<RestoreResult> {
    return { outcome: "failed", productIds: [], error: new StoreNotConfiguredError().toShape() };
  }

  async getCustomerEntitlements(): Promise<CustomerEntitlements> {
    return {
      activeProductIds: [],
      lifetimeOwned: false,
      rawEntitlements: [],
      providerAvailable: false,
      refreshedAt: new Date(0).toISOString(),
    };
  }

  listenForPurchaseUpdates(listener: PurchaseUpdateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async presentManagement(): Promise<ManagementDestination> {
    return {
      kind: "store",
      url: "https://play.google.com/store/account/subscriptions",
      message: "Manage subscriptions in the Google Play subscriptions page.",
    };
  }

  async disconnect(): Promise<void> {
    this.listeners.clear();
  }
}

export class UnavailableBillingAdapter implements BillingPort {
  readonly kind = "unavailable" as const;
  readonly platform = "web" as const;

  async initialize(): Promise<void> {
    throw new BillingUnavailableError("web");
  }

  async getProducts(): Promise<CatalogProduct[]> {
    return catalogProducts(createDemoCatalog()).length ? [] : [];
  }

  async purchaseProduct(): Promise<PurchaseResult> {
    return { status: "failed", error: new BillingUnavailableError("web").toShape() };
  }

  async restorePurchases(): Promise<RestoreResult> {
    return { outcome: "failed", productIds: [], error: new BillingUnavailableError("web").toShape() };
  }

  async getCustomerEntitlements(): Promise<CustomerEntitlements> {
    return {
      activeProductIds: [],
      lifetimeOwned: false,
      rawEntitlements: [],
      providerAvailable: false,
      refreshedAt: new Date(0).toISOString(),
    };
  }

  listenForPurchaseUpdates(): () => void {
    return () => undefined;
  }

  async presentManagement(): Promise<ManagementDestination> {
    return { kind: "unavailable", message: "In-app purchases are not available on web in this build." };
  }

  async disconnect(): Promise<void> {
    return;
  }
}
