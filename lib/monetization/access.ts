import type { Entitlements, FeatureId, TutorCapability } from "./types";
import { canAccessFeature, hasEntitlement } from "./entitlements";
import { canConsumeUsage, type UsageSnapshot } from "./usage";
import { FEATURES } from "./features";
import { contentFeature, isPremiumContent } from "./content-map";

export function canUseTutor(): boolean {
  return true;
}

export function canUseAdvancedTutor(entitlements: Entitlements): boolean {
  return hasEntitlement(entitlements, FEATURES.ADVANCED_TUTOR) || hasEntitlement(entitlements, FEATURES.UNLIMITED_TUTOR);
}

export function canUseDeepExplanations(entitlements: Entitlements): boolean {
  return hasEntitlement(entitlements, FEATURES.DEEP_EXPLANATIONS);
}

export function tutorCapability(entitlements: Entitlements): TutorCapability {
  if (hasEntitlement(entitlements, FEATURES.ADVANCED_PERSONALIZATION)) return "personalized_tutoring";
  if (canUseDeepExplanations(entitlements)) return "deep_reasoning";
  if (canUseAdvancedTutor(entitlements)) return "advanced_tutoring";
  return "basic_explanation";
}

export function canRunExperiment(entitlements: Entitlements, usage: UsageSnapshot, now?: number): boolean {
  if (hasEntitlement(entitlements, FEATURES.UNLIMITED_EXPERIMENTS)) return true;
  return canConsumeUsage("experiments", usage, entitlements, now);
}

export function canUseAiRequest(entitlements: Entitlements, usage: UsageSnapshot, now?: number): boolean {
  if (canUseAdvancedTutor(entitlements)) return true;
  return canConsumeUsage("ai_requests", usage, entitlements, now);
}

export function canAccessPremiumMission(entitlements: Entitlements): boolean {
  return hasEntitlement(entitlements, FEATURES.PREMIUM_MISSIONS);
}

export function canAccessQuantumLab(entitlements: Entitlements): boolean {
  return hasEntitlement(entitlements, FEATURES.QUANTUM_LABS);
}

export function canAccessExamPrep(entitlements: Entitlements): boolean {
  return hasEntitlement(entitlements, FEATURES.EXAM_PREP);
}

export function canAccessAdvancedAstronomy(entitlements: Entitlements): boolean {
  return hasEntitlement(entitlements, FEATURES.ADVANCED_ASTRONOMY);
}

export function canDownloadReports(entitlements: Entitlements, usage: UsageSnapshot, now?: number): boolean {
  if (!hasEntitlement(entitlements, FEATURES.DOWNLOADABLE_REPORTS)) return false;
  return canConsumeUsage("downloads", usage, entitlements, now);
}

export function canUseAdvancedPersonalization(entitlements: Entitlements): boolean {
  return hasEntitlement(entitlements, FEATURES.ADVANCED_PERSONALIZATION);
}

export function canPreviewPremium(entitlements: Entitlements, usage: UsageSnapshot, now?: number): boolean {
  if (hasEntitlement(entitlements, FEATURES.ADVANCED_LABS)) return true;
  return canConsumeUsage("premium_previews", usage, entitlements, now);
}

export function canAccessContent(contentId: string, entitlements: Entitlements): boolean {
  if (!isPremiumContent(contentId)) return true;
  const feature = contentFeature(contentId);
  if (!feature) return true;
  return canAccessFeature(entitlements, feature);
}

export function featureForContent(contentId: string): FeatureId | null {
  return contentFeature(contentId);
}
