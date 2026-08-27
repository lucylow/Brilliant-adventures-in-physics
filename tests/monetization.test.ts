import { describe, expect, it, vi } from "vitest";
import { canUseSubscription, consume, getEntitlementStatus, isExpired, mapPurchaseError, purchaseReducer, remaining, retryPurchase, validateCatalog, type Product } from "../lib/monetization";

const product = (overrides: Partial<Product> = {}): Product => ({ id: "plus-monthly", storeProductId: "store.plus.monthly", plan: "plus", title: "PhysicaAI Plus", description: "Expanded physics learning tools.", priceLabel: "$4.99/month", period: "month", ...overrides });

describe("monetization contracts", () => {
  it("filters fabricated prices, invalid metadata, and duplicate products from a catalog", () => {
    expect(validateCatalog([product(), product({ id: "unknown", priceLabel: "TBD" }), product({ plan: "invalid" as Product["plan"] }), product({ period: "week" as Product["period"] }), product()])).toHaveLength(1);
  });
  it("keeps malformed usage display safe and rejects malformed consumption", () => {
    expect(remaining({ used: Number.NaN, limit: 5 })).toBe(5);
    expect(remaining({ used: 7, limit: Number.POSITIVE_INFINITY })).toBe(0);
    expect(() => consume({ used: Number.NaN, limit: 5 })).toThrow("Invalid usage state");
    expect(() => consume({ used: 1, limit: 5 }, Number.NaN)).toThrow("Invalid usage state");
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
    await expect(retryPurchase(async () => "bounded", Number.NaN)).resolves.toBe("bounded");
    expect(mapPurchaseError({ code: "timeout" })).toContain("too long");
  });
  it("handles expired and invalid subscriptions without inventing active access", () => {
    const subscription = { tier: "plus" as const, state: "active" as const, expiresAt: new Date(1_000).toISOString() };
    expect(isExpired(subscription, 2_000)).toBe(true);
    expect(canUseSubscription(subscription, 2_000)).toBe(false);
    expect(isExpired({ ...subscription, expiresAt: "not-a-date" }, 2_000)).toBe(true);
    expect(getEntitlementStatus({ providerAvailable: false }, 2_000)).toEqual({ status: "unavailable", premiumAvailable: false });
    expect(getEntitlementStatus({ providerAvailable: true }, 2_000)).toEqual({ status: "free", premiumAvailable: false });
    expect(getEntitlementStatus({ providerAvailable: true, subscription: { ...subscription, state: "active", expiresAt: new Date(3_000).toISOString() } }, 2_000)).toEqual({ status: "active", premiumAvailable: true });
  });
});
