import type { LearningState } from "@/lib/progress-store";

export type BAVPillar = "build" | "adventure" | "visualize";
export type BAVRoute = "/lab" | "/progress" | "/astronomy";

export type BAVPillarModel = {
  id: BAVPillar;
  title: string;
  description: string;
  route: BAVRoute;
};

export type BAVExperiment = {
  id: string;
  title: string;
  domain: "mechanics" | "electronics" | "waves";
  description: string;
  rewardXp: number;
};

export type BAVQuest = {
  id: string;
  title: string;
  topic: string;
  requiredActions: number;
  rewardXp: number;
};

export type BAVVisualization = {
  id: string;
  title: string;
  domain: "fields" | "waves" | "cosmos";
  description: string;
};

export const BAV_BRAND = {
  name: "B.A.V.",
  fullName: "Brilliant Adventures in Physics",
  tagline: "Turn curiosity into discovery.",
} as const;

export const BAV_PILLARS: BAVPillarModel[] = [
  { id: "build", title: "Build", description: "Create experiments and test one variable at a time.", route: "/lab" },
  { id: "adventure", title: "Adventure", description: "Turn practice and lessons into a steady scientific journey.", route: "/progress" },
  { id: "visualize", title: "Visualize", description: "See equations become waves, fields, particles, and worlds.", route: "/astronomy" },
];

export const BAV_FALLBACK_EXPERIMENTS: BAVExperiment[] = [
  { id: "gravity-builder", title: "Build a gravity system", domain: "mechanics", description: "Change launch conditions and inspect a verified trajectory.", rewardXp: 25 },
  { id: "circuit-builder", title: "Build a circuit", domain: "electronics", description: "Use Ohm’s law to predict current from voltage and resistance.", rewardXp: 30 },
  { id: "wave-builder", title: "Build a wave", domain: "waves", description: "Compare amplitude, frequency, and wavelength in a bounded model.", rewardXp: 28 },
];

export const BAV_FALLBACK_QUESTS: BAVQuest[] = [
  { id: "first-observation", title: "Make a first observation", topic: "projectile-motion", requiredActions: 1, rewardXp: 20 },
  { id: "evidence-builder", title: "Collect two pieces of evidence", topic: "kinematics", requiredActions: 2, rewardXp: 35 },
  { id: "cosmic-visualizer", title: "Explore a cosmic model", topic: "astronomy", requiredActions: 1, rewardXp: 30 },
];

export const BAV_FALLBACK_VISUALIZATIONS: BAVVisualization[] = [
  { id: "trajectory", title: "Trajectory", domain: "fields", description: "Follow position and velocity through a readable path." },
  { id: "wavefunction", title: "Wave pattern", domain: "waves", description: "Compare phase and amplitude with reduced-motion-safe visuals." },
  { id: "cosmic-map", title: "Cosmic map", domain: "cosmos", description: "Connect stellar, planetary, and cosmological scales." },
];

export function bavPillarRoute(pillar: BAVPillar): BAVRoute {
  const model = BAV_PILLARS.find((item) => item.id === pillar);
  if (!model) throw new Error("Unknown BAV pillar");
  return model.route;
}

export function bavQuestProgress(quest: BAVQuest, learning: LearningState): number {
  if (!Number.isInteger(quest.requiredActions) || quest.requiredActions <= 0) throw new Error("Quest actions must be positive");
  const topicAttempts = learning.topics[quest.topic]?.attempts ?? 0;
  if (!Number.isFinite(topicAttempts) || topicAttempts < 0) throw new Error("Learning attempts must be non-negative");
  return Math.min(1, topicAttempts / quest.requiredActions);
}

export function boundedBAVCatalog<T>(items: T[], maxItems = 24): T[] {
  if (!Number.isInteger(maxItems) || maxItems <= 0) throw new Error("Catalog limit must be positive");
  return items.slice(0, maxItems);
}
