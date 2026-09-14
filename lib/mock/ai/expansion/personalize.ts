import { CATALOG, explanationText, type CatalogTopic } from "../ai-catalog";
import { styleById } from "../ai-styles";
import type { ExplanationResponse, HintDepth, HintResponse, TutorResponsePayload, TutorResponseStyle } from "../ai-types";
import { nextHintDepth } from "./adaptive";
import { getLearnerModel, weakConceptsOf } from "./learner-model";
import { retrievePreferenceMemory, retrieveMistakeMemory } from "./memory-store";
import type { LearnerModel, LearnerModelId, TeachingStrategy } from "./types";
import { findSimulationForConcept } from "./knowledge-graph";

function topicOf(conceptId: string): CatalogTopic {
  return CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
}

export function selectTeachingStrategy(model: LearnerModel, conceptId: string): TeachingStrategy {
  const row = model.knowledge.find((item) => item.conceptId === conceptId);
  if (model.preference.modality === "simulation" || model.preference.simulationAffinity > 0.8) return "simulation-first";
  if (model.id === "visual") return "visual";
  if (model.id === "struggling" || (row && row.mastery < 0.3)) return "analogy";
  if (model.id === "exam") return "worked-example";
  if (model.hintDependence > 0.7) return "socratic";
  if (model.id === "high-performer" || model.id === "advanced") return "direct-explanation";
  if (row && row.mistakeCount > 2) return "counterexample";
  return "practice-first";
}

export function personalizeExplanation(conceptId: string, learnerId: LearnerModelId): ExplanationResponse & { strategy: TeachingStrategy; adaptedFor: LearnerModelId } {
  const model = getLearnerModel(learnerId);
  const topic = topicOf(conceptId);
  const style = model.preference.explanationStyle;
  const variant =
    style === "visual" || model.preference.modality === "visual" ? "intuition-first"
      : style === "equation-first" || style === "advanced" ? "mathematical"
        : style === "exam-style" ? "exam-review"
          : style === "remedial" || style === "analogy-first" ? "beginner"
            : "standard";
  const strategy = selectTeachingStrategy(model, conceptId);
  const prefix =
    strategy === "simulation-first" ? `Open ${topic.simulationId} first. `
      : strategy === "counterexample" ? `Counterexample first: ${topic.counterExample} `
        : strategy === "socratic" ? "Before the formula: what is known? "
          : strategy === "worked-example" ? `Worked example first (${learnerId}). `
            : strategy === "analogy" ? `Analogy first (${learnerId}): `
              : strategy === "visual" ? `Picture the variables (${learnerId}). `
                : strategy === "direct-explanation" ? `Direct model (${learnerId}): `
                  : `Practice-first (${learnerId}). `;
  return {
    conceptId: topic.conceptId,
    learnerLevel: variant === "beginner" ? "middle-school" : variant === "mathematical" ? "intro-college" : "high-school",
    style: variant,
    summary: `${prefix}${topic.oneSentence}`,
    intuition: topic.intuitionFirst,
    formalExplanation: explanationText(topic, variant === "mathematical" ? "mathematical" : variant === "exam-review" ? "exam-review" : variant === "beginner" ? "beginner" : "standard"),
    equations: [topic.equation],
    example: topic.example.prompt,
    commonMistake: topic.commonMistake,
    followUp: topic.followUps[0] ?? `What happens to ${topic.title} if a control doubles?`,
    strategy,
    adaptedFor: learnerId,
  };
}

export function explanationAdaptations(conceptId: string) {
  const topic = topicOf(conceptId);
  return {
    short: topic.oneSentence,
    standard: topic.standard,
    deep: topic.advanced,
    visual: `${topic.intuitionFirst} Sketch the variables in ${topic.equation}.`,
    analogy: `${topic.analogy.analogy} — limitation: ${topic.analogy.limitation}`,
    equationFirst: topic.mathematical,
    examReview: topic.examReview,
  };
}

export type PersonalizedHint = HintResponse & { depthUsed: HintDepth; adaptedStyle: TutorResponseStyle };

export function personalizeHint(conceptId: string, learnerId: LearnerModelId, previousHintCount: number): PersonalizedHint {
  const model = getLearnerModel(learnerId);
  const topic = topicOf(conceptId);
  const depth = nextHintDepth(previousHintCount, previousHintCount >= 3);
  const text =
    depth === "subtle" ? `Name the unknown in ${topic.title} before reaching for ${topic.equation}.`
      : depth === "directional" ? `The principle is ${topic.example.principle}. Which symbols are already known?`
        : depth === "equation" ? `Rearrange ${topic.equation} for ${topic.example.unknown}.`
          : depth === "substitution" ? `Substitute ${topic.example.known.map((item) => `${item.name}=${item.value}${item.unit}`).join(", ")} into ${topic.equation}.`
            : `Walk the last algebra line for ${topic.example.unknown} without stating the final number first.`;
  return {
    conceptId,
    depth,
    text,
    revealsAnswer: false,
    nextDepth: nextHintDepth(previousHintCount + 1, previousHintCount >= 3),
    depthUsed: depth,
    adaptedStyle: model.preference.explanationStyle,
  };
}

