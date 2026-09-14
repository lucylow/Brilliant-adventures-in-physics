import { describe, expect, it } from "vitest";
import { addDays, resetMonetizationNow, setMonetizationNow, startOfUtcDay, nextUtcReset } from "../lib/monetization/clock";
import { emptyUsageSnapshot, consumeUsage, canConsumeUsage, getAIUsageState, alignUsageSnapshot, aiUsageFixture, AI_USAGE_FIXTURE_PERCENTS } from "../lib/monetization/usage";
import { getEntitlements } from "../lib/monetization/entitlements";
import { formatStorePrice, longPriceStressLabel, SUPPORTED_DEMO_CURRENCIES } from "../lib/monetization/pricing";
import { createDemoCatalog, annualSavingsFromCatalog } from "../lib/monetization/catalog";
import { assignPaywallVariant, PAYWALL_VARIANTS } from "../lib/monetization/variants";
import { buildPaywallViewModel, resolveCta } from "../lib/monetization/paywall-view-model";
import { ctaLabel } from "../lib/monetization/copy";
import { sanitizeAnalyticsPayload, trackMonetizationEvent, getMonetizationAnalyticsQueue, clearMonetizationAnalyticsQueue } from "../lib/monetization/analytics";
import { validateMonetizationConfig, getMonetizationConfig } from "../lib/monetization/config";
import { FIXTURE_COUNTS, buildUserJourneys } from "../lib/monetization/fixtures/index";
import { syntheticReceipt } from "../lib/monetization/fixtures/history";

const free = getEntitlements({ snapshot: { providerAvailable: true, subscription: { tier: "free", state: "active" } } });
const plus = getEntitlements({ snapshot: { providerAvailable: true, subscription: { tier: "plus", state: "active", expiresAt: "2027-01-01T00:00:00.000Z" } } });

describe("usage reset clock", () => {
  it("resets at the UTC day boundary", () => {
    setMonetizationNow("2026-09-14T23:00:00.000Z");
    const before = emptyUsageSnapshot();
    before.meters.ai_requests.used = 5;
    setMonetizationNow("2026-09-15T00:00:00.000Z");
    const after = alignUsageSnapshot(before);
    expect(after.meters.ai_requests.used).toBe(0);
    expect(nextUtcReset(startOfUtcDay())).toBe(addDays(startOfUtcDay(), 1));
    resetMonetizationNow();
  });

  it("blocks AI after the free daily limit and stays unlimited for plus", () => {
    let snapshot = emptyUsageSnapshot();
    snapshot = consumeUsage("ai_requests", snapshot, free);
    snapshot = consumeUsage("ai_requests", snapshot, free);
    snapshot = consumeUsage("ai_requests", snapshot, free);
    snapshot = consumeUsage("ai_requests", snapshot, free);
    snapshot = consumeUsage("ai_requests", snapshot, free);
    expect(canConsumeUsage("ai_requests", snapshot, free)).toBe(false);
    expect(getAIUsageState(snapshot, plus).isUnlimited).toBe(true);
    expect(() => consumeUsage("ai_requests", snapshot, free)).toThrow("Usage limit reached");
  });

  it("exposes AI usage fixtures including unlimited", () => {
    expect(AI_USAGE_FIXTURE_PERCENTS).toEqual([0, 25, 50, 75, 90, 100]);
    expect(aiUsageFixture("unlimited").label).toBe("unlimited");
    expect(aiUsageFixture(100).snapshot.meters.ai_requests.used).toBeGreaterThan(0);
  });
});

