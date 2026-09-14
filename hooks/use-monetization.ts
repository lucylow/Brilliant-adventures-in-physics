import { useEffect, useState } from "react";
import { getMonetizationStore, subscribeMonetization, type MonetizationStore } from "@/lib/monetization/runtime";
import { canAccessFeature, getFeatureAccessState, hasEntitlement } from "@/lib/monetization/entitlements";
import type { FeatureId } from "@/lib/monetization/types";
import { getAIUsageState, getUsageLimit } from "@/lib/monetization/usage";
import { canUseAdvancedTutor, canUseAiRequest, canRunExperiment } from "@/lib/monetization/access";

export function useMonetization(): MonetizationStore {
  const [state, setState] = useState(getMonetizationStore());
  useEffect(() => subscribeMonetization(setState), []);
  return state;
}

export function useEntitlements() {
  const store = useMonetization();
  return {
    entitlements: store.entitlements,
    canAccess: (feature: FeatureId) => canAccessFeature(store.entitlements, feature),
    has: (feature: FeatureId) => hasEntitlement(store.entitlements, feature),
    accessState: (feature: FeatureId) => getFeatureAccessState(store.entitlements, feature),
    lifetimeOwned: store.entitlements.lifetimeOwned,
    plan: store.entitlements.plan,
    status: store.entitlements.status,
  };
}

export function useUsageLimits() {
  const store = useMonetization();
  return {
    usage: store.usage,
    ai: getAIUsageState(store.usage, store.entitlements),
    experiments: getUsageLimit("experiments", store.usage, store.entitlements),
    previews: getUsageLimit("premium_previews", store.usage, store.entitlements),
    canAskAi: canUseAiRequest(store.entitlements, store.usage),
    canRunExperiment: canRunExperiment(store.entitlements, store.usage),
    advancedTutor: canUseAdvancedTutor(store.entitlements),
  };
}

export function usePaywallNavigation() {
  const store = useMonetization();
  return {
    returnTo: store.returnTo,
    selectedProductId: store.selectedProductId,
    flow: store.machine.state,
    inFlight: store.machine.inFlight,
  };
}
