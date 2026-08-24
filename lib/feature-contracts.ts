export const DIFFERENTIATORS = {
  physicsLens: true,
  experimentLoop: true,
  conceptOrbit: true,
  livingNotebook: true,
  mysteryMode: true,
  reverseEngineering: true,
  counterfactualLab: true,
  explainableSimulation: true,
} as const;

export type SignatureFeature = { id: string; title: string; promise: string; nextActions: string[] };

export const signatureFeatures: SignatureFeature[] = [
  { id: "physics-lens", title: "Physics Lens", promise: "Turn everyday scenes into physics investigations.", nextActions: ["predict", "measure", "simulate"] },
  { id: "experiment-loop", title: "Experiment Loop", promise: "Move from prediction to evidence and reflection.", nextActions: ["observe", "predict", "measure", "compare", "reflect"] },
  { id: "living-notebook", title: "Living Notebook", promise: "Keep discoveries and mistakes connected on-device.", nextActions: ["save", "link", "revisit"] },
];

export type LensStage = "observe" | "predict" | "measure" | "model" | "simulate" | "compare" | "reflect";
export const EXPERIMENT_LOOP: readonly LensStage[] = ["observe", "predict", "measure", "model", "simulate", "compare", "reflect"];

export function nextLensStage(stage: LensStage): LensStage | null {
  const index = EXPERIMENT_LOOP.indexOf(stage);
  return index >= 0 && index < EXPERIMENT_LOOP.length - 1 ? EXPERIMENT_LOOP[index + 1] : null;
}

export type TeachingMode = "socratic" | "visual" | "analogy" | "equation-first" | "experiment-first";

export function teachingPrompt(mode: TeachingMode, topic: string): string {
  const instruction: Record<TeachingMode, string> = {
    socratic: "ask one reasoning question before revealing the next step",
    visual: "use a diagram or spatial description first",
    analogy: "use a concrete analogy and state its limits",
    "equation-first": "start from the governing equation",
    "experiment-first": "start from an observation or measurement",
  };
  return `Teach ${topic}: ${instruction[mode]}.`;
}

export type SafeFeatureRoute = "deterministic-physics" | "local-teaching" | "vision-review";

export function safeFeatureRoute(operation: "solve" | "tutor" | "scan" | "practice", hasImage = false): SafeFeatureRoute {
  if (operation === "solve" || operation === "practice") return "deterministic-physics";
  if (operation === "scan" || hasImage) return "vision-review";
  return "local-teaching";
}
