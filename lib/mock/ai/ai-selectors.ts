import { createSeededRandom } from "../utils/rng";
import { paginate } from "../utils/pagination";
import { searchItems } from "../utils/search";
import { CATALOG } from "./ai-catalog";
import { getDailyCoachMessages, getLearningPlans, rankRecommendations } from "./datasets/study";
import { getExplanations, getFollowUpPrompts, getHints, getStarterPrompts } from "./datasets/libraries";
import { getPracticeFeedback } from "./datasets/practice";
import { getSimulationRecommendations } from "./datasets/scans-graphs";
import { getTutorConversations } from "./datasets/conversations";
import type { ListQuery } from "../types";

function seededIndex(seed: string, length: number): number {
  const rng = createSeededRandom(seed);
  return rng.randomInt(0, Math.max(0, length - 1));
}

export function selectTutorStarterPrompts(seed = "starters", limit = 6): string[] {
  const rows = getStarterPrompts();
  const start = seededIndex(seed, rows.length);
  return Array.from({ length: Math.min(limit, rows.length) }, (_, index) => rows[(start + index) % rows.length].prompt);
}

export function selectRecommendedQuestion(conceptId: string, seed = "q"): string {
  const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
  const options = [...topic.starters, ...topic.followUps];
  return options[seededIndex(`${seed}:${conceptId}`, options.length)];
}

export function selectRelevantConversation(conceptId: string) {
  return getTutorConversations().find((item) => item.conceptId === conceptId) ?? getTutorConversations()[0];
}

export function selectHint(conceptId: string, depth: "subtle" | "directional" | "equation" | "substitution" | "near-complete" | "final-check" = "subtle") {
  return getHints().find((item) => item.conceptId === conceptId && item.depth === depth) ?? getHints()[0];
}

export function selectExplanation(conceptId: string) {
  return getExplanations().find((item) => item.conceptId === conceptId) ?? getExplanations()[0];
}

export function selectPracticeFeedback(conceptId: string) {
  return getPracticeFeedback().find((item) => item.conceptId === conceptId) ?? getPracticeFeedback()[0];
}

export function selectSimulationRecommendation(conceptId: string) {
  return getSimulationRecommendations().find((item) => item.conceptId === conceptId) ?? getSimulationRecommendations()[0];
}

export function selectLearningPlan(seed = "plan") {
  const plans = getLearningPlans();
  return plans[seededIndex(seed, plans.length)];
}

export function selectReviewCoachMessage(day: number) {
  const messages = getDailyCoachMessages();
  return messages[(Math.max(1, day) - 1) % messages.length];
}

export function selectFollowUps(conceptId: string): string[] {
  const topic = CATALOG.find((item) => item.conceptId === conceptId);
  return topic?.followUps ?? getFollowUpPrompts().slice(0, 4);
}

export function searchTutorHistory(query: string) {
  const items = getTutorConversations().map((item) => ({ id: item.id, title: item.title, summary: item.topic, tags: [item.conceptId, item.personaId] }));
  return searchItems(items, query);
}

export function paginateConversations(query: ListQuery) {
  return paginate(getTutorConversations(), query.limit ?? 10, query.offset ?? 0);
}

export function selectRankedRecommendations() {
  return rankRecommendations({
    mastery: { kinematics: 0.82, momentum: 0.28, circuits: 0.5 },
    recentMistakes: ["momentum:signError"],
    completedLessons: ["lesson-kinematics-foundations"],
    timeAvailableMin: 20,
    goal: "understand",
    difficultyPreference: "medium",
    recentTopics: ["kinematics"],
  });
}
