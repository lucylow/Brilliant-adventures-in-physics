import { findConcept } from "@/lib/concepts";
import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";
import { getLearnerModel, strongConceptsOf, weakConceptsOf } from "./learner-model";
import { personalizeStudyPlan, selectTeachingStrategy } from "./personalize";
import { decideIntervention } from "./adaptive";
import { getSimulationCopilotTurns } from "./copilots";
import { getWhatIfScenarios } from "./what-if";
import { getExamDebriefs } from "./study";
import { getMultimodalSessions } from "./multimodal";
import type { LearnerModelId } from "./types";

export type JourneyStep = {
  id: string;
  feature: string;
  conceptId: string;
  action: string;
  expected: string;
  entityId?: string;
};

export type GeneratedJourney = {
  id: string;
  kind: "tutor" | "study" | "exam" | "simulation" | "experiment" | "recovery";
  learnerId: LearnerModelId;
  displayLabel: string;
  style: string;
  strengths: string[];
  weaknesses: string[];
  steps: JourneyStep[];
  consistent: true;
};

function assertRefs(steps: JourneyStep[], journeyId: string): void {
  for (const step of steps) {
    if (!findConcept(step.conceptId)) {
      throw new Error(`Journey ${journeyId} references missing concept ${step.conceptId}`);
    }
  }
}

function basePersona(learnerId: LearnerModelId) {
  const model = getLearnerModel(learnerId);
  return {
    learnerId,
    displayLabel: model.displayLabel,
    style: model.preference.explanationStyle,
    strengths: strongConceptsOf(model, 2),
    weaknesses: weakConceptsOf(model, 2),
    strategy: selectTeachingStrategy(model, weakConceptsOf(model, 1)[0] ?? "kinematics"),
    intervention: decideIntervention(model),
  };
}

export function generateTutorJourney(learnerId: LearnerModelId = "intermediate", conceptId = "kinematics"): GeneratedJourney {
  const persona = basePersona(learnerId);
  const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
  const id = stableId("jny", `tutor-${learnerId}-${topic.id}`);
  const steps: JourneyStep[] = [
    { id: `${id}-ask`, feature: "tutor", conceptId: topic.conceptId, action: topic.starters[0] ?? topic.title, expected: topic.oneSentence },
    { id: `${id}-hint`, feature: "hint", conceptId: topic.conceptId, action: "request a subtle hint", expected: topic.equation },
    { id: `${id}-practice`, feature: "practice", conceptId: topic.conceptId, action: topic.example.prompt, expected: topic.example.principle },
    { id: `${id}-feedback`, feature: "feedback", conceptId: topic.conceptId, action: "read error-aware line", expected: topic.commonMistake },
  ];
  assertRefs(steps, id);
  return { id, kind: "tutor", learnerId, displayLabel: persona.displayLabel, style: persona.style, strengths: persona.strengths, weaknesses: persona.weaknesses, steps, consistent: true };
}

export function generateStudyJourney(learnerId: LearnerModelId = "exam"): GeneratedJourney {
  const persona = basePersona(learnerId);
  const plan = personalizeStudyPlan(learnerId, 30);
  const id = stableId("jny", `study-${learnerId}`);
  const steps: JourneyStep[] = plan.sequence.map((item, index) => {
    const topic = CATALOG.find((row) => row.conceptId === item.conceptId) ?? CATALOG[0];
    return {
      id: `${id}-${index}`,
      feature: item.activity,
      conceptId: item.conceptId,
      action: `${item.minutes} min on ${topic.title}`,
      expected: topic.equation,
      entityId: item.activity === "simulation" ? topic.simulationId : topic.lessonId,
    };
  });
  assertRefs(steps, id);
  return { id, kind: "study", learnerId, displayLabel: persona.displayLabel, style: persona.style, strengths: persona.strengths, weaknesses: persona.weaknesses, steps, consistent: true };
}

export function generateExamJourney(learnerId: LearnerModelId = "exam"): GeneratedJourney {
  const persona = basePersona(learnerId);
  const debrief = getExamDebriefs().find((item) => item.conceptId === persona.weaknesses[0]) ?? getExamDebriefs()[0];
  const id = stableId("jny", `exam-${learnerId}`);
  const steps: JourneyStep[] = [
    { id: `${id}-item`, feature: "exam", conceptId: debrief.conceptId, action: "attempt a timed item", expected: debrief.requiredEquations[0] ?? "" },
    { id: `${id}-debrief`, feature: "exam-debrief", conceptId: debrief.conceptId, action: "open debrief", expected: debrief.likelyTrap },
    { id: `${id}-plan`, feature: "plan", conceptId: debrief.conceptId, action: "rebuild a 20-minute block", expected: debrief.recommendedApproach },
    { id: `${id}-review`, feature: "review", conceptId: debrief.conceptId, action: "schedule review", expected: debrief.timeManagement },
  ];
  assertRefs(steps, id);
  return { id, kind: "exam", learnerId, displayLabel: persona.displayLabel, style: persona.style, strengths: persona.strengths, weaknesses: persona.weaknesses, steps, consistent: true };
}