export function personalizeProblem(conceptId: string, learnerId: LearnerModelId) {
  const model = getLearnerModel(learnerId);
  const topic = topicOf(conceptId);
  const scale = model.preference.problemDifficulty === "easy" || model.preference.problemDifficulty === "intro" ? 0.5 : model.preference.problemDifficulty === "hard" || model.preference.problemDifficulty === "challenge" ? 2 : 1;
  return {
    prompt: topic.example.prompt,
    difficulty: model.preference.problemDifficulty,
    knowns: topic.example.known.map((item) => ({ ...item, value: Number((item.value * scale).toPrecision(4)) })),
    scaffolding: model.id === "struggling" || model.id === "beginner" ? ["List knowns", "Name the principle", "Check units"] : ["Solve, then check units"],
    conceptId,
  };
}

export function personalizeRecommendation(learnerId: LearnerModelId) {
  const model = getLearnerModel(learnerId);
  const weak = weakConceptsOf(model, 3);
  const mistakes = retrieveMistakeMemory(model.userId);
  return weak.map((conceptId, index) => {
    const topic = topicOf(conceptId);
    return {
      targetId: index === 0 ? topic.lessonId : index === 1 ? topic.simulationId : `practice-${conceptId}`,
      kind: index === 0 ? "lesson" : index === 1 ? "simulation" : "practice",
      title: topic.title,
      reason: mistakes.some((item) => item.conceptId === conceptId)
        ? `Recent mock mistakes on ${topic.title} make a targeted review the next secure step.`
        : `Mastery ${model.knowledge.find((row) => row.conceptId === conceptId)?.mastery.toFixed(2)} is below the local comfort band.`,
      score: 1 - (model.knowledge.find((row) => row.conceptId === conceptId)?.mastery ?? 0),
      conceptId,
    };
  });
}

export function personalizeSimulation(conceptId: string, learnerId: LearnerModelId) {
  const model = getLearnerModel(learnerId);
  const topic = topicOf(conceptId);
  const sim = findSimulationForConcept(conceptId)[0] ?? topic.simulationId;
  return {
    simulationId: sim,
    why: model.preference.simulationAffinity > 0.7
      ? `${sim} matches a simulation-first preference for ${topic.title}.`
      : `${sim} is a check after the equation, not a replacement for ${topic.equation}.`,
    suggestedParameters: Object.fromEntries(topic.example.known.map((item) => [item.name, item.value])),
  };
}

export function personalizeStudyPlan(learnerId: LearnerModelId, minutes: number) {
  const model = getLearnerModel(learnerId);
  const weak = weakConceptsOf(model, 4);
  const slice = minutes <= 10 ? weak.slice(0, 1) : minutes <= 30 ? weak.slice(0, 2) : weak;
  return {
    minutes,
    sequence: slice.map((id, index) => ({
      order: index + 1,
      conceptId: id,
      activity: index === 0 && model.preference.modality === "simulation" ? "simulation" : index === slice.length - 1 ? "practice" : "lesson",
      minutes: Math.max(5, Math.floor(minutes / slice.length)),
    })),
    style: model.preference.explanationStyle,
    notes: retrievePreferenceMemory(model.userId)[0]?.text ?? model.preference.modality,
  };
}

export function personalizeTutorPayload(payload: TutorResponsePayload, learnerId: LearnerModelId): TutorResponsePayload {
  const model = getLearnerModel(learnerId);
  const style = styleById(model.preference.explanationStyle);
  const topic = CATALOG.find((item) => item.title === payload.concept) ?? CATALOG[0];
  const strategy = selectTeachingStrategy(model, topic.conceptId);
  const lead =
    strategy === "socratic" ? "I will not skip to the number. "
      : strategy === "simulation-first" ? `Keep ${topic.simulationId} in view. `
        : strategy === "worked-example" ? "Worked example, then the unit check. "
          : strategy === "analogy" ? "Start from a limited analogy, then the model. "
            : strategy === "visual" ? "Keep a diagram in view. "
              : strategy === "direct-explanation" ? "Equation first. "
                : strategy === "counterexample" ? "Counterexample first. "
                  : "Practice-first: name the unknown. ";
  return {
    ...payload,
    style: style.id,
    summary: `${lead}${payload.summary}`,
    hint: personalizeHint(topic.conceptId, learnerId, model.hintDependence > 0.6 ? 2 : 0).text,
  };
}
