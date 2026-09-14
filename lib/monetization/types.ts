/**
 * Strongly typed B.A.V. monetization domain.
 * Existing Subscription / Entitlement contracts live in compat.ts and are not duplicated.
 */

import type { BillingState, Entitlement, Subscription, Tier } from "./compat";

export const PLANS = {
  FREE: "free",
  BAV_PLUS: "plus",
  BAV_LIFETIME: "lifetime",
  FAMILY: "family",
  EDUCATION: "education",
} as const;

export type PlanCode = (typeof PLANS)[keyof typeof PLANS];

export type BillingPeriod = "none" | "monthly" | "annual" | "lifetime";

export type FeatureAccessState =
  | "available"
  | "locked"
  | "trial"
  | "limited"
  | "unlimited"
  | "expired"
  | "pending"
  | "unknown";

export type FeatureId =
  | "advanced_labs"
  | "unlimited_experiments"
  | "advanced_tutor"
  | "deep_explanations"
  | "exam_prep"
  | "quantum_labs"
  | "advanced_astronomy"
  | "downloadable_reports"
  | "advanced_personalization"
  | "premium_missions"
  | "unlimited_tutor"
  | "advanced_scans"
  | "advanced_simulations";

export type Plan = {
  id: PlanCode;
  displayName: string;
  description: string;
  billingPeriod: BillingPeriod;
  isSubscription: boolean;
  entitlements: readonly FeatureId[];
  sortOrder: number;
};

export type PricingOption = {
  amountMicros: number | null;
  currencyCode: string;
  storePrice: string | null;
  displayPrice: string | null;
  period: BillingPeriod;
  locale: string;
};

export type Trial = {
  available: boolean;
  periodDays: number;
  state: TrialLifecycle;
  startedAt?: string;
  endsAt?: string;
  convertedAt?: string;
};

export type TrialLifecycle = "notStarted" | "active" | "endingSoon" | "expired" | "converted" | "ineligible";

export type OfferKind = "standard" | "trial" | "annual_spotlight" | "lifetime" | "returning_user";

export type Offer = {
  id: string;
  kind: OfferKind;
  title: string;
  body: string;
  productIds: readonly string[];
  eligible: boolean;
  startsAt?: string;
  endsAt?: string;
  featured: boolean;
};

export type CatalogProduct = {
  id: string;
  storeProductId: string;
  displayName: string;
  description: string;
  billingPeriod: BillingPeriod;
  plan: PlanCode;
  price: PricingOption;
  trialAvailability: boolean;
  entitlements: readonly FeatureId[];
  isFeatured: boolean;
  sortOrder: number;
  isLifetime: boolean;
};

export type ProductCatalog = {
  freePlan: Plan;
  monthlyPlan: CatalogProduct;
  annualPlan: CatalogProduct;
  lifetimePlan: CatalogProduct;
  familyPlan?: Plan;
  educationPlan?: Plan;
};

export type FeatureGate = {
  id: FeatureId;
  title: string;
  description: string;
  requiredPlan: PlanCode;
  freePreview: boolean;
  coreLearning: boolean;
  usageMeter?: UsageMeterId;
};

export type UsageMeterId = "ai_requests" | "experiments" | "premium_previews" | "downloads";

export type UsageLimit = {
  meter: UsageMeterId;
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
  unlimited: boolean;
  period: "daily" | "weekly";
};

export type AIUsageState = {
  dailyLimit: number;
  used: number;
  remaining: number;
  resetAt: string;
  isUnlimited: boolean;
};

export type Entitlements = {
  plan: PlanCode;
  status: FeatureAccessState;
  features: Readonly<Record<FeatureId, FeatureAccessState>>;
  subscription?: Subscription;
  trial?: Trial;
  lifetimeOwned: boolean;
  source: EntitlementSource;
  refreshedAt: string;
  cache: EntitlementCacheState;
};

export type EntitlementSource = "store" | "server" | "cache" | "mock" | "unknown";

export type EntitlementCacheState = "fresh" | "stale" | "expired" | "unknown";

export type PurchaseFlowState =
  | "idle"
  | "loadingProducts"
  | "productsLoaded"
  | "purchasing"
  | "purchasePending"
  | "purchaseSucceeded"
  | "purchaseFailed"
  | "restoring"
  | "restoreSucceeded"
  | "restoreFailed"
  | "syncing"
  | "entitled"
  | "expired";

export type PurchaseResultStatus = "succeeded" | "pending" | "cancelled" | "failed";

