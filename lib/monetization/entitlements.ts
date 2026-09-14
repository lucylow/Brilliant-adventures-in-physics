import { canUseSubscription, getEntitlementStatus, isUsable, type Entitlement, type EntitlementSnapshot, type Subscription } from "./compat";
import { addDays, defaultClock, monetizationIso } from "./clock";
import { getMonetizationConfig } from "./config";
import { ALL_FEATURES, FEATURE_GATES, featureAllowsPreview } from "./features";
import type {
  CustomerEntitlements,
  EntitlementCacheState,
  Entitlements,
  FeatureAccessState,
  FeatureId,
  LifetimeOwnership,
  PlanCode,
  Trial,
  TrialLifecycle,
} from "./types";

export type EntitlementContext = {
  snapshot: EntitlementSnapshot;
  customer?: CustomerEntitlements;
  now?: number;
  cacheAgeMs?: number;
  lifetimeOwned?: boolean;
};

function cacheState(ageMs: number | undefined, nowIgnored: number): EntitlementCacheState {
  const config = getMonetizationConfig().cache;
  if (ageMs === undefined) return "unknown";
  if (ageMs <= config.freshMs) return "fresh";
  if (ageMs <= config.staleMs) return "stale";
  if (ageMs <= config.expiredMs) return "expired";
  return "expired";
}

export function planFromSubscription(subscription: Subscription | undefined, lifetimeOwned: boolean): PlanCode {
  if (lifetimeOwned) return "lifetime";
  if (!subscription || subscription.tier === "free") return "free";
  if (subscription.tier === "lifetime") return "lifetime";
  return subscription.tier;
}

export function trialFromCustomer(customer: CustomerEntitlements | undefined, now: number): Trial | undefined {
  if (customer?.trial) return customer.trial;
  const subscription = customer?.subscription;
  if (!subscription || subscription.state !== "trial") {
    return { available: getMonetizationConfig().trial.enabled, periodDays: getMonetizationConfig().trial.periodDays, state: "notStarted" };
  }
  return {
    available: true,
    periodDays: getMonetizationConfig().trial.periodDays,
    state: trialLifecycle(subscription.expiresAt, now),
    endsAt: subscription.expiresAt,
  };
}

export function trialLifecycle(endsAt: string | undefined, now: number): TrialLifecycle {
  if (!endsAt) return "active";
  const end = Date.parse(endsAt);
  if (!Number.isFinite(end)) return "active";
  if (end <= now) return "expired";
  const hoursLeft = (end - now) / 3_600_000;
  if (hoursLeft <= getMonetizationConfig().trial.endingSoonHours) return "endingSoon";
  return "active";
}

export function plusAccessActive(snapshot: EntitlementSnapshot, now: number, lifetimeOwned: boolean): boolean {
  if (lifetimeOwned) return true;
  const status = getEntitlementStatus(snapshot, now);
  return status.premiumAvailable === true;
}

function featureState(args: {
  feature: FeatureId;
  entitled: boolean;
  snapshotStatus: ReturnType<typeof getEntitlementStatus>["status"];
  providerAvailable: boolean;
  lifetimeOwned: boolean;
}): FeatureAccessState {
  const { feature, entitled, snapshotStatus, providerAvailable, lifetimeOwned } = args;
  if (!providerAvailable && !lifetimeOwned) return "unknown";
  if (lifetimeOwned || entitled) {
    if (snapshotStatus === "trial") return "trial";
    if (FEATURE_GATES[feature].usageMeter && !lifetimeOwned && snapshotStatus === "free") return "limited";
    return "unlimited";
  }
  if (snapshotStatus === "pending") return "pending";
  if (snapshotStatus === "expired" || snapshotStatus === "canceled") return "expired";
  if (featureAllowsPreview(feature)) return "limited";
  return "locked";
}

