import type { BillingPeriod, BillingPlatform, Entitlements, FeatureAccessState, FeatureId, MonetizationErrorCode, MonetizationUserState, PaywallVariantId, PlanCode, PurchaseFlowState } from "../types";
import { ALL_FEATURES } from "../features";
import { getEntitlements } from "../entitlements";
import { emptyUsageSnapshot, getAIUsageState, type UsageSnapshot } from "../usage";
import { MOCK_SCENARIO_LIST } from "../scenarios";
import { PAYWALL_VARIANTS } from "../variants";
import type { Subscription } from "../compat";

const FIRST = ["Avery", "Blake", "Cameron", "Drew", "Eden", "Finley", "Gray", "Harper", "Indigo", "Jules", "Kai", "Logan", "Morgan", "Noor", "Oakley", "Parker", "Quinn", "Reese", "Sage", "Tatum"];
const LAST = ["Newton", "Curie", "Faraday", "Maxwell", "Noether", "Feynman", "Dirac", "Planck", "Bohr", "Tesla"];

function userId(prefix: string, index: number): string {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function displayName(index: number): string {
  return `${FIRST[index % FIRST.length]} ${LAST[index % LAST.length]}`;
}

export type MockMonetizationUser = {
  id: string;
  displayName: string;
  plan: PlanCode;
  state: MonetizationUserState;
  fictional: true;
};

function makeUsers(plan: PlanCode, state: MonetizationUserState, prefix: string, count: number): MockMonetizationUser[] {
  return Array.from({ length: count }, (_, index) => ({
    id: userId(prefix, index),
    displayName: displayName(index + prefix.length),
    plan,
    state,
    fictional: true as const,
  }));
}

export const MOCK_MONETIZATION_USERS: MockMonetizationUser[] = [
  ...makeUsers("free", "free", "free", 20),
  ...makeUsers("plus", "trial", "trial", 10),
  ...makeUsers("plus", "plus_monthly", "month", 20),
  ...makeUsers("plus", "plus_annual", "annual", 20),
  ...makeUsers("lifetime", "lifetime", "life", 10),
  ...makeUsers("plus", "expired", "expired", 10),
];

const PERIODS: BillingPeriod[] = ["none", "monthly", "annual", "lifetime"];
const PLANS: PlanCode[] = ["free", "plus", "lifetime", "family", "education"];
const USER_STATES: MonetizationUserState[] = ["free", "trial", "plus_monthly", "plus_annual", "lifetime", "expired", "cancelled", "grace", "billing_retry", "pending", "offline", "unknown"];
const FLOW: PurchaseFlowState[] = ["idle", "loadingProducts", "productsLoaded", "purchasing", "purchasePending", "purchaseSucceeded", "purchaseFailed", "restoring", "restoreSucceeded", "restoreFailed", "syncing", "entitled", "expired"];
const ACCESS: FeatureAccessState[] = ["available", "locked", "trial", "limited", "unlimited", "expired", "pending", "unknown"];
const ERRORS: MonetizationErrorCode[] = ["product_unavailable", "purchase_cancelled", "purchase_pending", "billing_unavailable", "store_not_configured", "restore_failed", "entitlement_sync", "payment_failed", "network", "offline", "region_unsupported", "already_owned", "configuration", "unknown"];
const PLATFORMS: BillingPlatform[] = ["ios", "android", "web", "mock"];

function subscriptionFor(index: number): Subscription | undefined {
  const plan = PLANS[index % PLANS.length];
  if (plan === "free") return { tier: "free", state: "active" };
  const states: Subscription["state"][] = ["active", "trial", "grace", "expired", "canceled", "pending"];
  const state = states[index % states.length];
  const expires = state === "expired" || state === "canceled" ? "2026-01-01T00:00:00.000Z" : "2027-09-14T00:00:00.000Z";
  return { tier: plan === "lifetime" ? "lifetime" : "plus", state, productId: `fixture-${index}`, expiresAt: plan === "lifetime" ? undefined : expires };
}

export function buildSubscriptionStateFixtures(count = 120): Array<{ id: string; subscription?: Subscription; period: BillingPeriod; platform: BillingPlatform }> {
  return Array.from({ length: count }, (_, index) => ({
    id: `sub-state-${index + 1}`,
    subscription: subscriptionFor(index),
    period: PERIODS[index % PERIODS.length],
    platform: PLATFORMS[index % PLATFORMS.length],
  }));
}

export function buildEntitlementStateFixtures(count = 120): Entitlements[] {
  return Array.from({ length: count }, (_, index) => {
    const subscription = subscriptionFor(index);
    return getEntitlements({
      snapshot: { providerAvailable: index % 11 !== 0, subscription },
      lifetimeOwned: subscription?.tier === "lifetime" && subscription.state === "active",
      cacheAgeMs: (index % 5) * 60 * 60 * 1000,
    });
  });
}

export function buildPaywallStateFixtures(count = 120): Array<{ id: string; variant: PaywallVariantId; flow: PurchaseFlowState; userState: MonetizationUserState; selected: BillingPeriod }> {
  return Array.from({ length: count }, (_, index) => ({
    id: `paywall-state-${index + 1}`,
    variant: PAYWALL_VARIANTS[index % PAYWALL_VARIANTS.length].id,
    flow: FLOW[index % FLOW.length],
    userState: USER_STATES[index % USER_STATES.length],
    selected: PERIODS[(index % 3) + 1] as BillingPeriod,
  }));
}

export function buildBillingEventFixtures(count = 120): Array<{ id: string; event: string; productId: string; atOffsetHours: number }> {
  const events = ["paywall_viewed", "plan_selected", "purchase_started", "purchase_succeeded", "purchase_failed", "restore_started", "restore_succeeded", "trial_started", "lifetime_purchased"];
  return Array.from({ length: count }, (_, index) => ({
    id: `billing-event-${index + 1}`,
    event: events[index % events.length],
    productId: ["bav-plus-monthly", "bav-plus-annual", "bav-lifetime"][index % 3],
    atOffsetHours: index,
  }));
}

export function buildUsageStateFixtures(count = 120): Array<{ id: string; snapshot: UsageSnapshot; percent: number; unlimited: boolean }> {
  return Array.from({ length: count }, (_, index) => {
    const snapshot = emptyUsageSnapshot();
    const percent = [0, 25, 50, 75, 90, 100][index % 6];
    snapshot.meters.ai_requests.used = Math.round((percent / 100) * 5);
    snapshot.meters.experiments.used = Math.round((percent / 100) * 4);
    return { id: `usage-${index + 1}`, snapshot, percent, unlimited: index % 7 === 0 };
  });
}

export function buildPurchaseScenarioFixtures(count = 50): Array<{ id: string; from: MonetizationUserState; to: MonetizationUserState; product: string }> {
  const pairs: Array<[MonetizationUserState, MonetizationUserState]> = [
    ["free", "trial"],
    ["trial", "plus_annual"],
    ["trial", "expired"],
    ["plus_monthly", "plus_annual"],
    ["plus_monthly", "lifetime"],
    ["plus_annual", "expired"],
    ["expired", "plus_annual"],
    ["free", "lifetime"],
    ["free", "plus_monthly"],
    ["pending", "plus_annual"],
  ];
  return Array.from({ length: count }, (_, index) => {
    const [from, to] = pairs[index % pairs.length];
    return { id: `purchase-scenario-${index + 1}`, from, to, product: ["bav-plus-monthly", "bav-plus-annual", "bav-lifetime"][index % 3] };
  });
}

export function buildPricingScenarioFixtures(count = 50): Array<{ id: string; currency: string; locale: string; monthlyMicros: number; annualMicros: number }> {
  const currencies = ["USD", "CAD", "EUR", "GBP", "JPY", "AUD", "BRL", "INR"];
  const locales = ["en-US", "en-CA", "fr-FR", "en-GB", "ja-JP", "en-AU", "pt-BR", "hi-IN"];
  return Array.from({ length: count }, (_, index) => ({
    id: `price-${index + 1}`,
    currency: currencies[index % currencies.length],
    locale: locales[index % locales.length],
    monthlyMicros: 4_990_000 + index * 10_000,
    annualMicros: 39_990_000 + index * 50_000,
  }));
}

export function buildErrorScenarioFixtures(count = 30): Array<{ id: string; code: MonetizationErrorCode }> {
  return Array.from({ length: count }, (_, index) => ({
    id: `error-${index + 1}`,
    code: ERRORS[index % ERRORS.length],
  }));
}

export type MonetizationJourney = {
  id: string;
  title: string;
  steps: string[];
};

export function buildUserJourneys(): MonetizationJourney[] {
  return [
    { id: "free-lab-annual", title: "Free → advanced lab → paywall → annual → unlock", steps: ["home", "lab-preview", "paywall", "select-annual", "purchase", "refresh-entitlements", "lab-unlock"] },
    { id: "ai-limit-plus", title: "Free AI limit → upgrade → advanced tutor", steps: ["tutor-basic", "ai-limit", "paywall", "purchase-plus", "advanced-tutor"] },
    { id: "lifetime", title: "Free → lifetime paywall → lifetime lab", steps: ["home", "lifetime-paywall", "purchase-lifetime", "lifetime-entitlement", "premium-lab"] },
    { id: "restore", title: "Reinstall → restore → unlock", steps: ["reinstall", "restore", "entitlement-returned", "content-unlocked"] },
    { id: "error-retry", title: "Purchase network failure → retry → success", steps: ["purchase", "network-failure", "retry", "success"] },
    { id: "expired-renew", title: "Expired → free remains → renew", steps: ["expired-screen", "free-lab", "paywall", "renew"] },
    { id: "grace", title: "Grace period without panic", steps: ["grace-banner", "continue-learning", "store-management"] },
    { id: "offline", title: "Offline purchase blocked, free intact", steps: ["offline", "paywall-offline", "core-lab"] },
    { id: "trial-convert", title: "Trial → annual", steps: ["trial-start", "trial-active", "convert-annual"] },
    { id: "trial-expire", title: "Trial expired → free", steps: ["trial", "expired", "free-tutor"] },
    { id: "monthly-annual", title: "Monthly → annual upgrade", steps: ["plus-monthly", "paywall", "annual"] },
    { id: "monthly-lifetime", title: "Monthly → lifetime", steps: ["plus-monthly", "lifetime-card", "purchase"] },
    { id: "pending", title: "Pending purchase does not unlock", steps: ["purchase", "pending", "still-free"] },
    { id: "restore-empty", title: "Restore finds nothing", steps: ["restore", "empty", "continue-free"] },
    { id: "account-switch", title: "Logout clears cache", steps: ["plus-user", "logout", "free-cache"] },
    { id: "login-restore", title: "Login refreshes entitlements", steps: ["login", "refresh", "entitlements"] },
    { id: "quantum-preview", title: "Quantum preview → unlock", steps: ["quantum", "preview", "paywall", "unlock"] },
    { id: "astronomy-preview", title: "Astronomy preview → unlock", steps: ["astronomy", "preview", "paywall", "unlock"] },
    { id: "exam-preview", title: "Exam prep preview", steps: ["practice", "exam-preview", "paywall"] },
    { id: "mission-preview", title: "Premium mission teaser", steps: ["adventure", "mission-teaser", "paywall"] },
    { id: "download-gate", title: "Download report gated, view saved free", steps: ["notebook", "view-saved", "export-locked"] },
    { id: "personalization", title: "Basic recs free, advanced gated", steps: ["home-recs", "advanced-recs-lock"] },
    { id: "home-subtle", title: "Home BAV+ discovery", steps: ["home", "badge", "optional-paywall"] },
    { id: "settings-manage", title: "Settings billing controls", steps: ["settings", "restore", "manage"] },
    { id: "profile-card", title: "Profile entitlement card", steps: ["progress", "subscription-card"] },
    { id: "deep-link", title: "Deep link to premium feature", steps: ["link", "preview", "paywall"] },
    { id: "deep-link-restore", title: "Restore after deep link", steps: ["link", "restore", "return"] },
    { id: "search-premium", title: "Search marks premium results", steps: ["search", "badge", "preview"] },
    { id: "price-change", title: "Store price change, no invented discount", steps: ["catalog-refresh", "new-localized-price"] },
    { id: "region", title: "Unsupported region", steps: ["no-products", "continue-free"] },
  ];
}

export function featureAccessMatrix(): Array<{ plan: PlanCode; state: string; feature: FeatureId; access: FeatureAccessState }> {
  const plans: Array<{ plan: PlanCode; snapshot: Parameters<typeof getEntitlements>[0] }> = [
    { plan: "free", snapshot: { snapshot: { providerAvailable: true, subscription: { tier: "free", state: "active" } } } },
    { plan: "plus", snapshot: { snapshot: { providerAvailable: true, subscription: { tier: "plus", state: "trial", expiresAt: "2027-01-01T00:00:00.000Z" } } } },
    { plan: "plus", snapshot: { snapshot: { providerAvailable: true, subscription: { tier: "plus", state: "active", expiresAt: "2027-01-01T00:00:00.000Z" } } } },
    { plan: "plus", snapshot: { snapshot: { providerAvailable: true, subscription: { tier: "plus", state: "active", productId: "annual", expiresAt: "2027-01-01T00:00:00.000Z" } } } },
    { plan: "lifetime", snapshot: { snapshot: { providerAvailable: true, subscription: { tier: "lifetime", state: "active" } }, lifetimeOwned: true } },
    { plan: "plus", snapshot: { snapshot: { providerAvailable: true, subscription: { tier: "plus", state: "expired", expiresAt: "2020-01-01T00:00:00.000Z" } } } },
    { plan: "free", snapshot: { snapshot: { providerAvailable: false } } },
    { plan: "plus", snapshot: { snapshot: { providerAvailable: true, subscription: { tier: "plus", state: "pending" } } } },
  ];
  const rows: Array<{ plan: PlanCode; state: string; feature: FeatureId; access: FeatureAccessState }> = [];
  for (const entry of plans) {
    const entitlements = getEntitlements(entry.snapshot);
    for (const feature of ALL_FEATURES) {
      rows.push({ plan: entry.plan, state: entitlements.status, feature, access: entitlements.features[feature] });
    }
  }
  return rows;
}

export function demoFunnel() {
  return {
    label: "DEMO DATA",
    featureViewed: 400,
    paywallShown: 180,
    planSelected: 90,
    purchaseStarted: 40,
    purchaseSucceeded: 18,
  };
}

export function demoCohorts() {
  return {
    label: "DEMO DATA",
    monthly: 40,
    annual: 22,
    lifetime: 9,
    trialConversion: 0.31,
  };
}

export function demoRetention() {
  return {
    label: "DEMO DATA",
    newSubscriber: 12,
    day7: 10,
    day30: 8,
    day90: 6,
    churned: 4,
    returning: 3,
  };
}

export function aiUsageFromFixture(percent: number, unlimited = false) {
  const snapshot = emptyUsageSnapshot();
  snapshot.meters.ai_requests.used = Math.round((percent / 100) * 5);
  const entitlements = getEntitlements({
    snapshot: { providerAvailable: true, subscription: unlimited ? { tier: "plus", state: "active", expiresAt: "2027-01-01T00:00:00.000Z" } : { tier: "free", state: "active" } },
    lifetimeOwned: false,
  });
  return getAIUsageState(snapshot, entitlements);
}

export const FIXTURE_COUNTS = {
  users: MOCK_MONETIZATION_USERS.length,
  subscriptionStates: 120,
  entitlementStates: 120,
  paywallStates: 120,
  billingEvents: 120,
  usageStates: 120,
  purchaseScenarios: 50,
  pricingScenarios: 50,
  errorScenarios: 30,
  journeys: buildUserJourneys().length,
  mockBillingScenarios: MOCK_SCENARIO_LIST.length,
  paywallVariants: PAYWALL_VARIANTS.length,
} as const;
