import { annualSavingsFromCatalog, catalogProducts, type ProductCatalog } from "./catalog";
import { ctaLabel, HERO_COPY, PAYWALL_BENEFITS, PLAN_COPY, TRIAL_COPY } from "./copy";
import type { BillingPeriod, CatalogProduct, Entitlements, FeatureId, PaywallVariant, PurchaseCtaKind, PurchaseFlowState } from "./types";
import { formatPriceWithPeriod } from "./pricing";
import { hasEntitlement } from "./entitlements";

export type PlanCardState = "selected" | "unselected" | "recommended" | "disabled" | "loading";

export type PlanCardViewModel = {
  product: CatalogProduct;
  periodLabel: string;
  priceLabel: string;
  finePrint: string;
  eyebrow: string;
  selected: boolean;
  recommended: boolean;
  disabled: boolean;
  loading: boolean;
  isSubscription: boolean;
  accessibilityLabel: string;
};

export type PaywallViewModel = {
  title: string;
  subtitle: string;
  benefits: { title: string; body: string }[];
  plans: PlanCardViewModel[];
  cta: { kind: PurchaseCtaKind; label: string; disabled: boolean; loading: boolean };
  restoreLabel: string;
  restoreDisabled: boolean;
  closeLabel: string;
  trialMessage: string | null;
  savingsMessage: string | null;
  errorMessage: string | null;
  emptyMessage: string | null;
  offlineMessage: string | null;
  alreadyEntitled: boolean;
  lifetimeOwned: boolean;
};

export function planCardState(args: {
  selectedId: string | undefined;
  product: CatalogProduct;
  featuredPeriod: BillingPeriod;
  loading: boolean;
  disabled: boolean;
}): PlanCardState {
  if (args.loading) return "loading";
  if (args.disabled) return "disabled";
  if (args.selectedId === args.product.id) return "selected";
  if (args.product.billingPeriod === args.featuredPeriod || args.product.isFeatured) return "recommended";
  return "unselected";
}

export function resolveCta(args: {
  product?: CatalogProduct;
  flow: PurchaseFlowState;
  entitlements: Entitlements;
  trialConfigured: boolean;
}): PurchaseCtaKind {
  if (args.flow === "purchaseFailed" || args.flow === "restoreFailed") return "try_again";
  if (args.entitlements.lifetimeOwned) return "manage";
  if (args.product?.isLifetime) return "get_lifetime";
  if (args.trialConfigured && args.product?.trialAvailability && args.entitlements.trial?.state === "notStarted") return "start_free_trial";
  if (args.product?.billingPeriod === "monthly" || args.product?.billingPeriod === "annual") {
    return args.entitlements.plan === "free" ? "unlock_bav_plus" : "subscribe";
  }
  return "unlock_bav_plus";
}

export function entitledBenefits(entitlements: Entitlements): FeatureId[] {
  return PAYWALL_BENEFITS.filter((benefit) => hasEntitlement(entitlements, benefit.id)).map((benefit) => benefit.id);
}

export function buildPaywallViewModel(input: {
  catalog: ProductCatalog | null;
  variant: PaywallVariant;
  selectedProductId?: string;
  flow: PurchaseFlowState;
  entitlements: Entitlements;
  connected: boolean;
  errorMessage?: string | null;
}): PaywallViewModel {
  const products = input.catalog ? catalogProducts(input.catalog) : [];
  const loading = input.flow === "loadingProducts" || input.flow === "purchasing" || input.flow === "restoring" || input.flow === "syncing";
  const selected = products.find((product) => product.id === input.selectedProductId) ?? products.find((product) => product.billingPeriod === input.variant.featuredPlan) ?? products[0];
  const savings = input.catalog ? annualSavingsFromCatalog(input.catalog) : { display: null, percent: 0 };
  const trialConfigured = Boolean(selected?.trialAvailability);
  const ctaKind = resolveCta({ product: selected, flow: input.flow, entitlements: input.entitlements, trialConfigured });
  const emptyMessage = !input.catalog || products.length === 0 ? "Plans could not be loaded, so prices are hidden. Free learning remains available." : null;

  const plans: PlanCardViewModel[] = products.map((product) => {
    const state = planCardState({
      selectedId: selected?.id,
      product,
      featuredPeriod: input.variant.featuredPlan,
      loading,
      disabled: input.flow === "purchasing" || !input.connected,
    });
    const priceLabel = formatPriceWithPeriod(product.price.displayPrice, product.billingPeriod);
    const copy = product.billingPeriod === "lifetime" ? PLAN_COPY.lifetime : product.billingPeriod === "annual" ? PLAN_COPY.annual : PLAN_COPY.monthly;
    return {
      product,
      periodLabel: copy.title,
      priceLabel,
      finePrint: copy.finePrint,
      eyebrow: copy.eyebrow,
      selected: state === "selected",
      recommended: state === "recommended" || product.isFeatured,
      disabled: state === "disabled",
      loading: state === "loading",
      isSubscription: !product.isLifetime,
      accessibilityLabel: `${copy.title}, ${priceLabel}. ${product.description}`,
    };
  });

  return {
    title: input.variant.heroTitle || HERO_COPY.title,
    subtitle: input.variant.heroBody || HERO_COPY.body,
    benefits: PAYWALL_BENEFITS.map((benefit) => ({ title: benefit.title, body: benefit.body })),
    plans,
    cta: {
      kind: ctaKind,
      label: ctaLabel(ctaKind),
      disabled: loading || !selected || Boolean(emptyMessage) || input.entitlements.lifetimeOwned,
      loading: input.flow === "purchasing" || input.flow === "restoring",
    },
    restoreLabel: "Restore purchases",
    restoreDisabled: input.flow === "restoring" || input.flow === "purchasing",
    closeLabel: "Close",
    trialMessage: trialConfigured ? TRIAL_COPY.available : null,
    savingsMessage: savings.display && savings.percent > 0 ? `Annual saves ${savings.display} compared with 12 months of the monthly plan.` : null,
    errorMessage: input.errorMessage ?? null,
    emptyMessage,
    offlineMessage: input.connected ? null : "Purchasing needs a connection. Free Tutor, Practice, and core Lab tools still work.",
    alreadyEntitled: input.entitlements.status === "unlimited" || input.entitlements.status === "trial",
    lifetimeOwned: input.entitlements.lifetimeOwned,
  };
}