export type PurchaseResult = {
  status: PurchaseResultStatus;
  productId?: string;
  transaction?: BillingTransaction;
  error?: MonetizationErrorShape;
  entitlements?: Entitlements;
};

export type RestoreOutcome = "restored" | "nothing_found" | "partial" | "failed";

export type RestoreResult = {
  outcome: RestoreOutcome;
  productIds: readonly string[];
  entitlements?: Entitlements;
  error?: MonetizationErrorShape;
};

export type TransactionState = "unknown" | "purchasing" | "purchased" | "pending" | "failed" | "restored" | "deferred";

export type BillingTransaction = {
  id: string;
  productId: string;
  storeProductId: string;
  platform: BillingPlatform;
  state: TransactionState;
  purchasedAt?: string;
  synthetic: boolean;
};

export type BillingPlatform = "ios" | "android" | "web" | "mock";

export type PaywallVariantId =
  | "standard"
  | "annual_focused"
  | "lifetime_focused"
  | "ai_focused"
  | "labs_focused"
  | "exam_focused"
  | "simulation_focused"
  | "returning_user"
  | "trial"
  | "feature_unlock"
  | "restore_prompt"
  | "expired_renewal"
  | "home_discovery"
  | "tutor_limit"
  | "mission_unlock";

export type PaywallVariant = {
  id: PaywallVariantId;
  description: string;
  priority: number;
  eligibleUserState: readonly MonetizationUserState[];
  planPresentation: readonly BillingPeriod[];
  heroTitle: string;
  heroBody: string;
  featuredPlan: BillingPeriod;
};

export type MonetizationUserState =
  | "free"
  | "trial"
  | "plus_monthly"
  | "plus_annual"
  | "lifetime"
  | "expired"
  | "cancelled"
  | "grace"
  | "billing_retry"
  | "pending"
  | "offline"
  | "unknown";

export type MonetizationErrorCode =
  | "product_unavailable"
  | "purchase_cancelled"
  | "purchase_pending"
  | "billing_unavailable"
  | "store_not_configured"
  | "restore_failed"
  | "entitlement_sync"
  | "payment_failed"
  | "network"
  | "offline"
  | "region_unsupported"
  | "already_owned"
  | "configuration"
  | "unknown";

export type MonetizationErrorAction = "retry" | "restore" | "dismiss" | "manage" | "wait" | "contact_support" | "continue_free";

export type MonetizationErrorShape = {
  code: MonetizationErrorCode;
  retryable: boolean;
  userMessage: string;
  developerMessage: string;
  action: MonetizationErrorAction;
  diagnosticId: string;
};

export type PurchaseCtaKind =
  | "start_free_trial"
  | "subscribe"
  | "unlock_bav_plus"
  | "get_lifetime"
  | "restore"
  | "try_again"
  | "manage"
  | "continue_free";

export type LifetimeOwnership = "unowned" | "pending" | "owned" | "unavailable" | "error";

export type MissionGateState = "locked" | "preview" | "available" | "completed";

export type TutorCapability = "basic_explanation" | "advanced_tutoring" | "deep_reasoning" | "personalized_tutoring";

export type StoreIdMap = {
  ios: { monthly: string; annual: string; lifetime: string };
  android: { monthly: string; annual: string; lifetime: string };
};

export type MonetizationEnvironment = "development" | "test" | "production";

export type BillingProviderKind = "mock" | "ios" | "android" | "unavailable";

export type CustomerEntitlements = {
  activeProductIds: readonly string[];
  subscription?: Subscription;
  lifetimeOwned: boolean;
  trial?: Trial;
  rawEntitlements: readonly Entitlement[];
  providerAvailable: boolean;
  refreshedAt: string;
};

export type ManagementDestination = {
  kind: "store" | "unavailable";
  url?: string;
  message: string;
};

export type ContentAccessTag = {
  contentId: string;
  kind: "simulation" | "mission" | "lab" | "exam" | "astronomy" | "quantum" | "download" | "recommendation";
  feature: FeatureId;
  freePreview: boolean;
};

export type SubscriptionRecord = Subscription & {
  billingPeriod: BillingPeriod;
  autoRenewing?: boolean;
  willRenew?: boolean;
  gracePeriodEndsAt?: string;
  cancelledAt?: string;
  paused?: boolean;
  revoked?: boolean;
  platform: BillingPlatform;
};

export type Clock = {
  now(): number;
  iso(at?: number): string;
  dateKey(at?: number): string;
};

export type AnalyticsSafePayload = Record<string, string | number | boolean | null>;
