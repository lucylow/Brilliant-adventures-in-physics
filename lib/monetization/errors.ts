import { createDiagnosticId } from "@/lib/diagnostics/diagnostic-id";
import type { MonetizationErrorAction, MonetizationErrorCode, MonetizationErrorShape } from "./types";

export class MonetizationError extends Error {
  readonly code: MonetizationErrorCode;
  readonly retryable: boolean;
  readonly userMessage: string;
  readonly developerMessage: string;
  readonly action: MonetizationErrorAction;
  readonly diagnosticId: string;

  constructor(input: Omit<MonetizationErrorShape, "diagnosticId"> & { diagnosticId?: string }) {
    super(input.developerMessage);
    this.name = "MonetizationError";
    this.code = input.code;
    this.retryable = input.retryable;
    this.userMessage = input.userMessage;
    this.developerMessage = input.developerMessage;
    this.action = input.action;
    this.diagnosticId = input.diagnosticId ?? createDiagnosticId();
  }

  toShape(): MonetizationErrorShape {
    return {
      code: this.code,
      retryable: this.retryable,
      userMessage: this.userMessage,
      developerMessage: this.developerMessage,
      action: this.action,
      diagnosticId: this.diagnosticId,
    };
  }
}

export class ProductUnavailableError extends MonetizationError {
  constructor(productId?: string) {
    super({
      code: "product_unavailable",
      retryable: true,
      userMessage: "That plan is not available on this device right now. Free learning is still open.",
      developerMessage: productId ? `Product ${productId} is unavailable` : "Requested product is unavailable",
      action: "retry",
    });
    this.name = "ProductUnavailableError";
  }
}

export class PurchaseCancelledError extends MonetizationError {
  constructor() {
    super({
      code: "purchase_cancelled",
      retryable: false,
      userMessage: "Purchase cancelled. Nothing was charged.",
      developerMessage: "User cancelled the store purchase sheet",
      action: "dismiss",
    });
    this.name = "PurchaseCancelledError";
  }
}

export class PurchasePendingError extends MonetizationError {
  constructor() {
    super({
      code: "purchase_pending",
      retryable: false,
      userMessage: "This purchase is waiting for store confirmation. Premium access is not unlocked yet.",
      developerMessage: "Store reported a pending/deferred transaction",
      action: "wait",
    });
    this.name = "PurchasePendingError";
  }
}

export class BillingUnavailableError extends MonetizationError {
  constructor(platform: string) {
    super({
      code: "billing_unavailable",
      retryable: true,
      userMessage: "The store is unavailable on this device. You can keep using free learning.",
      developerMessage: `Billing unavailable on ${platform}`,
      action: "continue_free",
    });
    this.name = "BillingUnavailableError";
  }
}

export class StoreNotConfiguredError extends MonetizationError {
  constructor() {
    super({
      code: "store_not_configured",
      retryable: false,
      userMessage: "Plans are not configured on this build. Core learning stays free.",
      developerMessage: "Store product IDs are placeholders or billing SDK is not wired",
      action: "continue_free",
    });
    this.name = "StoreNotConfiguredError";
  }
}

export class RestoreFailedError extends MonetizationError {
  constructor(reason: string) {
    super({
      code: "restore_failed",
      retryable: true,
      userMessage: "We could not restore purchases right now. Try again when you are online.",
      developerMessage: reason,
      action: "retry",
    });
    this.name = "RestoreFailedError";
  }
}

export class EntitlementSyncError extends MonetizationError {
  constructor(reason: string) {
    super({
      code: "entitlement_sync",
      retryable: true,
      userMessage: "Your purchase could not be confirmed yet. Free learning remains available.",
      developerMessage: reason,
      action: "retry",
    });
    this.name = "EntitlementSyncError";
  }
}

export class PaymentFailedError extends MonetizationError {
  constructor() {
    super({
      code: "payment_failed",
      retryable: true,
      userMessage: "The store could not complete payment. No premium access was added.",
      developerMessage: "Payment declined or failed at the store",
      action: "retry",
    });
    this.name = "PaymentFailedError";
  }
}

export class UnknownBillingError extends MonetizationError {
  constructor(reason: string) {
    super({
      code: "unknown",
      retryable: true,
      userMessage: "Something went wrong with the store. Nothing was charged.",
      developerMessage: reason,
      action: "retry",
    });
    this.name = "UnknownBillingError";
  }
}