export function getEntitlements(context: EntitlementContext): Entitlements {
  const now = context.now ?? defaultClock.now();
  const lifetimeOwned = context.lifetimeOwned === true || context.customer?.lifetimeOwned === true;
  const snapshot = context.snapshot;
  const status = getEntitlementStatus(snapshot, now);
  const entitled = plusAccessActive(snapshot, now, lifetimeOwned);
  const plan = planFromSubscription(snapshot.subscription ?? context.customer?.subscription, lifetimeOwned);
  const features = Object.fromEntries(
    ALL_FEATURES.map((feature) => [
      feature,
      featureState({
        feature,
        entitled,
        snapshotStatus: status.status,
        providerAvailable: snapshot.providerAvailable,
        lifetimeOwned,
      }),
    ]),
  ) as Record<FeatureId, FeatureAccessState>;

  const overall: FeatureAccessState = !snapshot.providerAvailable && !lifetimeOwned
    ? "unknown"
    : lifetimeOwned
      ? "unlimited"
      : status.status === "trial"
        ? "trial"
        : status.status === "pending"
          ? "pending"
          : status.status === "expired" || status.status === "canceled"
            ? "expired"
            : entitled
              ? "unlimited"
              : "available";

  return {
    plan,
    status: overall,
    features,
    subscription: snapshot.subscription ?? context.customer?.subscription,
    trial: trialFromCustomer(context.customer, now),
    lifetimeOwned,
    source: snapshot.providerAvailable ? (context.customer ? "store" : "unknown") : "unknown",
    refreshedAt: monetizationIso(now),
    cache: cacheState(context.cacheAgeMs, now),
  };
}

export function hasEntitlement(entitlements: Entitlements, feature: FeatureId): boolean {
  const state = entitlements.features[feature];
  return state === "unlimited" || state === "trial" || state === "available";
}

export function requireEntitlement(entitlements: Entitlements, feature: FeatureId): FeatureAccessState {
  return getFeatureAccessState(entitlements, feature);
}

export function canAccessFeature(entitlements: Entitlements, feature: FeatureId): boolean {
  const state = entitlements.features[feature];
  return state === "unlimited" || state === "trial" || state === "available" || state === "limited";
}

export function getFeatureGate(feature: FeatureId) {
  return FEATURE_GATES[feature];
}

export function getFeatureAccessState(entitlements: Entitlements, feature: FeatureId): FeatureAccessState {
  return entitlements.features[feature] ?? "unknown";
}

export function isPremiumAccessConfirmed(entitlements: Entitlements): boolean {
  return entitlements.lifetimeOwned || entitlements.status === "unlimited" || entitlements.status === "trial";
}

export function lifetimeOwnershipFrom(entitlements: Entitlements, pending: boolean, unavailable: boolean): LifetimeOwnership {
  if (unavailable) return "unavailable";
  if (entitlements.lifetimeOwned) return "owned";
  if (pending) return "pending";
  return "unowned";
}

export function entitlementsFromLegacy(list: readonly Entitlement[], snapshot: EntitlementSnapshot, now = defaultClock.now()): Entitlements {
  const enabled = new Set(list.filter((item) => item.enabled).map((item) => item.feature));
  const lifetimeOwned = snapshot.subscription?.tier === "lifetime" && canUseSubscription(snapshot.subscription, now);
  const computed = getEntitlements({ snapshot, now, lifetimeOwned });
  if (!snapshot.providerAvailable) return computed;
  const features = { ...computed.features };
  for (const feature of ALL_FEATURES) {
    if (enabled.has(feature) || enabled.has(legacyAlias(feature))) {
      features[feature] = snapshot.subscription?.state === "trial" ? "trial" : "unlimited";
    }
  }
  return { ...computed, features };
}

function legacyAlias(feature: FeatureId): string {
  if (feature === "advanced_tutor" || feature === "deep_explanations") return "unlimited_tutor";
  if (feature === "exam_prep") return "exam_generator";
  if (feature === "downloadable_reports") return "ai_lab_reports";
  if (feature === "advanced_personalization") return "personalized_study_plans";
  if (feature === "advanced_labs") return "advanced_simulations";
  return feature;
}

export function emptyEntitlements(now = defaultClock.now()): Entitlements {
  return getEntitlements({ snapshot: { providerAvailable: false }, now });
}

export function freeEntitlements(now = defaultClock.now()): Entitlements {
  return getEntitlements({ snapshot: { providerAvailable: true, subscription: { tier: "free", state: "active" } }, now });
}

export function graceStillEntitled(subscription: Subscription | undefined, now: number): boolean {
  if (!subscription || subscription.state !== "grace") return false;
  if (!getMonetizationConfig().grace.enabled) return false;
  if (!isUsable("grace")) return false;
  const ends = subscription.expiresAt ? Date.parse(subscription.expiresAt) : addDays(now, getMonetizationConfig().grace.periodDays);
  return Number.isFinite(ends) && ends > now;
}