describe("pricing and paywall presentation", () => {
  it("formats USD CAD EUR GBP without a hardcoded dollar sign", () => {
    expect(formatStorePrice(4_990_000, "USD", "en-US")).toMatch(/4\.99/);
    expect(formatStorePrice(4_990_000, "CAD", "en-CA")).toBeTruthy();
    expect(formatStorePrice(4_990_000, "EUR", "fr-FR")).toBeTruthy();
    expect(formatStorePrice(4_990_000, "GBP", "en-GB")).toBeTruthy();
    expect(formatStorePrice(4_990_000, "USD", "en-US")?.includes("$") || formatStorePrice(4_990_000, "USD", "en-US")?.includes("USD")).toBe(true);
  });

  it("supports long localized prices", () => {
    expect(longPriceStressLabel().length).toBeGreaterThan(8);
    for (const currency of SUPPORTED_DEMO_CURRENCIES) {
      expect(formatStorePrice(12_345_000, currency)).toBeTruthy();
    }
  });

  it("only reports annual savings when both prices exist", () => {
    const catalog = createDemoCatalog();
    const savings = annualSavingsFromCatalog(catalog);
    expect(savings.display).toBeTruthy();
    expect(savings.percent).toBeGreaterThan(0);
  });

  it("assigns a stable variant for the same user", () => {
    const a = assignPaywallVariant("user-maya", "free");
    const b = assignPaywallVariant("user-maya", "free");
    expect(a.id).toBe(b.id);
    expect(PAYWALL_VARIANTS.length).toBeGreaterThanOrEqual(15);
  });

  it("adapts CTA copy and keeps restore/close labels", () => {
    const catalog = createDemoCatalog();
    const model = buildPaywallViewModel({
      catalog,
      variant: PAYWALL_VARIANTS[0],
      selectedProductId: catalog.annualPlan.id,
      flow: "productsLoaded",
      entitlements: free,
      connected: true,
    });
    expect(model.closeLabel).toBe("Close");
    expect(model.restoreLabel.toLowerCase()).toContain("restore");
    expect(model.plans[0].accessibilityLabel.length).toBeGreaterThan(10);
    expect(ctaLabel(resolveCta({ product: catalog.lifetimePlan, flow: "productsLoaded", entitlements: free, trialConfigured: false }))).toBe("Get Lifetime Access");
  });

  it("shows a useful empty state instead of blank price cards", () => {
    const model = buildPaywallViewModel({
      catalog: null,
      variant: PAYWALL_VARIANTS[0],
      flow: "idle",
      entitlements: free,
      connected: false,
    });
    expect(model.emptyMessage).toBeTruthy();
    expect(model.plans).toHaveLength(0);
    expect(model.offlineMessage).toBeTruthy();
  });
});

describe("analytics privacy and config", () => {
  it("strips receipts and tokens", () => {
    const clean = sanitizeAnalyticsPayload({ productId: "bav-plus-annual", receipt: "secret", card: "4111", token: "abc" });
    expect(clean.productId).toBe("bav-plus-annual");
    expect(clean.receipt).toBeUndefined();
    expect(clean.token).toBeUndefined();
  });

  it("never lets analytics throw", () => {
    clearMonetizationAnalyticsQueue();
    trackMonetizationEvent("paywall_viewed", { receipt: "nope", productId: "bav-plus-annual" });
    expect(getMonetizationAnalyticsQueue()[0].payload.receipt).toBeUndefined();
  });

  it("keeps free AI allowance at least 1", () => {
    const issues = validateMonetizationConfig(getMonetizationConfig());
    expect(issues.filter((issue) => issue.path === "freeLimits.dailyAiRequests")).toHaveLength(0);
  });
});

describe("fixture volume", () => {
  it("meets the documented mock data counts", () => {
    expect(FIXTURE_COUNTS.users).toBeGreaterThanOrEqual(90);
    expect(FIXTURE_COUNTS.subscriptionStates).toBeGreaterThanOrEqual(100);
    expect(FIXTURE_COUNTS.entitlementStates).toBeGreaterThanOrEqual(100);
    expect(FIXTURE_COUNTS.paywallStates).toBeGreaterThanOrEqual(100);
    expect(FIXTURE_COUNTS.billingEvents).toBeGreaterThanOrEqual(100);
    expect(FIXTURE_COUNTS.usageStates).toBeGreaterThanOrEqual(100);
    expect(FIXTURE_COUNTS.purchaseScenarios).toBeGreaterThanOrEqual(50);
    expect(FIXTURE_COUNTS.pricingScenarios).toBeGreaterThanOrEqual(50);
    expect(FIXTURE_COUNTS.errorScenarios).toBeGreaterThanOrEqual(30);
    expect(buildUserJourneys().length).toBeGreaterThanOrEqual(30);
    expect(syntheticReceipt("bav-lifetime").kind).toBe("SYNTHETIC_RECEIPT");
  });
});
