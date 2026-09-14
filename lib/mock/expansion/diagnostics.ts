import type { MockDataset } from "../types";
import type { MockExpansion } from "./types";

export type ExpansionDiagnostic = {
  entityCounts: Record<string, number>;
  duplicateIds: string[];
  invalidConceptRefs: string[];
  orphanedRecords: string[];
  missingFields: string[];
  averageProblemDifficulty: number;
  topicDistribution: Record<string, number>;
  completedContentPercent: number;
  packsLoaded: string[];
};

function collectIds(items: Array<{ id?: string; challengeId?: string }>, label: string, seen: Map<string, string>, duplicates: string[]): void {
  for (const item of items) {
    const id = item.id ?? item.challengeId;
    if (!id) continue;
    const previous = seen.get(id);
    if (previous) duplicates.push(`${id} duplicated in ${previous} and ${label}`);
    else seen.set(id, label);
  }
}

export function diagnoseExpansion(dataset: MockDataset): ExpansionDiagnostic {
  const expansion = dataset.expansion;
  const conceptIds = new Set(dataset.concepts.map((item) => item.id));
  const duplicateIds: string[] = [];
  const seen = new Map<string, string>();
  collectIds(dataset.problems, "problems", seen, duplicateIds);
  collectIds(dataset.missions, "missions", seen, duplicateIds);
  collectIds(dataset.experiments, "experiments", seen, duplicateIds);
  if (expansion) {
    collectIds(expansion.discoveryCards, "discoveryCards", seen, duplicateIds);
    collectIds(expansion.misconceptions, "misconceptions", seen, duplicateIds);
    collectIds(expansion.dailyChallenges.map((item) => ({ id: item.challengeId })), "dailyChallenges", seen, duplicateIds);
  }

  const invalidConceptRefs: string[] = [];
  const checkConcept = (id: string | undefined, where: string) => {
    if (id && !conceptIds.has(id)) invalidConceptRefs.push(`${where} → ${id}`);
  };
  for (const problem of dataset.problems) checkConcept(problem.conceptId, `problem:${problem.id}`);
  for (const lab of expansion?.labExperiments ?? []) {
    for (const conceptId of lab.relatedConcepts) checkConcept(conceptId, `lab:${lab.id}`);
  }
  for (const card of expansion?.discoveryCards ?? []) {
    for (const conceptId of card.relatedConcepts) checkConcept(conceptId, `discover:${card.id}`);
  }

  const orphanedRecords: string[] = [];
  for (const graph of expansion?.graphs ?? []) {
    if (!conceptIds.has(graph.conceptId)) orphanedRecords.push(`graph:${graph.id}`);
  }

  const missingFields: string[] = [];
  for (const lab of expansion?.labExperiments ?? []) {
    if (!lab.objective || !lab.hypothesis) missingFields.push(`lab:${lab.id} missing objective/hypothesis`);
  }

  const difficultyScore: Record<string, number> = { easy: 1, medium: 2, hard: 3, challenge: 4 };
  const difficulties = dataset.problems.map((problem) => difficultyScore[problem.difficulty] ?? 2);
  const averageProblemDifficulty = difficulties.length ? difficulties.reduce((sum, value) => sum + value, 0) / difficulties.length : 0;

  const topicDistribution: Record<string, number> = {};
  for (const concept of dataset.concepts) {
    topicDistribution[concept.topicId] = (topicDistribution[concept.topicId] ?? 0) + 1;
  }

  const earned = dataset.achievementStates.filter((item) => item.earned).length;
  const completedContentPercent = dataset.achievementStates.length ? earned / dataset.achievementStates.length : 0;

  return {
    entityCounts: expansionCounts(dataset, expansion),
    duplicateIds,
    invalidConceptRefs: invalidConceptRefs.slice(0, 40),
    orphanedRecords,
    missingFields,
    averageProblemDifficulty,
    topicDistribution,
    completedContentPercent,
    packsLoaded: expansion?.packsLoaded ?? [],
  };
}

export function expansionCounts(dataset: MockDataset, expansion: MockExpansion | undefined): Record<string, number> {
  return {
    users: dataset.users.length,
    topics: dataset.topics.length,
    concepts: dataset.concepts.length,
    lessons: dataset.lessons.length,
    equations: dataset.equations.length,
    problems: dataset.problems.length,
    attempts: dataset.attempts.length,
    simulations: dataset.simulations.length,
    experiments: dataset.experiments.length,
    measurements: expansion?.series.reduce((sum, item) => sum + item.sampleCount, 0) ?? 0,
    graphs: expansion?.graphs.length ?? 0,
    missions: dataset.missions.length,
    achievements: dataset.achievements.length,
    tutorSessions: dataset.tutorSessions.length,
    notebook: dataset.notebook.length,
    notifications: dataset.notifications.length,
    activities: dataset.activity.length,
    discoveryCards: expansion?.discoveryCards.length ?? 0,
    misconceptions: expansion?.misconceptions.length ?? 0,
    flashcards: expansion?.flashcards.length ?? 0,
    dailyChallenges: expansion?.dailyChallenges.length ?? 0,
    questionsOfTheDay: expansion?.questionsOfTheDay.length ?? 0,
    reviewItems: dataset.reviewQueue.length,
    labExperiments: expansion?.labExperiments.length ?? 0,
    freeBodies: expansion?.freeBodies.length ?? 0,
    microLessons: expansion?.microLessons.length ?? 0,
    facts: expansion?.facts.length ?? 0,
  };
}

export function validateRelationshipGraph(dataset: MockDataset): string[] {
  const errors: string[] = [];
  const topicIds = new Set(dataset.topics.map((item) => item.id));
  const conceptIds = new Set(dataset.concepts.map((item) => item.id));
  const lessonIds = new Set(dataset.lessons.map((item) => item.id));
  const problemIds = new Set(dataset.problems.map((item) => item.id));
  const simulationIds = new Set(dataset.simulations.map((item) => item.id));
  const missionIds = new Set(dataset.missions.map((item) => item.id));
  const achievementIds = new Set(dataset.achievements.map((item) => item.id));

  for (const concept of dataset.concepts) {
    if (!topicIds.has(concept.topicId)) errors.push(`concept ${concept.id} missing topic ${concept.topicId}`);
  }
  for (const lesson of dataset.lessons) {
    if (!conceptIds.has(lesson.conceptId)) errors.push(`lesson ${lesson.id} missing concept ${lesson.conceptId}`);
  }
  for (const problem of dataset.problems) {
    if (!conceptIds.has(problem.conceptId)) errors.push(`problem ${problem.id} missing concept ${problem.conceptId}`);
  }
  for (const simulation of dataset.simulations) {
    for (const conceptId of simulation.conceptIds) {
      if (!conceptIds.has(conceptId)) errors.push(`simulation ${simulation.id} missing concept ${conceptId}`);
    }
  }
  for (const mission of dataset.missions) {
    for (const conceptId of mission.conceptIds) {
      if (!conceptIds.has(conceptId) && !conceptId.startsWith("lesson-")) {
        errors.push(`mission ${mission.id} missing concept ${conceptId}`);
      }
    }
  }
  if (!lessonIds.size) errors.push("no lessons in relationship graph");
  if (!problemIds.size && dataset.lessons.length) errors.push("lessons exist but problems are empty");
  if (!simulationIds.size) errors.push("no simulations in relationship graph");
  if (!missionIds.size) errors.push("no missions in relationship graph");
  if (!achievementIds.size) errors.push("no achievements in relationship graph");
  return errors;
}
