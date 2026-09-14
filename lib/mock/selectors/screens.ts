import { getMockConfig } from "../config";
import { getMockDataset } from "../registry";
import { getMockNow } from "../clock";
import { getMockDatasetStats } from "../stats";
import type { MockLearnerProfile } from "../types";

export function selectHomeDemoState() {
  const dataset = getMockDataset();
  const config = getMockConfig();
  const user = dataset.users.find((item) => item.id === config.learnerId) ?? dataset.users[0];
  return {
    user,
    greeting: `Hi, ${user.displayName.split(" ")[0]}.`,
    streak: user.streak,
    xp: user.xp,
    continueLearning: dataset.lessons.find((lesson) => dataset.recommendations.lessons.includes(lesson.id)) ?? dataset.lessons[0],
    dailyChallenge: dataset.problems.find((problem) => dataset.recommendations.problems.includes(problem.id)) ?? dataset.problems[0],
    recommendedLesson: dataset.lessons.find((lesson) => dataset.recommendations.lessons[0] === lesson.id) ?? dataset.lessons[0],
    featuredSimulation: dataset.simulations.find((simulation) => simulation.featured) ?? dataset.simulations[0],
    mission: dataset.missions.find((item) => item.completionPercent < 1) ?? dataset.missions[0],
    recentActivity: dataset.activity.slice(0, 6),
    achievements: dataset.achievementStates.slice(0, 4),
  };
}

export function selectPracticeDemoState() {
  const dataset = getMockDataset();
  return {
    current: dataset.problems[0],
    next: dataset.problems.slice(1, 6),
    recentAttempts: dataset.attempts.slice(-8),
    weakConcepts: dataset.mastery.filter((item) => item.masteryPercent < 60).slice(0, 5),
    streak: dataset.learningState.streak,
    review: dataset.reviewQueue.slice(0, 5),
  };
}

export function selectProgressDemoState() {
  const dataset = getMockDataset();
  return {
    learning: dataset.learningState,
    mastery: dataset.mastery,
    dailyActivity: dataset.dailyActivity,
    achievements: dataset.achievementStates,
    missions: dataset.missions,
    weekly: dataset.dailyActivity.slice(-7),
  };
}

export function selectLabDemoState() {
  const dataset = getMockDataset();
  return {
    featured: dataset.simulations.filter((simulation) => simulation.featured),
    recent: dataset.experiments.filter((experiment) => experiment.status === "completed" || experiment.status === "saved").slice(0, 8),
    drafts: dataset.experiments.filter((experiment) => experiment.status === "draft"),
    categories: [...new Set(dataset.simulations.map((simulation) => simulation.category))],
  };
}

export function selectTutorDemoState() {
  const dataset = getMockDataset();
  return {
    recent: dataset.tutorSessions.slice(0, 8),
    active: dataset.tutorSessions[0],
    suggested: dataset.tutorSessions[0]?.suggestedQuestions ?? [],
  };
}

export function selectSettingsDemoState(): { user: MockLearnerProfile; now: string } {
  const dataset = getMockDataset();
  const config = getMockConfig();
  const user = dataset.users.find((item) => item.id === config.learnerId) ?? dataset.users[0];
  return { user, now: getMockNow().toISOString() };
}

export function selectInspectorStats() {
  return getMockDatasetStats(getMockDataset(), getMockConfig().scenario);
}
