import type { FeatureGate, FeatureId, PlanCode } from "./types";

export const FEATURES = {
  ADVANCED_LABS: "advanced_labs",
  UNLIMITED_EXPERIMENTS: "unlimited_experiments",
  ADVANCED_TUTOR: "advanced_tutor",
  DEEP_EXPLANATIONS: "deep_explanations",
  EXAM_PREP: "exam_prep",
  QUANTUM_LABS: "quantum_labs",
  ADVANCED_ASTRONOMY: "advanced_astronomy",
  DOWNLOADABLE_REPORTS: "downloadable_reports",
  ADVANCED_PERSONALIZATION: "advanced_personalization",
  PREMIUM_MISSIONS: "premium_missions",
  UNLIMITED_TUTOR: "unlimited_tutor",
  ADVANCED_SCANS: "advanced_scans",
  ADVANCED_SIMULATIONS: "advanced_simulations",
} as const satisfies Record<string, FeatureId>;

export const ALL_FEATURES: readonly FeatureId[] = [
  FEATURES.ADVANCED_LABS,
  FEATURES.UNLIMITED_EXPERIMENTS,
  FEATURES.ADVANCED_TUTOR,
  FEATURES.DEEP_EXPLANATIONS,
  FEATURES.EXAM_PREP,
  FEATURES.QUANTUM_LABS,
  FEATURES.ADVANCED_ASTRONOMY,
  FEATURES.DOWNLOADABLE_REPORTS,
  FEATURES.ADVANCED_PERSONALIZATION,
  FEATURES.PREMIUM_MISSIONS,
  FEATURES.UNLIMITED_TUTOR,
  FEATURES.ADVANCED_SCANS,
  FEATURES.ADVANCED_SIMULATIONS,
];

export const PLUS_FEATURES: readonly FeatureId[] = ALL_FEATURES;

export const FEATURE_GATES: Record<FeatureId, FeatureGate> = {
  advanced_labs: {
    id: "advanced_labs",
    title: "Advanced labs",
    description: "Deeper interactive experiments beyond the core projectile, wave, and circuit benches.",
    requiredPlan: "plus",
    freePreview: true,
    coreLearning: false,
  },
  unlimited_experiments: {
    id: "unlimited_experiments",
    title: "Unlimited experiments",
    description: "Run as many saved experiment sessions as you need each day.",
    requiredPlan: "plus",
    freePreview: false,
    coreLearning: false,
    usageMeter: "experiments",
  },
  advanced_tutor: {
    id: "advanced_tutor",
    title: "Advanced Bavi tutoring",
    description: "Longer coaching threads and richer follow-ups after the free daily allowance.",
    requiredPlan: "plus",
    freePreview: false,
    coreLearning: false,
    usageMeter: "ai_requests",
  },
  deep_explanations: {
    id: "deep_explanations",
    title: "Deeper explanations",
    description: "Multi-step reasoning summaries that go beyond the basic hint ladder.",
    requiredPlan: "plus",
    freePreview: true,
    coreLearning: false,
  },
  exam_prep: {
    id: "exam_prep",
    title: "Exam preparation",
    description: "Timed practice sets, review analytics, and generated exam-style drills.",
    requiredPlan: "plus",
    freePreview: true,
    coreLearning: false,
  },
  quantum_labs: {
    id: "quantum_labs",
    title: "Quantum labs",
    description: "Photoelectric, tunneling, and other modern-physics benches beyond intro calculations.",
    requiredPlan: "plus",
    freePreview: true,
    coreLearning: false,
  },
  advanced_astronomy: {
    id: "advanced_astronomy",
    title: "Advanced astronomy",
    description: "Extended cosmology visualizations and orbital labs beyond the free solar-system intro.",
    requiredPlan: "plus",
    freePreview: true,
    coreLearning: false,
  },
  downloadable_reports: {
    id: "downloadable_reports",
    title: "Downloadable experiment summaries",
    description: "Export a shareable experiment summary. Viewing already-saved notes stays free.",
    requiredPlan: "plus",
    freePreview: false,
    coreLearning: false,
    usageMeter: "downloads",
  },
  advanced_personalization: {
    id: "advanced_personalization",
    title: "Advanced personalization",
    description: "Deeper learner modeling and adaptive plans. Basic next-concept recommendations stay free.",
    requiredPlan: "plus",
    freePreview: false,
    coreLearning: false,
  },
  premium_missions: {
    id: "premium_missions",
    title: "Premium missions",
    description: "Aspirational quests that use advanced labs, quantum, or exam-prep loops.",
    requiredPlan: "plus",
    freePreview: true,
    coreLearning: false,
  },
  unlimited_tutor: {
    id: "unlimited_tutor",
    title: "Unlimited AI tutor",
    description: "No daily cap on Bavi AI requests.",
    requiredPlan: "plus",
    freePreview: false,
    coreLearning: false,
    usageMeter: "ai_requests",
  },
  advanced_scans: {
    id: "advanced_scans",
    title: "Advanced scan analysis",
    description: "Richer multimodal follow-up on captured problems. Core Physics Lens measurement stays free.",
    requiredPlan: "plus",
    freePreview: true,
    coreLearning: false,
  },
  advanced_simulations: {
    id: "advanced_simulations",
    title: "Advanced simulations",
    description: "Premium benches such as tunneling, photoelectric, and RC circuits.",
    requiredPlan: "plus",
    freePreview: true,
    coreLearning: false,
  },
};

export const FREE_PROTECTED_ROUTES = [
  "/",
  "/tutor",
  "/practice",
  "/lesson",
  "/concepts",
  "/lab",
  "/progress",
  "/notebook",
  "/privacy",
  "/settings",
  "/onboarding",
] as const;

export const FREE_PROTECTED_CAPABILITIES = [
  "core_lessons",
  "basic_practice",
  "deterministic_calculations",
  "saved_progress",
  "accessibility",
  "basic_tutor_hints",
  "core_physics_lens",
] as const;

export function isKnownFeature(value: string): value is FeatureId {
  return ALL_FEATURES.includes(value as FeatureId);
}

export function requiredPlanFor(feature: FeatureId): PlanCode {
  return FEATURE_GATES[feature].requiredPlan;
}

export function isCoreLearningFeature(feature: FeatureId): boolean {
  return FEATURE_GATES[feature].coreLearning;
}

export function featureAllowsPreview(feature: FeatureId): boolean {
  return FEATURE_GATES[feature].freePreview;
}
