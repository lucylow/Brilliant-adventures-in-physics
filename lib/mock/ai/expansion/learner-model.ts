import { conceptRegistry, conceptState } from "@/lib/concepts";
import { isoDaysAgo } from "../../clock";
import { clone } from "../../utils/clone";
import { stableId } from "../../utils/ids";
import type { TutorResponseStyle } from "../ai-types";
import type {
  ConceptKnowledge,
  LearnerEvent,
  LearnerInsight,
  LearnerModel,
  LearnerModelId,
  LearnerPreference,
  LearnerSignal,
} from "./types";
import { MOCK_AI_EXPANSION_VERSION } from "./types";

const MODEL_USERS: Record<LearnerModelId, string> = {
  beginner: "demo-learner-beginner",
  intermediate: "demo-learner-intermediate",
  advanced: "demo-learner-advanced",
  exam: "demo-learner-exam",
  visual: "demo-learner-visual",
  simulation: "demo-learner-simulation",
  returning: "demo-learner-returning",
  struggling: "demo-learner-struggling",
  "high-performer": "demo-learner-high-performer",
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function knowledgeFor(id: LearnerModelId): ConceptKnowledge[] {
  return conceptRegistry.map((concept, index) => {
    const foundationBoost = concept.level === "foundation" ? 0.12 : concept.level === "advanced" ? -0.18 : 0;
    const presets: Record<LearnerModelId, number> = {
      beginner: 0.22 + (index % 5) * 0.03,
      intermediate: 0.52 + (index % 4) * 0.04,
      advanced: 0.78 + (index % 3) * 0.05,
      exam: concept.domain === "Mechanics" ? 0.7 : 0.45,
      visual: 0.48,
      simulation: 0.5 + (concept.domain === "Mechanics" ? 0.12 : 0),
      returning: 0.38 + (index % 6) * 0.04,
      struggling: 0.18 + (concept.prerequisites.length === 0 ? 0.1 : 0),
      "high-performer": 0.86 - (concept.level === "advanced" ? 0.08 : 0),
    };
    const mastery = clamp01(presets[id] + foundationBoost);
    const confidenceBias = id === "exam" ? 0.12 : id === "struggling" || id === "beginner" ? -0.1 : 0;
    const confidence = clamp01(mastery + confidenceBias + (id === "high-performer" ? 0.04 : 0));
    return {
      conceptId: concept.id,
      mastery,
      confidence,
      knowledgeState: conceptState(mastery),
      lastReviewedAt: id === "returning" ? isoDaysAgo(21, 9) : isoDaysAgo(2 + (index % 8), 11),
      mistakeCount: id === "struggling" ? 4 + (index % 3) : id === "beginner" ? 2 : id === "high-performer" ? 0 : 1,
      hintCount: id === "struggling" ? 6 : id === "beginner" ? 3 : 1,
      fatigue: id === "exam" ? 0.55 : id === "returning" ? 0.15 : 0.25,
    };
  });
}

function preferenceFor(id: LearnerModelId): LearnerPreference {
  const styles: Record<LearnerModelId, TutorResponseStyle> = {
    beginner: "analogy-first",
    intermediate: "step-by-step",
    advanced: "advanced",
    exam: "exam-style",
    visual: "visual",
    simulation: "visual",
    returning: "standard",
    struggling: "remedial",
    "high-performer": "equation-first",
  };
  const modality = (
    {
      beginner: "text",
      intermediate: "mixed",
      advanced: "equation",
      exam: "text",
      visual: "visual",
      simulation: "simulation",
      returning: "mixed",
      struggling: "text",
      "high-performer": "equation",
    } as const
  )[id];
  return {
    explanationStyle: styles[id],
    problemDifficulty: id === "beginner" || id === "struggling" ? "easy" : id === "advanced" || id === "high-performer" ? "hard" : id === "exam" ? "medium" : "medium",
    modality,
    simulationAffinity: id === "simulation" || id === "visual" ? 0.9 : id === "exam" ? 0.25 : 0.55,
    challengeTolerance: id === "high-performer" || id === "advanced" ? "high" : id === "struggling" || id === "beginner" ? "low" : "moderate",
    reviewTendency: id === "exam" ? "over-review" : id === "returning" ? "avoidant" : "balanced",
    timeAvailabilityMin: id === "exam" ? 90 : id === "returning" ? 20 : 40,
  };
}

function signalsFor(id: LearnerModelId): LearnerSignal[] {
  const weak = knowledgeFor(id)
    .slice()
    .sort((a, b) => a.mastery - b.mastery)[0];
  return [
    {
      id: stableId("sig", `${id}-acc`),
      kind: "accuracy",
      conceptId: weak.conceptId,
      value: weak.mastery,
      observedAt: isoDaysAgo(1, 10),
      note: `Local accuracy proxy for ${weak.conceptId} from the Demo AI learner model.`,
    },
    {
      id: stableId("sig", `${id}-hint`),
      kind: "hint",
      conceptId: weak.conceptId,
      value: clamp01(weak.hintCount / 8),
      observedAt: isoDaysAgo(1, 11),
      note: "Hint dependence is a mock signal, not a live telemetry feed.",
    },
    {
      id: stableId("sig", `${id}-eng`),
      kind: "engagement",
      conceptId: weak.conceptId,
      value: id === "returning" ? 0.2 : id === "exam" ? 0.85 : 0.55,
      observedAt: isoDaysAgo(0, 18),
      note: "Engagement is inferred from the selected demo profile.",
    },
  ];
}

function insightsFor(id: LearnerModelId, knowledge: ConceptKnowledge[]): LearnerInsight[] {
  const weakest = [...knowledge].sort((a, b) => a.mastery - b.mastery || a.conceptId.localeCompare(b.conceptId))[0];
  const strongest = [...knowledge].sort((a, b) => b.mastery - a.mastery || a.conceptId.localeCompare(b.conceptId))[0];
  const overconfident = knowledge.find((item) => item.confidence - item.mastery > 0.12);
  return [
    {
      id: stableId("ins", `${id}-weak`),
      conceptId: weakest.conceptId,
      headline: `${weakest.conceptId} is the current bottleneck in this Demo AI profile.`,
      evidence: `Mastery ${weakest.mastery.toFixed(2)} with ${weakest.mistakeCount} recorded mock mistakes.`,
      nextAction: id === "simulation" ? "simulation" : id === "exam" ? "practice" : "review",
      confidence: 0.74,
      isMock: true,
    },
    {
      id: stableId("ins", `${id}-strong`),
      conceptId: strongest.conceptId,
      headline: `${strongest.conceptId} is a transferable strength.`,
      evidence: `Mastery ${strongest.mastery.toFixed(2)} can support a related challenge, not a popularity ranking.`,
      nextAction: "lesson",
      confidence: 0.7,
      isMock: true,
    },
    ...(overconfident
      ? [{
          id: stableId("ins", `${id}-cal`),
          conceptId: overconfident.conceptId,
          headline: "Confidence is running ahead of verified mastery.",
          evidence: `Confidence ${overconfident.confidence.toFixed(2)} vs mastery ${overconfident.mastery.toFixed(2)}.`,
          nextAction: "tutor" as const,
          confidence: 0.66,
          isMock: true as const,
        }]
      : []),
  ];
}

function assemble(id: LearnerModelId): LearnerModel {
  const knowledge = knowledgeFor(id);
  const labels: Record<LearnerModelId, string> = {
    beginner: "Beginner physics learner",
    intermediate: "Intermediate school learner",
    advanced: "Advanced learner",
    exam: "Exam-focused learner",
    visual: "Visual-first learner",
    simulation: "Simulation-first learner",
    returning: "Returning after a gap",
    struggling: "Currently struggling",
    "high-performer": "High performer",
  };
  return {
    id,
    userId: MODEL_USERS[id],
    displayLabel: labels[id],
    knowledge,
    signals: signalsFor(id),
    preference: preferenceFor(id),
    insights: insightsFor(id, knowledge),
    learningVelocity: id === "high-performer" || id === "advanced" ? 0.78 : id === "struggling" ? 0.22 : id === "returning" ? 0.3 : 0.5,
    hintDependence: id === "struggling" ? 0.82 : id === "beginner" ? 0.6 : id === "high-performer" ? 0.12 : 0.35,
    streakDays: id === "returning" ? 0 : id === "exam" ? 11 : id === "struggling" ? 1 : 4,
    streakBehavior: id === "returning" || id === "struggling" ? "fragile" : id === "high-performer" ? "resilient" : "steady",
    recentEngagement: id === "returning" ? 0.18 : id === "exam" ? 0.88 : 0.5,
    conceptFatigue: Object.fromEntries(knowledge.map((item) => [item.conceptId, item.fatigue])),
    recentMistakeIds: knowledge.filter((item) => item.mistakeCount > 1).slice(0, 4).map((item) => item.conceptId),
    version: MOCK_AI_EXPANSION_VERSION,
    isMock: true,
  };
}

const cache = new Map<LearnerModelId, LearnerModel>();

export function getLearnerModel(id: LearnerModelId): LearnerModel {
  const hit = cache.get(id);
  if (hit) return clone(hit);
  const created = assemble(id);
  cache.set(id, created);
  return clone(created);
}

export function createBeginnerLearnerModel(): LearnerModel {
  return getLearnerModel("beginner");
}
export function createIntermediateLearnerModel(): LearnerModel {
  return getLearnerModel("intermediate");
}
export function createAdvancedLearnerModel(): LearnerModel {
  return getLearnerModel("advanced");
}
export function createExamLearnerModel(): LearnerModel {
  return getLearnerModel("exam");
}
export function createVisualLearnerModel(): LearnerModel {
  return getLearnerModel("visual");
}
export function createSimulationLearnerModel(): LearnerModel {
  return getLearnerModel("simulation");
}
export function createReturningLearnerModel(): LearnerModel {
  return getLearnerModel("returning");
}
export function createStrugglingLearnerModel(): LearnerModel {
  return getLearnerModel("struggling");
}
export function createHighPerformerLearnerModel(): LearnerModel {
  return getLearnerModel("high-performer");
}

export const LEARNER_MODEL_FACTORIES: Record<LearnerModelId, () => LearnerModel> = {
  beginner: createBeginnerLearnerModel,
  intermediate: createIntermediateLearnerModel,
  advanced: createAdvancedLearnerModel,
  exam: createExamLearnerModel,
  visual: createVisualLearnerModel,
  simulation: createSimulationLearnerModel,
  returning: createReturningLearnerModel,
  struggling: createStrugglingLearnerModel,
  "high-performer": createHighPerformerLearnerModel,
};

export function allLearnerModels(): LearnerModel[] {
  return (Object.keys(LEARNER_MODEL_FACTORIES) as LearnerModelId[]).map((id) => getLearnerModel(id));
}

export function learnerModelByUserId(userId: string): LearnerModel | undefined {
  return allLearnerModels().find((model) => model.userId === userId);
}

function patchKnowledge(model: LearnerModel, conceptId: string, fn: (row: ConceptKnowledge) => ConceptKnowledge): LearnerModel {
  return {
    ...model,
    knowledge: model.knowledge.map((row) => (row.conceptId === conceptId ? fn(row) : row)),
  };
}

export function applyLearnerEvent(model: LearnerModel, event: LearnerEvent): LearnerModel {
  if (event.userId !== model.userId) return model;
  switch (event.kind) {
    case "problem-success":
      return patchKnowledge(model, event.conceptId, (row) => ({
        ...row,
        mastery: clamp01(row.mastery + 0.04),
        confidence: clamp01(row.confidence + 0.03),
        knowledgeState: conceptState(clamp01(row.mastery + 0.04)),
        lastReviewedAt: event.at,
      }));
    case "problem-failure":
      return patchKnowledge(model, event.conceptId, (row) => ({
        ...row,
        mastery: clamp01(row.mastery - 0.03),
        confidence: clamp01(row.confidence - 0.05),
        mistakeCount: row.mistakeCount + 1,
        knowledgeState: conceptState(clamp01(row.mastery - 0.03)),
        lastReviewedAt: event.at,
      }));
    case "hint-request":
      return {
        ...patchKnowledge(model, event.conceptId, (row) => ({ ...row, hintCount: row.hintCount + 1 })),
        hintDependence: clamp01(model.hintDependence + 0.05),
      };
    case "lesson-completion":
    case "review-completion":
      return patchKnowledge(model, event.conceptId, (row) => ({
        ...row,
        mastery: clamp01(row.mastery + 0.02),
        lastReviewedAt: event.at,
        fatigue: clamp01(row.fatigue - 0.05),
      }));
    case "simulation-completion":
      return {
        ...patchKnowledge(model, event.conceptId, (row) => ({ ...row, mastery: clamp01(row.mastery + 0.025) })),
        preference: { ...model.preference, simulationAffinity: clamp01(model.preference.simulationAffinity + 0.02) },
      };
    case "mission-completion":
      return { ...model, streakDays: model.streakDays + 1, recentEngagement: clamp01(model.recentEngagement + 0.08) };
    case "tutor-request":
      return { ...model, recentEngagement: clamp01(model.recentEngagement + 0.03) };
    default:
      return model;
  }
}

export function resetLearnerModelCache(): void {
  cache.clear();
}

export function weakConceptsOf(model: LearnerModel, limit = 4): string[] {
  return [...model.knowledge].sort((a, b) => a.mastery - b.mastery || a.conceptId.localeCompare(b.conceptId)).slice(0, limit).map((row) => row.conceptId);
}

export function strongConceptsOf(model: LearnerModel, limit = 4): string[] {
  return [...model.knowledge].sort((a, b) => b.mastery - a.mastery || a.conceptId.localeCompare(b.conceptId)).slice(0, limit).map((row) => row.conceptId);
}
