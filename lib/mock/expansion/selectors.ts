import { getMockNow } from "../clock";
import type { MockDataset } from "../types";
import type { DailyChallenge, DiscoveryCard, LabExperiment } from "./types";

export function selectFeaturedSimulation(dataset: MockDataset) {
  const recommended = dataset.recommendations.simulations[0];
  return dataset.simulations.find((item) => item.id === recommended) ?? dataset.simulations.find((item) => item.featured) ?? dataset.simulations[0];
}

export function selectRecommendedLesson(dataset: MockDataset) {
  const id = dataset.recommendations.lessons[0];
  return dataset.lessons.find((lesson) => lesson.id === id) ?? dataset.lessons[0];
}

export function selectDailyChallenge(dataset: MockDataset, now = getMockNow()): DailyChallenge | undefined {
  const challenges = dataset.expansion?.dailyChallenges ?? [];
  if (!challenges.length) return undefined;
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start) / 86_400_000);
  return challenges[(day - 1 + challenges.length) % challenges.length];
}

export function selectCurrentMission(dataset: MockDataset) {
  return dataset.missions.find((mission) => mission.completionPercent < 1) ?? dataset.missions[0];
}

export function selectWeakConcepts(dataset: MockDataset, threshold = 60) {
  return dataset.mastery.filter((item) => item.masteryPercent < threshold).slice(0, 8);
}

export function selectDueReviews(dataset: MockDataset) {
  const now = getMockNow().toISOString();
  return dataset.reviewQueue.filter((item) => item.dueAt <= now).slice(0, 8);
}

export function selectRecentActivity(dataset: MockDataset, limit = 8) {
  return dataset.activity.slice(0, limit);
}

export function selectRecentExperiments(dataset: MockDataset): LabExperiment[] {
  const labs = dataset.expansion?.labExperiments ?? [];
  const recent = labs.filter((lab) => lab.status === "completed" || lab.status === "saved").slice(0, 8);
  return recent;
}

export function selectAchievementsInProgress(dataset: MockDataset) {
  return dataset.achievementStates.filter((item) => !item.earned).slice(0, 8);
}

export function selectTutorSuggestions(dataset: MockDataset): string[] {
  const fromSessions = dataset.tutorSessions[0]?.suggestedQuestions ?? [];
  const fromExpansion = dataset.expansion?.extraTutorSessions[0]?.suggestedQuestions ?? [];
  const fromWhy = (dataset.expansion?.whyQuestions ?? []).slice(0, 3).map((item) => item.question);
  return [...fromSessions, ...fromExpansion, ...fromWhy].slice(0, 6);
}

export function selectNextBestAction(dataset: MockDataset): { title: string; reason: string; route: "/practice" | "/lesson" | "/lab" | "/tutor" } {
  const weak = selectWeakConcepts(dataset)[0];
  if (weak) {
    return { title: `Practice ${weak.conceptId.replace(/-/g, " ")}`, reason: `Mastery is ${Math.round(weak.masteryPercent)}%.`, route: "/practice" };
  }
  const review = selectDueReviews(dataset)[0];
  if (review) {
    return { title: `Review ${review.conceptId.replace(/-/g, " ")}`, reason: review.reason, route: "/practice" };
  }
  const challenge = selectDailyChallenge(dataset);
  if (challenge) {
    return { title: challenge.title, reason: "Daily challenge from the expansion calendar.", route: "/practice" };
  }
  const lesson = selectRecommendedLesson(dataset);
  return { title: lesson?.title ?? "Open a lesson", reason: "No weak skills on record.", route: "/lesson" };
}

export function selectQuestionOfTheDay(dataset: MockDataset, now = getMockNow()) {
  const items = dataset.expansion?.questionsOfTheDay ?? [];
  if (!items.length) return undefined;
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start) / 86_400_000);
  return items.find((item) => item.dayOfYear === day) ?? items[0];
}

export function selectDiscoveryForHome(dataset: MockDataset): DiscoveryCard | undefined {
  const cards = dataset.expansion?.discoveryCards ?? [];
  const favorite = dataset.users.find((user) => user.id)?.favoriteTopics[0];
  return cards.find((card) => card.relatedConcepts.includes(favorite ?? "kinematics")) ?? cards[0];
}

export function selectHomeScenarioPack(dataset: MockDataset) {
  const challenge = selectDailyChallenge(dataset);
  const mission = selectCurrentMission(dataset);
  const simulation = selectFeaturedSimulation(dataset);
  const next = selectNextBestAction(dataset);
  const discovery = selectDiscoveryForHome(dataset);
  return {
    hero: selectRecommendedLesson(dataset)?.title ?? "Continue learning",
    challenge: challenge?.title ?? "Practice a mixed item",
    recommendation: next.title,
    mission: mission?.title ?? "Open Adventure",
    simulation: simulation?.title ?? "Open Lab",
    reviewItem: selectDueReviews(dataset)[0]?.conceptId ?? "none",
    discovery: discovery?.title,
  };
}
