import type { BillingPeriod, CatalogProduct, FeatureId, Plan, PlanCode, PricingOption, ProductCatalog } from "./types";
import { PLUS_FEATURES } from "./features";
import { DEMO_PRICE_MICROS, getMonetizationConfig, isPlaceholderStoreId } from "./config";
import { formatStorePrice } from "./pricing";

export const FREE_PLAN: Plan = {
  id: "free",
  displayName: "Free",
  description: "Core Tutor, Practice, Lessons, and deterministic Lab learning.",
  billingPeriod: "none",
  isSubscription: false,
  entitlements: [],
  sortOrder: 0,
};

export const PLUS_PLAN: Plan = {
  id: "plus",
  displayName: "BAV+",
  description: "Unlock advanced labs, deeper tutoring, and exam preparation.",
  billingPeriod: "monthly",
  isSubscription: true,
  entitlements: PLUS_FEATURES,
  sortOrder: 1,
};

export const LIFETIME_PLAN: Plan = {
  id: "lifetime",
  displayName: "Lifetime Unlock",
  description: "One-time purchase for permanent BAV+ access. Not a subscription.",
  billingPeriod: "lifetime",
  isSubscription: false,
  entitlements: PLUS_FEATURES,
  sortOrder: 3,
};

export const FAMILY_PLAN: Plan = {
  id: "family",
  displayName: "Family",
  description: "Reserved for a future family license. Not offered for purchase yet.",
  billingPeriod: "annual",
  isSubscription: true,
  entitlements: PLUS_FEATURES,
  sortOrder: 4,
};

export const EDUCATION_PLAN: Plan = {
  id: "education",
  displayName: "Educational licensing",
  description: "Reserved for future classroom licensing. Not offered for purchase yet.",
  billingPeriod: "annual",
  isSubscription: true,
  entitlements: PLUS_FEATURES,
  sortOrder: 5,
};

export const PLANS_BY_ID: Record<PlanCode, Plan> = {
  free: FREE_PLAN,
  plus: PLUS_PLAN,
  lifetime: LIFETIME_PLAN,
  family: FAMILY_PLAN,
  education: EDUCATION_PLAN,
};

function demoPrice(amountMicros: number, currencyCode: string, locale: string, period: BillingPeriod): PricingOption {
  return {
    amountMicros,
    currencyCode,
    storePrice: formatStorePrice(amountMicros, currencyCode, locale),
    displayPrice: formatStorePrice(amountMicros, currencyCode, locale),
    period,
    locale,
  };
}

export function createDemoCatalog(options?: { locale?: string; currencyCode?: string; platform?: "ios" | "android" }): ProductCatalog {
  const locale = options?.locale ?? "en-US";
  const currencyCode = options?.currencyCode ?? "USD";
  const platform = options?.platform ?? "ios";
  const ids = getMonetizationConfig().storeIds[platform];
  const entitlements: readonly FeatureId[] = PLUS_FEATURES;
  const monthly: CatalogProduct = {
    id: "bav-plus-monthly",
    storeProductId: ids.monthly,
    displayName: "BAV+ Monthly",
    description: "Advanced labs, deeper Bavi tutoring, and exam preparation, billed monthly.",
    billingPeriod: "monthly",
    plan: "plus",
    price: demoPrice(DEMO_PRICE_MICROS.monthlyUsd, currencyCode, locale, "monthly"),
    trialAvailability: getMonetizationConfig().trial.enabled,
    entitlements,
    isFeatured: false,
    sortOrder: 1,
    isLifetime: false,
  };
  const annual: CatalogProduct = {
    id: "bav-plus-annual",
    storeProductId: ids.annual,
    displayName: "BAV+ Annual",
    description: "Same BAV+ access with an annual billing period.",
    billingPeriod: "annual",
    plan: "plus",
    price: demoPrice(DEMO_PRICE_MICROS.annualUsd, currencyCode, locale, "annual"),
    trialAvailability: getMonetizationConfig().trial.enabled,
    entitlements,
    isFeatured: true,
    sortOrder: 2,
    isLifetime: false,
  };
  const lifetime: CatalogProduct = {
    id: "bav-lifetime",
    storeProductId: ids.lifetime,
    displayName: "Lifetime Unlock",
    description: "One-time purchase. Permanent BAV+ access. Not a subscription.",
    billingPeriod: "lifetime",
    plan: "lifetime",
    price: demoPrice(DEMO_PRICE_MICROS.lifetimeUsd, currencyCode, locale, "lifetime"),
    trialAvailability: false,
    entitlements,
    isFeatured: false,
    sortOrder: 3,
    isLifetime: true,
  };
  return { freePlan: FREE_PLAN, monthlyPlan: monthly, annualPlan: annual, lifetimePlan: lifetime, familyPlan: FAMILY_PLAN, educationPlan: EDUCATION_PLAN };
}

export function catalogProducts(catalog: ProductCatalog): CatalogProduct[] {
  return [catalog.monthlyPlan, catalog.annualPlan, catalog.lifetimePlan].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findCatalogProduct(catalog: ProductCatalog, productId: string): CatalogProduct | undefined {
  return catalogProducts(catalog).find((product) => product.id === productId || product.storeProductId === productId);
}

export function demoCatalogDisclaimer(catalog: ProductCatalog): string {
  const ids = catalogProducts(catalog).map((product) => product.storeProductId);
  if (ids.some(isPlaceholderStoreId)) {
    return "DEMO catalog. These are not App Store or Play Store products.";
  }
  return "Prices come from the configured store products.";
}

export function annualSavingsFromCatalog(catalog: ProductCatalog): { amountMicros: number; percent: number; display: string | null } {
  const monthly = catalog.monthlyPlan.price.amountMicros;
  const annual = catalog.annualPlan.price.amountMicros;
  if (monthly === null || annual === null || monthly <= 0 || annual <= 0) {
    return { amountMicros: 0, percent: 0, display: null };
  }
  const amountMicros = Math.max(0, monthly * 12 - annual);
  const percent = amountMicros > 0 ? Math.round((amountMicros / (monthly * 12)) * 100) : 0;
  const currency = catalog.annualPlan.price.currencyCode;
  const locale = catalog.annualPlan.price.locale;
  return {
    amountMicros,
    percent,
    display: amountMicros > 0 ? formatStorePrice(amountMicros, currency, locale) : null,
  };
}
