import type { PurchaseFlowState } from "./types";

export type BillingMachineEvent =
  | { type: "LOAD_PRODUCTS" }
  | { type: "PRODUCTS_LOADED" }
  | { type: "PRODUCTS_FAILED" }
  | { type: "PURCHASE" }
  | { type: "PURCHASE_PENDING" }
  | { type: "PURCHASE_SUCCEEDED" }
  | { type: "PURCHASE_FAILED" }
  | { type: "RESTORE" }
  | { type: "RESTORE_SUCCEEDED" }
  | { type: "RESTORE_FAILED" }
  | { type: "SYNC" }
  | { type: "ENTITLED" }
  | { type: "EXPIRED" }
  | { type: "RESET" };

export type BillingMachineSnapshot = {
  state: PurchaseFlowState;
  productId?: string;
  inFlight: boolean;
};

const ALLOWED: Record<PurchaseFlowState, readonly BillingMachineEvent["type"][]> = {
  idle: ["LOAD_PRODUCTS", "RESTORE", "RESET"],
  loadingProducts: ["PRODUCTS_LOADED", "PRODUCTS_FAILED", "RESET"],
  productsLoaded: ["PURCHASE", "RESTORE", "LOAD_PRODUCTS", "RESET"],
  purchasing: ["PURCHASE_PENDING", "PURCHASE_SUCCEEDED", "PURCHASE_FAILED", "RESET"],
  purchasePending: ["PURCHASE_SUCCEEDED", "PURCHASE_FAILED", "SYNC", "RESET"],
  purchaseSucceeded: ["SYNC", "ENTITLED", "RESET"],
  purchaseFailed: ["PURCHASE", "LOAD_PRODUCTS", "RESTORE", "RESET"],
  restoring: ["RESTORE_SUCCEEDED", "RESTORE_FAILED", "RESET"],
  restoreSucceeded: ["SYNC", "ENTITLED", "RESET"],
  restoreFailed: ["RESTORE", "LOAD_PRODUCTS", "RESET"],
  syncing: ["ENTITLED", "EXPIRED", "PURCHASE_FAILED", "RESET"],
  entitled: ["LOAD_PRODUCTS", "RESTORE", "EXPIRED", "RESET"],
  expired: ["LOAD_PRODUCTS", "PURCHASE", "RESTORE", "RESET"],
};

export function createBillingMachine(initial: PurchaseFlowState = "idle"): BillingMachineSnapshot {
  return { state: initial, inFlight: false };
}

export function canTransition(state: PurchaseFlowState, event: BillingMachineEvent["type"]): boolean {
  return ALLOWED[state].includes(event);
}

export function reduceBillingMachine(snapshot: BillingMachineSnapshot, event: BillingMachineEvent, productId?: string): BillingMachineSnapshot {
  if (!canTransition(snapshot.state, event.type)) return snapshot;
  switch (event.type) {
    case "LOAD_PRODUCTS":
      return { state: "loadingProducts", productId: snapshot.productId, inFlight: true };
    case "PRODUCTS_LOADED":
      return { state: "productsLoaded", productId: snapshot.productId, inFlight: false };
    case "PRODUCTS_FAILED":
      return { state: "idle", productId: snapshot.productId, inFlight: false };
    case "PURCHASE":
      if (snapshot.inFlight) return snapshot;
      return { state: "purchasing", productId: productId ?? snapshot.productId, inFlight: true };
    case "PURCHASE_PENDING":
      return { ...snapshot, state: "purchasePending", inFlight: true };
    case "PURCHASE_SUCCEEDED":
      return { ...snapshot, state: "purchaseSucceeded", inFlight: false };
    case "PURCHASE_FAILED":
      return { ...snapshot, state: "purchaseFailed", inFlight: false };
    case "RESTORE":
      if (snapshot.inFlight) return snapshot;
      return { state: "restoring", productId: snapshot.productId, inFlight: true };
    case "RESTORE_SUCCEEDED":
      return { ...snapshot, state: "restoreSucceeded", inFlight: false };
    case "RESTORE_FAILED":
      return { ...snapshot, state: "restoreFailed", inFlight: false };
    case "SYNC":
      return { ...snapshot, state: "syncing", inFlight: true };
    case "ENTITLED":
      return { ...snapshot, state: "entitled", inFlight: false };
    case "EXPIRED":
      return { ...snapshot, state: "expired", inFlight: false };
    case "RESET":
      return { state: "idle", inFlight: false, productId: snapshot.productId };
    default:
      return snapshot;
  }
}

export const BILLING_MACHINE_STATES: readonly PurchaseFlowState[] = [
  "idle",
  "loadingProducts",
  "productsLoaded",
  "purchasing",
  "purchasePending",
  "purchaseSucceeded",
  "purchaseFailed",
  "restoring",
  "restoreSucceeded",
  "restoreFailed",
  "syncing",
  "entitled",
  "expired",
];
