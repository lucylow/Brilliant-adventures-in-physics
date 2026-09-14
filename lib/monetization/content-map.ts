import type { ContentAccessTag, FeatureId } from "./types";
import { FEATURES } from "./features";

const TAGS: ContentAccessTag[] = [
  { contentId: "sim-projectile", kind: "simulation", feature: FEATURES.ADVANCED_SIMULATIONS, freePreview: false },
  { contentId: "sim-shm", kind: "simulation", feature: FEATURES.ADVANCED_SIMULATIONS, freePreview: false },
  { contentId: "sim-waves", kind: "simulation", feature: FEATURES.ADVANCED_SIMULATIONS, freePreview: false },
  { contentId: "sim-fields", kind: "simulation", feature: FEATURES.ADVANCED_SIMULATIONS, freePreview: true },
  { contentId: "sim-lens", kind: "simulation", feature: FEATURES.ADVANCED_SIMULATIONS, freePreview: true },
  { contentId: "sim-orbit", kind: "simulation", feature: FEATURES.ADVANCED_ASTRONOMY, freePreview: true },
  { contentId: "sim-tunnel", kind: "simulation", feature: FEATURES.QUANTUM_LABS, freePreview: true },
  { contentId: "sim-rc", kind: "simulation", feature: FEATURES.ADVANCED_LABS, freePreview: true },
  { contentId: "sim-photoelectric", kind: "lab", feature: FEATURES.QUANTUM_LABS, freePreview: true },
  { contentId: "mission-quantum-mystery", kind: "mission", feature: FEATURES.PREMIUM_MISSIONS, freePreview: true },
  { contentId: "mission-escape-velocity", kind: "mission", feature: FEATURES.PREMIUM_MISSIONS, freePreview: true },
  { contentId: "mission-relativity-clock", kind: "mission", feature: FEATURES.PREMIUM_MISSIONS, freePreview: true },
  { contentId: "mission-debroglie-speck", kind: "mission", feature: FEATURES.PREMIUM_MISSIONS, freePreview: true },
  { contentId: "mission-hubble-stick", kind: "mission", feature: FEATURES.PREMIUM_MISSIONS, freePreview: true },
  { contentId: "mission-nuclear-ledger", kind: "mission", feature: FEATURES.PREMIUM_MISSIONS, freePreview: true },
  { contentId: "exam-timed-mechanics", kind: "exam", feature: FEATURES.EXAM_PREP, freePreview: true },
  { contentId: "exam-circuits", kind: "exam", feature: FEATURES.EXAM_PREP, freePreview: true },
  { contentId: "astro-cmb", kind: "astronomy", feature: FEATURES.ADVANCED_ASTRONOMY, freePreview: true },
  { contentId: "astro-light-cone", kind: "astronomy", feature: FEATURES.ADVANCED_ASTRONOMY, freePreview: true },
  { contentId: "quantum-tunnel-bench", kind: "quantum", feature: FEATURES.QUANTUM_LABS, freePreview: true },
  { contentId: "quantum-photoelectric-bench", kind: "quantum", feature: FEATURES.QUANTUM_LABS, freePreview: true },
  { contentId: "report-experiment-export", kind: "download", feature: FEATURES.DOWNLOADABLE_REPORTS, freePreview: false },
];

const FREE_CORE = new Set([
  "sim-projectile",
  "sim-shm",
  "sim-waves",
  "mission-first-trajectory",
  "mission-wave-beacon",
  "mission-hidden-wave",
  "mission-circuit-rescue",
  "mission-energy-ledger",
  "mission-falling-satellite",
]);

const byId = new Map(TAGS.map((tag) => [tag.contentId, tag]));

export function contentTag(contentId: string): ContentAccessTag | undefined {
  return byId.get(contentId);
}

export function isPremiumContent(contentId: string): boolean {
  if (FREE_CORE.has(contentId)) return false;
  const tag = byId.get(contentId);
  return Boolean(tag);
}

export function isFreeCoreContent(contentId: string): boolean {
  return FREE_CORE.has(contentId);
}

export function contentFeature(contentId: string): FeatureId | null {
  if (FREE_CORE.has(contentId)) return null;
  return byId.get(contentId)?.feature ?? null;
}

export function premiumContentIds(): string[] {
  return TAGS.filter((tag) => !FREE_CORE.has(tag.contentId)).map((tag) => tag.contentId);
}

export function contentAllowsPreview(contentId: string): boolean {
  return byId.get(contentId)?.freePreview === true;
}

export function rankRecommendations<T extends { id: string }>(items: readonly T[], canAccess: (id: string) => boolean, promotePremiumDiscovery = false): T[] {
  return [...items].sort((a, b) => {
    const aFree = canAccess(a.id) || isFreeCoreContent(a.id) || !isPremiumContent(a.id);
    const bFree = canAccess(b.id) || isFreeCoreContent(b.id) || !isPremiumContent(b.id);
    if (promotePremiumDiscovery) return Number(aFree) - Number(bFree);
    return Number(bFree) - Number(aFree);
  });
}
