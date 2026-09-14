import { describe, expect, it, beforeEach } from "vitest";
import { ALL_FEATURES } from "../lib/monetization/features";
import { getEntitlements, hasEntitlement, getFeatureAccessState } from "../lib/monetization/entitlements";
import { canUseAdvancedTutor, canAccessQuantumLab, canAccessExamPrep, canAccessPremiumMission, canRunExperiment, canUseAiRequest, canUseTutor } from "../lib/monetization/access";
import { emptyUsageSnapshot } from "../lib/monetization/usage";
import { isFreeCoreContent, isPremiumContent, rankRecommendations } from "../lib/monetization/content-map";
import { featureAccessMatrix } from "../lib/monetization/fixtures/index";
import type { EntitlementSnapshot } from "../lib/monetization/compat";

const plus: EntitlementSnapshot = { providerAvailable: true, subscription: { tier: "plus", state: "active", expiresAt: "2027-01-01T00:00:00.000Z" } };
const trial: EntitlementSnapshot = { providerAvailable: true, subscription: { tier: "plus", state: "trial", expiresAt: "2027-01-01T00:00:00.000Z" } };
const free: EntitlementSnapshot = { providerAvailable: true, subscription: { tier: "free", state: "active" } };
const expired: EntitlementSnapshot = { providerAvailable: true, subscription: { tier: "plus", state: "expired", expiresAt: "2020-01-01T00:00:00.000Z" } };
const pending: EntitlementSnapshot = { providerAvailable: true, subscription: { tier: "plus", state: "pending" } };
const unknown: EntitlementSnapshot = { providerAvailable: false };

describe("entitlement matrix", () => {
  it("covers every plan against every feature", () => {
    const rows = featureAccessMatrix();
    expect(rows.length).toBeGreaterThanOrEqual(ALL_FEATURES.length * 8);
    for (const feature of ALL_FEATURES) {
      expect(rows.some((row) => row.feature === feature && row.plan === "free")).toBe(true);
      expect(rows.some((row) => row.feature === feature && row.plan === "lifetime")).toBe(true);
    }
  });

  it("does not grant plus features to free users", () => {
    const entitlements = getEntitlements({ snapshot: free });
    for (const feature of ALL_FEATURES) {
      expect(hasEntitlement(entitlements, feature)).toBe(false);
    }
  });

  it("grants plus features during an active trial", () => {
    const entitlements = getEntitlements({ snapshot: trial });
    expect(hasEntitlement(entitlements, "advanced_tutor")).toBe(true);
    expect(getFeatureAccessState(entitlements, "quantum_labs")).toBe("trial");
  });

  it("keeps lifetime from expiring with a subscription date", () => {
    const entitlements = getEntitlements({
      snapshot: { providerAvailable: true, subscription: { tier: "lifetime", state: "active" } },
      lifetimeOwned: true,
    });
    expect(entitlements.lifetimeOwned).toBe(true);
    expect(hasEntitlement(entitlements, "advanced_labs")).toBe(true);
  });

  it("treats unknown provider as not premium", () => {
    const entitlements = getEntitlements({ snapshot: unknown });
    expect(entitlements.status).toBe("unknown");
    expect(hasEntitlement(entitlements, "exam_prep")).toBe(false);
  });

  it("does not treat pending as entitled", () => {
    const entitlements = getEntitlements({ snapshot: pending });
    expect(hasEntitlement(entitlements, "quantum_labs")).toBe(false);
    expect(getFeatureAccessState(entitlements, "quantum_labs")).toBe("pending");
  });

  it("recalculates expired access without deleting local learning", () => {
    const entitlements = getEntitlements({ snapshot: expired });
    expect(hasEntitlement(entitlements, "advanced_labs")).toBe(false);
    expect(canUseTutor()).toBe(true);
    expect(entitlements.status).toBe("expired");
  });
});

describe("application access API", () => {
  it("never blocks basic tutor", () => {
    expect(canUseTutor()).toBe(true);
  });

  it("gates advanced tutor and quantum labs through entitlements", () => {
    const freeEnt = getEntitlements({ snapshot: free });
    const plusEnt = getEntitlements({ snapshot: plus });
    expect(canUseAdvancedTutor(freeEnt)).toBe(false);
    expect(canUseAdvancedTutor(plusEnt)).toBe(true);
    expect(canAccessQuantumLab(freeEnt)).toBe(false);
    expect(canAccessQuantumLab(plusEnt)).toBe(true);
    expect(canAccessExamPrep(plusEnt)).toBe(true);
    expect(canAccessPremiumMission(freeEnt)).toBe(false);
  });

  it("applies experiment and AI limits for free users", () => {
    const entitlements = getEntitlements({ snapshot: free });
    const usage = emptyUsageSnapshot();
    expect(canRunExperiment(entitlements, usage)).toBe(true);
    expect(canUseAiRequest(entitlements, usage)).toBe(true);
  });

  it("keeps core projectile content free and marks tunneling as premium", () => {
    expect(isFreeCoreContent("sim-projectile")).toBe(true);
    expect(isPremiumContent("sim-tunnel")).toBe(true);
    const ranked = rankRecommendations([{ id: "sim-tunnel" }, { id: "sim-projectile" }], (id) => id === "sim-projectile");
    expect(ranked[0].id).toBe("sim-projectile");
  });
});
