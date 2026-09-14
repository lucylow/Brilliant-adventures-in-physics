import type { HintDepth } from "../ai-types";
import { getLearnerModel } from "./learner-model";
import type { DifficultyMove, DifficultyScenarioId, Intervention, LearnerModel, LearnerModelId } from "./types";

export type DifficultySignals = {
  recentAccuracy: number;
  responseTimeSec: number;
  hintUsage: number;
  mastery: number;
  confidence: number;
};

export function selectNextDifficulty(signals: DifficultySignals): DifficultyMove {
  if (signals.recentAccuracy >= 0.85 && signals.hintUsage < 0.2 && signals.mastery >= 0.7) {
    return signals.confidence > 0.8 ? "challenge" : "harder";
  }
  if (signals.recentAccuracy < 0.4 || signals.hintUsage > 0.7) return "easier";
  if (signals.recentAccuracy >= 0.6 && signals.responseTimeSec > 90 && signals.mastery < 0.55) return "same";
  if (signals.confidence - signals.mastery > 0.2) return "same";
  return "same";
}

export const DIFFICULTY_SCENARIOS: Record<DifficultyScenarioId, DifficultySignals> = {
  rapidImprovement: { recentAccuracy: 0.9, responseTimeSec: 25, hintUsage: 0.05, mastery: 0.72, confidence: 0.7 },
  steadyProgress: { recentAccuracy: 0.7, responseTimeSec: 40, hintUsage: 0.2, mastery: 0.58, confidence: 0.55 },
  plateau: { recentAccuracy: 0.62, responseTimeSec: 50, hintUsage: 0.35, mastery: 0.6, confidence: 0.6 },
  decline: { recentAccuracy: 0.32, responseTimeSec: 20, hintUsage: 0.55, mastery: 0.48, confidence: 0.5 },
  overconfidence: { recentAccuracy: 0.45, responseTimeSec: 18, hintUsage: 0.1, mastery: 0.4, confidence: 0.88 },
  underconfidence: { recentAccuracy: 0.82, responseTimeSec: 70, hintUsage: 0.4, mastery: 0.74, confidence: 0.35 },
  highAccuracySlow: { recentAccuracy: 0.88, responseTimeSec: 120, hintUsage: 0.15, mastery: 0.7, confidence: 0.6 },
  lowAccuracyFast: { recentAccuracy: 0.28, responseTimeSec: 8, hintUsage: 0.05, mastery: 0.3, confidence: 0.7 },
};

export function nextHintDepth(previousUses: number, repeatedFailure: boolean): HintDepth {
  if (repeatedFailure && previousUses >= 2) return "substitution";
  if (previousUses <= 0) return "subtle";
  if (previousUses === 1) return "directional";
  if (previousUses === 2) return "equation";
  if (previousUses === 3) return "substitution";
  return "near-complete";
}

export function decideIntervention(model: LearnerModel): Intervention {
  const weak = [...model.knowledge].sort((a, b) => a.mastery - b.mastery)[0];
  if (weak && weak.mistakeCount >= 4) {
    return {
      type: "repeated-mistake",
      message: `The same slip on ${weak.conceptId} is showing up again. Let’s isolate the unit and the sign before another timed item.`,
      reason: `${weak.mistakeCount} mock mistakes recorded on ${weak.conceptId}.`,
      recommendedAction: "tutor",
      isMock: true,
    };
  }
  if (model.recentEngagement < 0.25 && model.id === "returning") {
    return {
      type: "long-inactivity",
      message: "A short, low-stakes review of a familiar idea is enough. No catch-up guilt.",
      reason: "Returning profile with low recent engagement.",
      recommendedAction: "review",
      isMock: true,
    };
  }
  if (DIFFICULTY_SCENARIOS.lowAccuracyFast.recentAccuracy && model.learningVelocity < 0.3 && model.hintDependence < 0.2 && model.id === "struggling") {
    return {
      type: "rapid-guessing",
      message: "Slow the next attempt: write knowns before choosing an equation.",
      reason: "Fast low-accuracy pattern on the struggling profile.",
      recommendedAction: "practice",
      isMock: true,
    };
  }
  if (model.hintDependence > 0.75) {
    return {
      type: "high-hint-dependency",
      message: "Try one unaided step (name the unknown) before the next hint.",
      reason: `Hint dependence ${model.hintDependence.toFixed(2)}.`,
      recommendedAction: "practice",
      isMock: true,
    };
  }
  if (model.streakDays === 0 && model.streakBehavior === "fragile") {
    return {
      type: "streak-break",
      message: "A six-minute recap is a restart, not a penalty.",
      reason: "Streak is at zero on a fragile profile.",
      recommendedAction: "lesson",
      isMock: true,
    };
  }
  if (weak && Math.abs(weak.mastery - 0.6) < 0.08 && model.learningVelocity < 0.45) {
    return {
      type: "mastery-plateau",
      message: `Accuracy on ${weak.conceptId} is stuck near the same band. A different representation (graph or simulation) is the next lever.`,
      reason: "Mastery near 0.6 with low velocity.",
      recommendedAction: "simulation",
      isMock: true,
    };
  }
  return {
    type: "none",
    message: "No intervention. Continue the current plan.",
    reason: "Signals are inside the local comfort band.",
    recommendedAction: "practice",
    isMock: true,
  };
}

export function interventionForLearner(id: LearnerModelId): Intervention {
  return decideIntervention(getLearnerModel(id));
}

export function calibrationNote(confidence: number, correct: boolean): string {
  if (confidence >= 0.75 && !correct) {
    return "High confidence with an incorrect result: name the assumption you skipped before retrying.";
  }
  if (confidence <= 0.4 && correct) {
    return "The working held up. Low confidence here is a calibration issue, not a content gap.";
  }
  if (confidence >= 0.75 && correct) {
    return "Confidence matched a verified result. Keep the unit check as the last line anyway.";
  }
  return "Low confidence and an incorrect result: return to knowns and the governing equation.";
}
