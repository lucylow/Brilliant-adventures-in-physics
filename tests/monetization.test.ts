import { describe, expect, it, vi } from "vitest";
import { canUseSubscription, isExpired, mapPurchaseError, purchaseReducer, retryPurchase, validateCatalog, type Product } from "../lib/monetization";

const product = (overrides: Partial<Product> = {}): Product => ({ id: "plus-monthly", storeProductId: "store.plus.monthly", plan: "plus", title: "PhysicaAI Plus", description: "Expanded physics learning tools.", priceLabel: "$4.99/month", period: "month", ...overrides });

describe("monetization contracts", () => {
  it("filters fabricated prices and duplicate products from a catalog", () => {
    expect(validateCatalog([product(), product({ id: "unknown", priceLabel: "TBD" }), product()])).toHaveLength(1);
  });
  it("keeps purchase transitions explicit", () => {
    const loading = purchaseReducer({ state: "idle" }, { type: "START", productId: "plus-monthly" });
    expect(loading).toEqual({ state: "loading", productId: "plus-monthly" });
    expect(purchaseReducer(loading, { type: "PENDING" }).state).toBe("pending");
    expect(purchaseReducer(loading, { type: "ERROR", message: "Try again" })).toEqual({ state: "failed", productId: "plus-monthly", error: "Try again" });
  });
  it("retries a transient operation and surfaces stable purchase copy", async () => {
    let attempts = 0;
    const operation = vi.fn(async () => { attempts += 1; if (attempts < 2) throw { code: "network" }; return "ok"; });
    await expect(retryPurchase(operation, 2)).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(2);
    expect(mapPurchaseError({ code: "timeout" })).toContain("too long");
  });
  it("handles expired subscriptions without inventing active access", () => {
    const subscription = { tier: "plus" as const, state: "active" as const, expiresAt: new Date(1_000).toISOString() };
    expect(isExpired(subscription, 2_000)).toBe(true);
    expect(canUseSubscription(subscription, 2_000)).toBe(false);
  });
});
