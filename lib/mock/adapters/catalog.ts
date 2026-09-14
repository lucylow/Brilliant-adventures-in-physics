import { conceptRegistry, searchConcepts } from "@/lib/concepts";
import type { PhysicsConcept } from "@/lib/concepts";
import { practiceQuestions } from "@/lib/practice";
import type { PracticeQuestion } from "@/lib/practice";
import { projectileLesson } from "@/lib/education";
import type { Lesson } from "@/lib/education";
import { evaluateAchievements } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { generateAdventureMissions } from "@/lib/adventure";
import type { AdventureMission, WorldId } from "@/lib/adventure";
import type { LearningState } from "@/lib/progress-store";
import { isMockModeEnabled } from "../config";
import { getMockDataset } from "../registry";
import { toPracticeQuestion } from "../generators/problems";
import { clone } from "../utils/clone";
import { searchItems } from "../utils/search";

export function getActiveConceptRegistry(): PhysicsConcept[] {
  if (!isMockModeEnabled()) return conceptRegistry;
  return clone(getMockDataset().concepts);
}

export function findActiveConcept(id: string): PhysicsConcept | undefined {
  return getActiveConceptRegistry().find((concept) => concept.id === id);
}

export function searchActiveConcepts(query: string): PhysicsConcept[] {
  if (!isMockModeEnabled()) return searchConcepts(query);
  return searchItems(getActiveConceptRegistry().map((concept) => ({ ...concept, name: concept.title })), query);
}

export function getActivePracticeQuestions(): PracticeQuestion[] {
  if (!isMockModeEnabled()) return practiceQuestions;
  return getMockDataset().problems.map(toPracticeQuestion);
}

export function activePracticeIndexForConcept(conceptId: string): number | null {
  const normalized = conceptId.trim().toLowerCase();
  const index = getActivePracticeQuestions().findIndex((question) => question.conceptId === normalized);
  return index >= 0 ? index : null;
}

export function getActiveLessons(): Lesson[] {
  if (!isMockModeEnabled()) return [projectileLesson];
  return clone(getMockDataset().lessons);
}

export function getActiveLesson(id?: string): Lesson {
  const lessons = getActiveLessons();
  return lessons.find((lesson) => lesson.id === id) ?? lessons[0] ?? projectileLesson;
}

export function getActiveAchievements(learning: LearningState): Achievement[] {
  if (!isMockModeEnabled()) return evaluateAchievements(learning);
  return clone(getMockDataset().achievementStates);
}

export function getActiveMissions(worldId: WorldId): AdventureMission[] {
  if (!isMockModeEnabled()) return generateAdventureMissions(worldId);
  const missions = getMockDataset().missions;
  const matching = missions.filter((mission) => mission.worldId === worldId);
  return clone(matching.length ? matching : missions);
}

export function getActiveSimulations() {
  if (!isMockModeEnabled()) return [];
  return clone(getMockDataset().simulations);
}

export function getActiveTutorSessions() {
  if (!isMockModeEnabled()) return [];
  return clone(getMockDataset().tutorSessions);
}

export function getRecommendedLessons() {
  return getMockDataset().recommendations.lessons;
}

export function getRecommendedProblems() {
  return getMockDataset().recommendations.problems;
}

export function getRecommendedSimulations() {
  return getMockDataset().recommendations.simulations;
}

export function getRecommendedMissions() {
  return getMockDataset().recommendations.missions;
}

export function getActiveLabExperiments() {
  if (!isMockModeEnabled()) return [];
  return clone(getMockDataset().expansion.labExperiments);
}

export function getActiveDiscoveryCards() {
  if (!isMockModeEnabled()) return [];
  return clone(getMockDataset().expansion.discoveryCards);
}

export function searchActiveContent(query: string) {
  if (!isMockModeEnabled()) {
    return { concepts: searchConcepts(query), lessons: [], simulations: [], discovery: [], problems: [] };
  }
  const dataset = getMockDataset();
  return {
    concepts: searchActiveConcepts(query),
    lessons: searchItems(dataset.lessons, query).slice(0, 8),
    simulations: searchItems(dataset.simulations, query).slice(0, 8),
    discovery: searchItems(dataset.expansion.discoveryCards, query).slice(0, 8),
    problems: searchItems(dataset.problems, query).slice(0, 8),
  };
}
