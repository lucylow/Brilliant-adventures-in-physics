import type { MonetizationUserState, PaywallVariant, PaywallVariantId } from "./types";

export const PAYWALL_VARIANTS: readonly PaywallVariant[] = [
  {
    id: "standard",
    description: "Balanced monthly / annual / lifetime presentation.",
    priority: 10,
    eligibleUserState: ["free", "expired", "cancelled", "unknown"],
    planPresentation: ["monthly", "annual", "lifetime"],
    heroTitle: "Unlock the full physics universe.",
    heroBody: "Core learning stays free. BAV+ adds advanced labs and deeper tutoring.",
    featuredPlan: "annual",
  },
  {
    id: "annual_focused",
    description: "Highlights annual when savings can be calculated from known prices.",
    priority: 20,
    eligibleUserState: ["free", "trial", "plus_monthly"],
    planPresentation: ["annual", "monthly", "lifetime"],
    heroTitle: "Go further with annual BAV+.",
    heroBody: "Same BAV+ tools with an annual billing period.",
    featuredPlan: "annual",
  },
  {
    id: "lifetime_focused",
    description: "Presents lifetime as a one-time unlock, not a subscription.",
    priority: 15,
    eligibleUserState: ["free", "plus_monthly", "plus_annual", "expired"],
    planPresentation: ["lifetime", "annual", "monthly"],
    heroTitle: "Keep BAV+ permanently.",
    heroBody: "Lifetime Unlock is a one-time purchase. Not a subscription.",
    featuredPlan: "lifetime",
  },
  {
    id: "ai_focused",
    description: "Shown when the user reached the free AI allowance.",
    priority: 40,
    eligibleUserState: ["free", "trial", "expired"],
    planPresentation: ["annual", "monthly", "lifetime"],
    heroTitle: "Give Bavi more room to coach.",
    heroBody: "Basic explanations stay free. BAV+ removes the daily AI cap.",
    featuredPlan: "annual",
  },
  {
    id: "labs_focused",
    description: "Advanced lab preview entry.",
    priority: 35,
    eligibleUserState: ["free", "expired"],
    planPresentation: ["annual", "monthly", "lifetime"],
    heroTitle: "Open the advanced benches.",
    heroBody: "Preview first. Unlock full advanced labs with BAV+.",
    featuredPlan: "annual",
  },
  {
    id: "exam_focused",
    description: "Exam-prep entry.",
    priority: 30,
    eligibleUserState: ["free", "expired"],
    planPresentation: ["annual", "monthly"],
    heroTitle: "Practice like the exam.",
    heroBody: "Timed sets and review analytics. Core practice stays free.",
    featuredPlan: "annual",
  },
  {
    id: "simulation_focused",
    description: "Premium simulation preview.",
    priority: 32,
    eligibleUserState: ["free", "expired"],
    planPresentation: ["annual", "monthly", "lifetime"],
    heroTitle: "See the model move.",
    heroBody: "Core projectile and wave labs stay free. Advanced sims are BAV+.",
    featuredPlan: "annual",
  },
  {
    id: "returning_user",
    description: "Returning learner with no local entitlement cache.",
    priority: 25,
    eligibleUserState: ["free", "unknown", "expired"],
    planPresentation: ["annual", "lifetime", "monthly"],
    heroTitle: "Welcome back to B.A.V.",
    heroBody: "Restore a previous purchase, or continue free.",
    featuredPlan: "annual",
  },
  {
    id: "trial",
    description: "Only used when the store product actually has a trial.",
    priority: 45,
    eligibleUserState: ["free"],
    planPresentation: ["annual", "monthly"],
    heroTitle: "Try advanced physics tools.",
    heroBody: "A trial is available on this store product. No fake countdown.",
    featuredPlan: "annual",
  },
  {
    id: "feature_unlock",
    description: "Contextual unlock from a specific locked feature.",
    priority: 50,
    eligibleUserState: ["free", "expired", "trial"],
    planPresentation: ["annual", "monthly", "lifetime"],
    heroTitle: "This tool is part of BAV+.",
    heroBody: "Preview what it does, then unlock if it helps your learning.",
    featuredPlan: "annual",
  },
  {
    id: "restore_prompt",
    description: "Reinstall / new device.",
    priority: 28,
    eligibleUserState: ["free", "unknown"],
    planPresentation: ["annual", "monthly", "lifetime"],
    heroTitle: "Already purchased B.A.V.?",
    heroBody: "Restore purchases from the same store account.",
    featuredPlan: "annual",
  },
  {
    id: "expired_renewal",
    description: "Expired subscriber, honest renewal.",
    priority: 38,
    eligibleUserState: ["expired", "cancelled"],
    planPresentation: ["annual", "monthly", "lifetime"],
    heroTitle: "BAV+ ended. Learning did not.",
    heroBody: "Your progress is still here. Renew only if you want the extra tools.",
    featuredPlan: "annual",
  },
  {
    id: "home_discovery",
    description: "Subtle home discovery, not a popup.",
    priority: 5,
    eligibleUserState: ["free"],
    planPresentation: ["annual", "lifetime"],
    heroTitle: "Curious about advanced labs?",
    heroBody: "Take a look. You can keep learning free either way.",
    featuredPlan: "annual",
  },
  {
    id: "tutor_limit",
    description: "AI usage reached.",
    priority: 48,
    eligibleUserState: ["free"],
    planPresentation: ["annual", "monthly"],
    heroTitle: "Today’s free AI coaching is used.",
    heroBody: "Verified examples and the hint ladder still work. BAV+ lifts the cap.",
    featuredPlan: "annual",
  },
  {
    id: "mission_unlock",
    description: "Premium mission teaser.",
    priority: 34,
    eligibleUserState: ["free", "expired"],
    planPresentation: ["annual", "lifetime"],
    heroTitle: "A bigger physics quest is waiting.",
    heroBody: "Preview the story. Unlock the full mission with BAV+.",
    featuredPlan: "annual",
  },
];

export function variantById(id: PaywallVariantId): PaywallVariant {
  const found = PAYWALL_VARIANTS.find((variant) => variant.id === id);
  if (!found) return PAYWALL_VARIANTS[0];
  return found;
}

export function variantsForUser(state: MonetizationUserState): PaywallVariant[] {
  return PAYWALL_VARIANTS.filter((variant) => variant.eligibleUserState.includes(state)).sort((a, b) => b.priority - a.priority);
}

function hashUser(userId: string): number {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function assignPaywallVariant(userId: string, state: MonetizationUserState, preferred?: PaywallVariantId): PaywallVariant {
  if (preferred) {
    const preferredVariant = variantById(preferred);
    if (preferredVariant.eligibleUserState.includes(state) || preferred === "standard") return preferredVariant;
  }
  const eligible = variantsForUser(state);
  if (eligible.length === 0) return PAYWALL_VARIANTS[0];
  const index = hashUser(userId || "anonymous") % eligible.length;
  return eligible[index];
}