export function generateSimulationJourney(learnerId: LearnerModelId = "simulation"): GeneratedJourney {
  const persona = basePersona(learnerId);
  const topic = CATALOG.find((item) => item.conceptId === persona.weaknesses[0] || item.conceptId === "kinematics") ?? CATALOG[0];
  const copilot = getSimulationCopilotTurns().find((item) => item.conceptId === topic.conceptId);
  const whatIf = getWhatIfScenarios().find((item) => item.conceptId === topic.conceptId);
  const id = stableId("jny", `sim-${learnerId}-${topic.id}`);
  const steps: JourneyStep[] = [
    { id: `${id}-open`, feature: "simulation", conceptId: topic.conceptId, action: `open ${topic.simulationId}`, expected: topic.intuitionFirst, entityId: topic.simulationId },
    { id: `${id}-why`, feature: "copilot", conceptId: topic.conceptId, action: copilot?.user ?? "What does this graph mean?", expected: copilot?.assistant ?? topic.oneSentence },
    { id: `${id}-whatif`, feature: "what-if", conceptId: topic.conceptId, action: whatIf?.question ?? "What if gravity halves?", expected: whatIf ? `${whatIf.after.value} ${whatIf.after.unit}` : topic.equation },
    { id: `${id}-predict`, feature: "predict", conceptId: topic.conceptId, action: "predict before the next run", expected: topic.example.principle },
  ];
  assertRefs(steps, id);
  return { id, kind: "simulation", learnerId, displayLabel: persona.displayLabel, style: persona.style, strengths: persona.strengths, weaknesses: persona.weaknesses, steps, consistent: true };
}

export function generateExperimentJourney(learnerId: LearnerModelId = "simulation"): GeneratedJourney {
  const persona = basePersona(learnerId);
  const topic = CATALOG[0];
  const id = stableId("jny", `exp-${learnerId}-${topic.id}`);
  const steps: JourneyStep[] = [
    { id: `${id}-setup`, feature: "experiment", conceptId: topic.conceptId, action: "setup", expected: topic.experiment.objective, entityId: topic.experiment.name },
    { id: `${id}-measure`, feature: "experiment", conceptId: topic.conceptId, action: "measurement", expected: topic.experiment.observation },
    { id: `${id}-analyze`, feature: "analysis", conceptId: topic.conceptId, action: "trend + uncertainty", expected: topic.experiment.analysis },
    { id: `${id}-report`, feature: "notebook", conceptId: topic.conceptId, action: "lab-report assist", expected: "observed vs inferred vs expected" },
  ];
  assertRefs(steps, id);
  return { id, kind: "experiment", learnerId, displayLabel: persona.displayLabel, style: persona.style, strengths: persona.strengths, weaknesses: persona.weaknesses, steps, consistent: true };
}

export function generateRecoveryJourney(learnerId: LearnerModelId = "returning"): GeneratedJourney {
  const persona = basePersona(learnerId);
  const id = stableId("jny", `rec-${learnerId}`);
  const steps: JourneyStep[] = [
    { id: `${id}-int`, feature: "intervention", conceptId: persona.weaknesses[0] ?? "kinematics", action: "read intervention", expected: persona.intervention.message },
    { id: `${id}-plan`, feature: "plan", conceptId: persona.weaknesses[0] ?? "kinematics", action: "15-minute block", expected: "short recap" },
    { id: `${id}-tutor`, feature: "tutor", conceptId: persona.weaknesses[0] ?? "kinematics", action: "one clarification", expected: persona.style },
  ];
  assertRefs(steps, id);
  return { id, kind: "recovery", learnerId, displayLabel: persona.displayLabel, style: persona.style, strengths: persona.strengths, weaknesses: persona.weaknesses, steps, consistent: true };
}

export function generateAllJourneys(): GeneratedJourney[] {
  const ids: LearnerModelId[] = ["beginner", "intermediate", "advanced", "exam", "visual", "simulation", "returning", "struggling", "high-performer"];
  return ids.flatMap((id) => [
    generateTutorJourney(id),
    generateStudyJourney(id),
    generateExamJourney(id === "exam" ? "exam" : id),
    generateSimulationJourney(id === "simulation" ? "simulation" : id),
    generateExperimentJourney(id),
    generateRecoveryJourney(id === "returning" ? "returning" : id),
  ]);
}

export function validateJourneyConsistency(journey: GeneratedJourney): string[] {
  const errors: string[] = [];
  const model = getLearnerModel(journey.learnerId);
  if (journey.displayLabel !== model.displayLabel) errors.push("displayLabel drift");
  if (journey.style !== model.preference.explanationStyle) errors.push("style drift");
  if (journey.strengths[0] !== strongConceptsOf(model, 1)[0]) errors.push("strength drift");
  for (const step of journey.steps) {
    if (!findConcept(step.conceptId)) errors.push(`missing concept ${step.conceptId}`);
  }
  const mm = getMultimodalSessions().find((item) => item.conceptId === journey.steps[0]?.conceptId);
  if (mm && !mm.references.simulationId) errors.push("multimodal session missing simulation reference");
  return errors;
}

export function getDemoSnapshots() {
  return {
    tutor: generateTutorJourney("intermediate", "kinematics"),
    scan: generateTutorJourney("visual", "kinematics"),
    experiment: generateExperimentJourney("simulation"),
    exam: generateExamJourney("exam"),
    simulation: generateSimulationJourney("simulation"),
    personalization: generateStudyJourney("visual"),
    recovery: generateRecoveryJourney("returning"),
  };
}
