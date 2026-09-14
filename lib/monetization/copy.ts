import type { FeatureId, OfferKind, PurchaseCtaKind } from "./types";
import { FEATURES } from "./features";

export type BenefitCopy = {
  id: FeatureId;
  title: string;
  body: string;
};

export const PAYWALL_BENEFITS: readonly BenefitCopy[] = [
  { id: FEATURES.ADVANCED_TUTOR, title: "Deeper Bavi tutoring", body: "Longer coaching threads after the free daily allowance." },
  { id: FEATURES.UNLIMITED_EXPERIMENTS, title: "Unlimited experiments", body: "Keep running labs without the free daily cap." },
  { id: FEATURES.ADVANCED_SIMULATIONS, title: "Premium simulations", body: "Advanced benches such as photoelectric and RC circuits." },
  { id: FEATURES.EXAM_PREP, title: "Exam preparation", body: "Timed practice and review analytics when you want them." },
  { id: FEATURES.QUANTUM_LABS, title: "Quantum labs", body: "Modern-physics experiences beyond intro photon calculations." },
  { id: FEATURES.ADVANCED_ASTRONOMY, title: "Advanced astronomy", body: "Extended orbital and cosmology visualizations." },
  { id: FEATURES.DEEP_EXPLANATIONS, title: "Deeper explanations", body: "Reasoning summaries that go past the basic hint ladder." },
  { id: FEATURES.ADVANCED_PERSONALIZATION, title: "Personalized learning", body: "Richer recommendations. Basic next-concept suggestions stay free." },
];

export const HERO_COPY = {
  title: "Unlock the full physics universe.",
  body: "Core learning stays free. BAV+ adds advanced labs, deeper tutoring, and exam tools when you want them.",
} as const;

export const PLAN_COPY = {
  monthly: { title: "Monthly", eyebrow: "BAV+", finePrint: "Billed monthly. Cancel in your store account." },
  annual: { title: "Annual", eyebrow: "Recommended", finePrint: "Billed annually. Cancel in your store account." },
  lifetime: { title: "Lifetime Unlock", eyebrow: "One-time purchase", finePrint: "Permanent access. Not a subscription." },
} as const;

export const TRIAL_COPY = {
  available: "Start with a free trial, then continue with BAV+ if it helps.",
  unavailable: "No trial is configured for this product.",
  endingSoon: "Your trial is ending soon. Free learning remains if you do not continue.",
  expired: "Your trial has ended. Free Tutor, Practice, and core Lab tools remain available.",
} as const;

export const RESTORE_COPY = {
  action: "Restore purchases",
  success: "Your B.A.V. purchase was restored.",
  empty: "No active B.A.V. purchase was found on this account.",
  failed: "We could not restore purchases right now.",
} as const;

export const EXPIRATION_COPY = {
  title: "Your BAV+ period ended",
  body: "Saved progress, core lessons, practice, and deterministic labs remain. Advanced labs and extra AI usage need BAV+ again.",
} as const;

export const GRACE_COPY = {
  title: "We’re waiting on the store",
  body: "Your access is in a billing grace period. This is not a permanent failure. Free learning remains available either way.",
} as const;

export const SUCCESS_COPY = {
  plus: { title: "BAV+ is unlocked", body: "Advanced labs, deeper tutoring, and exam tools are ready." },
  lifetime: { title: "Lifetime unlock is yours", body: "Permanent BAV+ access. This is not a subscription." },
} as const;

export function ctaLabel(kind: PurchaseCtaKind): string {
  switch (kind) {
    case "start_free_trial":
      return "Start Free Trial";
    case "subscribe":
      return "Subscribe";
    case "unlock_bav_plus":
      return "Unlock BAV+";
    case "get_lifetime":
      return "Get Lifetime Access";
    case "restore":
      return "Restore Purchase";
    case "try_again":
      return "Try Again";
    case "manage":
      return "Manage Subscription";
    case "continue_free":
      return "Continue learning free";
    default:
      return "Continue";
  }
}

export function offerCopy(kind: OfferKind): { title: string; body: string } {
  if (kind === "trial") return { title: "Try BAV+", body: "A trial is available on this store product." };
  if (kind === "annual_spotlight") return { title: "Annual BAV+", body: "Pay once a year when both monthly and annual prices are known." };
  if (kind === "lifetime") return { title: "Lifetime Unlock", body: "One-time purchase for permanent access." };
  if (kind === "returning_user") return { title: "Welcome back", body: "Restore an existing purchase or pick a plan. No fake countdown." };
  return { title: "Unlock more of the physics universe", body: "Choose a plan only if the extra tools help." };
}
