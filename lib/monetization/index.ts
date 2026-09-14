export { PREMIUM_FEATURES, VALID_TIERS, VALID_BILLING_STATES, VALID_PERIODS, ethicalCopy, isValidSubscription, getEntitlementStatus, hasFeature, remaining, consume, gate, isUsable, buildPaywall, annualSavings, buy, isValidProduct, validateCatalog, purchaseReducer, mapPurchaseError, retryPurchase, isExpired, canUseSubscription } from "./compat";
export type { Tier, BillingState, Entitlement, Subscription, EntitlementStatus, EntitlementSnapshot, EntitlementResult, StoreProduct, PlanId, PurchaseState, PurchaseSession, Product, PurchaseReceipt, BillingProvider, StoreAdapter, ProductRepository } from "./compat";

export { PLANS } from "./types";
export type { Plan, CatalogProduct, ProductCatalog, Entitlements, FeatureGate, FeatureAccessState, FeatureId, BillingPeriod, Trial, Offer, PurchaseFlowState, PurchaseResult, RestoreResult, PricingOption, PaywallVariant, UsageLimit, AIUsageState, MonetizationErrorShape, PurchaseCtaKind, MonetizationUserState } from "./types";

export { FEATURES, ALL_FEATURES, FEATURE_GATES, FREE_PROTECTED_ROUTES, isKnownFeature } from "./features";
export { getEntitlements, hasEntitlement, requireEntitlement, canAccessFeature, getFeatureGate, getFeatureAccessState, isPremiumAccessConfirmed, freeEntitlements, emptyEntitlements } from "./entitlements";
export { getUsageLimit, getAIUsageState, canConsumeUsage, consumeUsage, usagePercent, aiUsageFixture, AI_USAGE_FIXTURE_PERCENTS, emptyUsageSnapshot, alignUsageSnapshot } from "./usage";
export type { UsageSnapshot } from "./usage";
export { getMonetizationConfig, validateMonetizationConfig, assertProductionBillingSafety, loadStoreIds, isPlaceholderStoreId, storeIdsAreConfigured } from "./config";
export { createDemoCatalog, catalogProducts, findCatalogProduct, annualSavingsFromCatalog, FREE_PLAN, PLUS_PLAN, LIFETIME_PLAN, demoCatalogDisclaimer } from "./catalog";
export { formatStorePrice, formatLocalizedPrice, formatPriceWithPeriod, longPriceStressLabel, SUPPORTED_DEMO_CURRENCIES } from "./pricing";
export { MonetizationError, ProductUnavailableError, PurchaseCancelledError, PurchasePendingError, BillingUnavailableError, StoreNotConfiguredError, RestoreFailedError, EntitlementSyncError, PaymentFailedError, UnknownBillingError, mapBillingError, errorFromCode, errorCatalog } from "./errors";
export { MOCK_BILLING_SCENARIOS, MOCK_SCENARIO_LIST, getMockScenario } from "./scenarios";
export type { MockBillingScenarioId, MockBillingScenario } from "./scenarios";
export { createBillingMachine, reduceBillingMachine, canTransition, BILLING_MACHINE_STATES } from "./state-machine";
export { PAYWALL_BENEFITS, HERO_COPY, ctaLabel, PLAN_COPY, RESTORE_COPY, SUCCESS_COPY, EXPIRATION_COPY, GRACE_COPY } from "./copy";
export { PAYWALL_VARIANTS, assignPaywallVariant, variantById, variantsForUser } from "./variants";
export { buildPaywallViewModel, resolveCta, planCardState } from "./paywall-view-model";
export { trackMonetizationEvent, sanitizeAnalyticsPayload, MONETIZATION_EVENTS, demoRevenueDashboard, selectOffer, getMonetizationAnalyticsQueue, clearMonetizationAnalyticsQueue } from "./analytics";
export { canUseTutor, canUseAdvancedTutor, canRunExperiment, canUseAiRequest, canAccessPremiumMission, canAccessQuantumLab, canAccessExamPrep, canAccessAdvancedAstronomy, canDownloadReports, canUseAdvancedPersonalization, canPreviewPremium, canAccessContent, tutorCapability } from "./access";
export { isPremiumContent, isFreeCoreContent, contentFeature, rankRecommendations, premiumContentIds } from "./content-map";
export { setMonetizationNow, resetMonetizationNow, monetizationNow, nextUtcReset, startOfUtcDay, addDays } from "./clock";
export { FIXTURE_COUNTS, MOCK_MONETIZATION_USERS, buildSubscriptionStateFixtures, buildEntitlementStateFixtures, buildPaywallStateFixtures, buildBillingEventFixtures, buildUsageStateFixtures, buildPurchaseScenarioFixtures, buildPricingScenarioFixtures, buildErrorScenarioFixtures, buildUserJourneys, featureAccessMatrix, demoFunnel, demoCohorts, demoRetention, aiUsageFromFixture } from "./fixtures/index";
export { subscriptionHistory, entitlementHistory, usageHistory, paywallHistory, syntheticReceipt } from "./fixtures/history";
export { MockBillingAdapter } from "./mock-adapter";
export { shouldUseMockBilling, describeBillingBoundary } from "./factory-policy";
