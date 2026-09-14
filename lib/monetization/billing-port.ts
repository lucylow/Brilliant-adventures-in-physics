import type {
  BillingPlatform,
  BillingTransaction,
  CatalogProduct,
  CustomerEntitlements,
  ManagementDestination,
  PurchaseResult,
  RestoreResult,
} from "./types";

export type PurchaseUpdateListener = (update: BillingPurchaseUpdate) => void;

export type BillingPurchaseUpdate = {
  transaction: BillingTransaction;
  entitlements: CustomerEntitlements;
};

export interface BillingPort {
  readonly kind: "mock" | "ios" | "android" | "unavailable";
  readonly platform: BillingPlatform;
  initialize(): Promise<void>;
  getProducts(): Promise<CatalogProduct[]>;
  purchaseProduct(productId: string): Promise<PurchaseResult>;
  restorePurchases(): Promise<RestoreResult>;
  getCustomerEntitlements(): Promise<CustomerEntitlements>;
  listenForPurchaseUpdates(listener: PurchaseUpdateListener): () => void;
  presentManagement(): Promise<ManagementDestination>;
  disconnect(): Promise<void>;
}

export type BillingAdapterOptions = {
  userId?: string;
  locale?: string;
  currencyCode?: string;
  connected?: boolean;
};
