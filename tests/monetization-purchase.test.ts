import { describe, expect, it } from "vitest";
import { createBillingMachine, reduceBillingMachine, canTransition, BILLING_MACHINE_STATES } from "../lib/monetization/state-machine";
import { MockBillingAdapter } from "../lib/monetization/mock-adapter";
import { getMockScenario, MOCK_SCENARIO_LIST } from "../lib/monetization/scenarios";
import { errorFromCode, mapBillingError, PurchaseCancelledError } from "../lib/monetization/errors";

describe("purchase state machine", () => {
  it("lists every documented state", () => {
    expect(BILLING_MACHINE_STATES).toContain("purchasing");
    expect(BILLING_MACHINE_STATES).toContain("restoreSucceeded");
    expect(BILLING_MACHINE_STATES.length).toBe(13);
  });

  it("walks a successful purchase", () => {
    let snap = createBillingMachine();
    snap = reduceBillingMachine(snap, { type: "LOAD_PRODUCTS" });
    expect(snap.state).toBe("loadingProducts");
    snap = reduceBillingMachine(snap, { type: "PRODUCTS_LOADED" });
    snap = reduceBillingMachine(snap, { type: "PURCHASE" }, "bav-plus-annual");
    expect(snap.inFlight).toBe(true);
    const duplicate = reduceBillingMachine(snap, { type: "PURCHASE" }, "bav-plus-monthly");
    expect(duplicate.productId).toBe("bav-plus-annual");
    snap = reduceBillingMachine(snap, { type: "PURCHASE_SUCCEEDED" });
    snap = reduceBillingMachine(snap, { type: "SYNC" });
    snap = reduceBillingMachine(snap, { type: "ENTITLED" });
    expect(snap.state).toBe("entitled");
  });

  it("rejects illegal transitions", () => {
    const idle = createBillingMachine();
    expect(canTransition("idle", "PURCHASE_SUCCEEDED")).toBe(false);
    expect(reduceBillingMachine(idle, { type: "PURCHASE_SUCCEEDED" }).state).toBe("idle");
  });

  it("covers pending, failure, restore, and expiry", () => {
    let snap = reduceBillingMachine(reduceBillingMachine(createBillingMachine(), { type: "LOAD_PRODUCTS" }), { type: "PRODUCTS_LOADED" });
    snap = reduceBillingMachine(snap, { type: "PURCHASE" }, "p");
    expect(reduceBillingMachine(snap, { type: "PURCHASE_PENDING" }).state).toBe("purchasePending");
    expect(reduceBillingMachine(snap, { type: "PURCHASE_FAILED" }).state).toBe("purchaseFailed");
    snap = reduceBillingMachine(reduceBillingMachine(createBillingMachine(), { type: "RESTORE" }), { type: "RESTORE_SUCCEEDED" });
    expect(snap.state).toBe("restoreSucceeded");
    snap = reduceBillingMachine(reduceBillingMachine(createBillingMachine(), { type: "RESTORE" }), { type: "RESTORE_FAILED" });
    expect(snap.state).toBe("restoreFailed");
    expect(reduceBillingMachine({ state: "entitled", inFlight: false }, { type: "EXPIRED" }).state).toBe("expired");
  });
});

describe("mock purchases", () => {
  it("succeeds for a free user without inventing a store transaction id from Apple/Google", async () => {
    const adapter = new MockBillingAdapter({ scenarioId: "FREE_USER" });
    const result = await adapter.purchaseProduct("bav-plus-annual");
    expect(result.status).toBe("succeeded");
    expect(result.transaction?.synthetic).toBe(true);
    expect(result.transaction?.id.startsWith("synthetic.")).toBe(true);
  });

  it("does not claim restore success when nothing is owned", async () => {
    const adapter = new MockBillingAdapter({ scenarioId: "FREE_USER" });
    const result = await adapter.restorePurchases();
    expect(result.outcome).toBe("nothing_found");
  });

  it("restores lifetime without turning it into a subscription", async () => {
    const adapter = new MockBillingAdapter({ scenarioId: "RESTORE_USER" });
    const result = await adapter.restorePurchases();
    expect(result.outcome).toBe("restored");
    const entitlements = await adapter.getCustomerEntitlements();
    expect(entitlements.lifetimeOwned).toBe(true);
    expect(entitlements.subscription?.tier).toBe("lifetime");
  });

  it("keeps pending purchases from unlocking", async () => {
    const adapter = new MockBillingAdapter({ scenarioId: "PENDING_PURCHASE" });
    const result = await adapter.purchaseProduct("bav-plus-monthly");
    expect(result.status).toBe("pending");
    const entitlements = await adapter.getCustomerEntitlements();
    expect(entitlements.subscription?.state).toBe("pending");
  });

  it("maps cancel and payment failure honestly", async () => {
    const fail = new MockBillingAdapter({ scenarioId: "PAYMENT_ERROR" });
    const failed = await fail.purchaseProduct("bav-plus-monthly");
    expect(failed.status).toBe("failed");
    expect(failed.error?.code).toBe("payment_failed");
    const offline = new MockBillingAdapter({ scenarioId: "OFFLINE_USER" });
    const offlineResult = await offline.purchaseProduct("bav-plus-monthly");
    expect(offlineResult.status).toBe("failed");
    expect(offlineResult.error?.code).toBe("offline");
  });

  it("is restore-idempotent", async () => {
    const adapter = new MockBillingAdapter({ scenarioId: "PLUS_ANNUAL" });
    const first = await adapter.restorePurchases();
    const second = await adapter.restorePurchases();
    expect(first.outcome).toBe("restored");
    expect(second.outcome).toBe("restored");
  });

  it("defines at least 30 scenarios", () => {
    expect(MOCK_SCENARIO_LIST.length).toBeGreaterThanOrEqual(30);
    expect(getMockScenario("LIFETIME_USER").lifetimeOwned).toBe(true);
  });
});

describe("billing errors", () => {
  it("maps known codes to retryable flags", () => {
    expect(errorFromCode("purchase_cancelled").retryable).toBe(false);
    expect(errorFromCode("network").retryable).toBe(true);
    expect(mapBillingError(new PurchaseCancelledError()).code).toBe("purchase_cancelled");
  });
});