const CODE_MAP: Record<string, MonetizationErrorCode> = {
  cancelled: "purchase_cancelled",
  canceled: "purchase_cancelled",
  user_cancelled: "purchase_cancelled",
  pending: "purchase_pending",
  deferred: "purchase_pending",
  network: "network",
  offline: "offline",
  timeout: "network",
  not_allowed: "billing_unavailable",
  billing_unavailable: "billing_unavailable",
  store_not_configured: "store_not_configured",
  product_unavailable: "product_unavailable",
  payment_failed: "payment_failed",
  already_owned: "already_owned",
  region_unsupported: "region_unsupported",
  configuration: "configuration",
  restore_failed: "restore_failed",
  entitlement_sync: "entitlement_sync",
};

export function isMonetizationError(error: unknown): error is MonetizationError {
  return error instanceof MonetizationError;
}

export function mapBillingError(error: unknown): MonetizationError {
  if (isMonetizationError(error)) return error;
  if (typeof error === "object" && error && "code" in error) {
    const code = CODE_MAP[String((error as { code?: unknown }).code)] ?? "unknown";
    return errorFromCode(code, error instanceof Error ? error.message : String((error as { code?: unknown }).code));
  }
  if (error instanceof Error) return new UnknownBillingError(error.message);
  return new UnknownBillingError("Unknown billing failure");
}

export function errorFromCode(code: MonetizationErrorCode, developerMessage?: string): MonetizationError {
  switch (code) {
    case "product_unavailable":
      return new ProductUnavailableError();
    case "purchase_cancelled":
      return new PurchaseCancelledError();
    case "purchase_pending":
      return new PurchasePendingError();
    case "billing_unavailable":
      return new BillingUnavailableError("unknown");
    case "store_not_configured":
      return new StoreNotConfiguredError();
    case "restore_failed":
      return new RestoreFailedError(developerMessage ?? "Restore failed");
    case "entitlement_sync":
      return new EntitlementSyncError(developerMessage ?? "Entitlement sync failed");
    case "payment_failed":
      return new PaymentFailedError();
    case "network":
    case "offline":
      return new MonetizationError({
        code,
        retryable: true,
        userMessage: "Purchasing needs a connection. Your free tools still work offline.",
        developerMessage: developerMessage ?? "Network unavailable",
        action: "retry",
      });
    case "region_unsupported":
      return new MonetizationError({
        code,
        retryable: false,
        userMessage: "This plan is not offered in your store region yet. Free learning stays available.",
        developerMessage: developerMessage ?? "Region unsupported",
        action: "continue_free",
      });
    case "already_owned":
      return new MonetizationError({
        code,
        retryable: false,
        userMessage: "This purchase is already on the store account. Try Restore Purchases.",
        developerMessage: developerMessage ?? "Already owned",
        action: "restore",
      });
    case "configuration":
      return new MonetizationError({
        code,
        retryable: false,
        userMessage: "Plans are misconfigured on this build. Free learning remains available.",
        developerMessage: developerMessage ?? "Configuration error",
        action: "continue_free",
      });
    default:
      return new UnknownBillingError(developerMessage ?? "Unknown billing error");
  }
}

export function errorCatalog(): Readonly<Record<MonetizationErrorCode, { retryable: boolean; action: MonetizationErrorAction }>> {
  return {
    product_unavailable: { retryable: true, action: "retry" },
    purchase_cancelled: { retryable: false, action: "dismiss" },
    purchase_pending: { retryable: false, action: "wait" },
    billing_unavailable: { retryable: true, action: "continue_free" },
    store_not_configured: { retryable: false, action: "continue_free" },
    restore_failed: { retryable: true, action: "retry" },
    entitlement_sync: { retryable: true, action: "retry" },
    payment_failed: { retryable: true, action: "retry" },
    network: { retryable: true, action: "retry" },
    offline: { retryable: true, action: "retry" },
    region_unsupported: { retryable: false, action: "continue_free" },
    already_owned: { retryable: false, action: "restore" },
    configuration: { retryable: false, action: "continue_free" },
    unknown: { retryable: true, action: "retry" },
  };
}
