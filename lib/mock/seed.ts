import { BAV_FALLBACK_EXPERIMENTS, BAV_FALLBACK_QUESTS, BAV_FALLBACK_VISUALIZATIONS } from "@/lib/bav";
import type { LearningState, TopicMastery } from "@/lib/progress-store";
import { isoDateDaysAgo } from "./clock";
import { createAchievementCatalog } from "./datasets/achievements";
import { createConceptCatalog } from "./datasets/concepts";
import { createEquationCatalog } from "./datasets/equations";
import { createExperimentCatalog } from "./datasets/experiments";
import { createLensRecords, createScanResults } from "./datasets/lens-scan";
import { createMissionCatalog } from "./datasets/missions";
import { createNotebookCatalog } from "./datasets/notebook";
import { createNotificationCatalog } from "./datasets/notifications";
import { createSimulationCatalog, createSimulationSnapshots } from "./datasets/simulations";
import { createTopicCatalog } from "./datasets/topics";
import { createTutorCatalog } from "./datasets/tutor";
import { createUserCatalog } from "./datasets/users";
import { createMockAchievementState } from "./factories/achievement";
import { createLessonCatalog } from "./generators/lessons";
import { createProblemCatalog } from "./generators/problems";
import { createExtendedProblemCatalog } from "./generators/problems-extended";
import { createActivityFeed } from "./generators/activity";
import { createAttemptHistory, createDailyActivity, masteryFromAttempts } from "./generators/history";
import { buildRecommendations } from "./recommendations";
import { MOCK_DATA_VERSION } from "./version";
import type { MockAuthState, MockDataset, MockErrorScenarioId, MockLearnerProfile, MockOfflineState, MockScenarioId } from "./types";
import type { Entitlement, Subscription } from "@/lib/monetization";

export type SeedPackId = "minimal" | "demo" | "rich" | "advanced" | "exam-prep" | "explorer" | "offline" | "errors";

const SCENARIO_TO_PACK: Record<MockScenarioId, SeedPackId> = {
  "fresh-user": "minimal",
  beginner: "minimal",
  "active-learner": "demo",
  "advanced-learner": "advanced",
  "power-user": "rich",
  "exam-prep": "exam-prep",
  explorer: "explorer",
  "offline-user": "offline",
  "returning-user": "demo",
  "empty-state": "minimal",
  "error-state": "errors",
};

const SCENARIO_LEARNER: Record<MockScenarioId, string> = {
  "fresh-user": "user-cameron",
  beginner: "user-alex",
  "active-learner": "user-maya",
  "advanced-learner": "user-noah",
  "power-user": "user-jordan",
  "exam-prep": "user-taylor",
  explorer: "user-morgan",
  "offline-user": "user-sam",
  "returning-user": "user-sam",
  "empty-state": "user-cameron",
  "error-state": "user-maya",
};

function learningFromUser(user: MockLearnerProfile, mastery: MockDataset["mastery"], attempts: MockDataset["attempts"], lessonsCompleted: number, labsCompleted: number): LearningState {
  const topics: Record<string, TopicMastery> = {};
  for (const record of mastery) {
    topics[record.conceptId] = {
      attempts: record.attemptCount,
      correct: record.correctCount,
      hints: Math.round(record.attemptCount * (1 - record.confidence)),
      confidenceTotal: record.confidence * record.attemptCount,
    };
  }
  const completionEvents = [
    ...Array.from({ length: lessonsCompleted }, (_, index) => ({ id: `lesson:mock-${index + 1}`, kind: "lesson" as const, contentId: `mock-lesson-${index + 1}`, topic: user.favoriteTopics[index % Math.max(1, user.favoriteTopics.length)] ?? "kinematics", completedAt: isoDateDaysAgo(index + 1) + "T12:00:00.000Z" })),
    ...Array.from({ length: labsCompleted }, (_, index) => ({ id: `lab:mock-${index + 1}`, kind: "lab" as const, contentId: `mock-lab-${index + 1}`, topic: user.favoriteTopics[index % Math.max(1, user.favoriteTopics.length)] ?? "kinematics", completedAt: isoDateDaysAgo(index + 2) + "T15:00:00.000Z" })),
  ];
  return {
    attempts: attempts.length,
    correct: attempts.filter((attempt) => attempt.isCorrect).length,
    lastTopic: user.favoriteTopics[0],
    savedQuestions: attempts.filter((attempt) => attempt.isCorrect).slice(-8).map((attempt) => attempt.problemId),
    topics,
    lastStudyDate: isoDateDaysAgo(user.streak > 0 ? 0 : 3),
    streak: user.streak,
    lessonsCompleted,
    labsCompleted,
    completionEvents,
  };
}

function mockSubscription(tier: Subscription["tier"], state: Subscription["state"]): Subscription {
  return { tier, state, productId: tier === "free" ? undefined : "mock-plus-monthly", expiresAt: state === "expired" ? "2025-01-01T00:00:00.000Z" : "2027-01-01T00:00:00.000Z" };
}

function mockEntitlements(premium: boolean): Entitlement[] {
  return [
    { feature: "unlimited_tutor", enabled: premium, limit: premium ? undefined : 5, used: premium ? 0 : 2 },
    { feature: "advanced_simulations", enabled: premium },
    { feature: "physics_lens", enabled: premium },
  ];
}

function offlineFor(pack: SeedPackId): MockOfflineState {
  if (pack !== "offline" && pack !== "errors") return { mode: "online", retryQueue: [] };
  return {
    mode: pack === "offline" ? "pending-saves" : "failed-tutor",
    retryQueue: [
      { id: "tutor", payload: { question: "Why does mass cancel?" }, queuedAt: Date.parse("2026-09-14T12:00:00.000Z") },
      { id: "lens", payload: { title: "Pendulum timing" }, queuedAt: Date.parse("2026-09-14T13:00:00.000Z") },
    ],
  };
}

function authFor(scenario: MockScenarioId): MockAuthState {
  if (scenario === "fresh-user" || scenario === "empty-state") return "newUser";
  if (scenario === "error-state") return "expiredSession";
  return "returningUser";
}

function linkCatalog(topics: MockDataset["topics"], concepts: MockDataset["concepts"], lessons: MockDataset["lessons"], problems: MockDataset["problems"], simulations: MockDataset["simulations"]): MockDataset["topics"] {
  return topics.map((topic) => ({
    ...topic,
    conceptIds: concepts.filter((concept) => concept.topicId === topic.id).map((concept) => concept.id),
    lessonIds: lessons.filter((lesson) => lesson.topicId === topic.id).map((lesson) => lesson.id),
    practiceProblemIds: problems.filter((problem) => problem.topicId === topic.id).map((problem) => problem.id),
    simulationIds: simulations.filter((simulation) => simulation.topicId === topic.id).map((simulation) => simulation.id),
  }));
}

function sliceForPack<T>(items: readonly T[], pack: SeedPackId, rich: number, demo: number, min: number): T[] {
  if (pack === "rich" || pack === "advanced" || pack === "exam-prep" || pack === "explorer") return items.slice(0, rich);
  if (pack === "minimal" || pack === "errors") return items.slice(0, min);
  return items.slice(0, demo);
}

export function buildMockDataset(scenario: MockScenarioId = "active-learner", learnerId?: string): MockDataset {
  const pack = SCENARIO_TO_PACK[scenario];
  const users = createUserCatalog();
  const selectedId = learnerId ?? SCENARIO_LEARNER[scenario];
  const user = users.find((item) => item.id === selectedId) ?? users[1];
  const empty = scenario === "empty-state";

  const topics = createTopicCatalog();
  const concepts = createConceptCatalog();
  const equations = createEquationCatalog();
  const lessons = createLessonCatalog(concepts);
  const problems = [...createProblemCatalog(), ...createExtendedProblemCatalog()];
  const simulations = createSimulationCatalog();
  const snapshots = createSimulationSnapshots(simulations);
  const experiments = empty ? [] : createExperimentCatalog();
  const completedMissionIds = empty || scenario === "fresh-user" || scenario === "beginner" ? new Set<string>() : new Set(["mission-first-trajectory", "lesson-projectile-motion", "problem-projectile-range-1"]);
  const missions = createMissionCatalog(completedMissionIds);
  const achievements = createAchievementCatalog();
  const linkedTopics = linkCatalog(topics, concepts, lessons, problems, simulations);

  const problemSlice = empty ? [] : sliceForPack(problems, pack, problems.length, problems.length, 24);
  const attempts = empty ? [] : createAttemptHistory(user, problemSlice, `${MOCK_DATA_VERSION}:${scenario}`);
  const mastery = empty ? [] : masteryFromAttempts(user, attempts, problems, concepts);
  const dailyActivity = empty ? [] : createDailyActivity(user, attempts, `${MOCK_DATA_VERSION}:${scenario}`);
  const tutorSessions = empty ? [] : createTutorCatalog(user.id);
  const notebook = empty ? [] : createNotebookCatalog(user.id);
  const notifications = empty ? [] : createNotificationCatalog(user.id, user.streak);
  const activity = empty ? [] : createActivityFeed({ userId: user.id, attempts, missions, experiments, tutorSessions });
  const recommendations = buildRecommendations({ user, concepts, lessons, problems, simulations, missions, mastery });
  const achievementStates = achievements.map((definition) => {
    const earned =
      !empty &&
      ((definition.criteria.kind === "attempts" && attempts.length >= definition.criteria.threshold) ||
        (definition.criteria.kind === "lessons" && user.totalLessons >= definition.criteria.threshold) ||
        (definition.criteria.kind === "labs" && user.totalExperiments >= definition.criteria.threshold) ||
        (definition.criteria.kind === "streak" && user.streak >= definition.criteria.threshold) ||
        (definition.criteria.kind === "topics" && Object.keys(user.masterySummary).length >= definition.criteria.threshold));
    return createMockAchievementState({
      id: definition.id,
      title: definition.name,
      description: definition.description,
      icon: definition.icon,
      earned,
      definitionId: definition.id,
      xpReward: definition.xpReward,
      rarity: definition.rarity,
      category: definition.category,
      earnedAt: earned ? user.lastActiveAt : undefined,
    });
  });

  const reviewQueue = mastery
    .filter((item) => item.recommendedAction === "review" || item.recommendedAction === "practice")
    .slice(0, 20)
    .map((item, index) => ({
      id: `review-${item.conceptId}`,
      userId: user.id,
      conceptId: item.conceptId,
      dueAt: item.nextReviewAt,
      priority: 20 - index,
      reason: item.masteryPercent < 50 ? "Weak recent accuracy" : "Due for spaced review",
      lastScore: item.masteryPercent / 100,
    }));

  const mistakes = (empty ? [] : concepts)
    .filter((concept) => (concept.misconceptionKeywords?.length ?? 0) > 0)
    .slice(0, 18)
    .map((concept, index) => ({
      id: `mistake-${concept.id}`,
      userId: user.id,
      conceptId: concept.id,
      title: concept.misconceptionKeywords?.[0] ?? concept.title,
      detail: `Local mistake note: ${concept.misconceptionKeywords?.[0] ?? "unit slip"} showed up in practice.`,
      lastSeenAt: isoDateDaysAgo(index + 1) + "T10:00:00.000Z",
      count: 1 + (index % 3),
    }));

  const premium = pack === "rich" || pack === "advanced" || pack === "exam-prep";
  const linkedConcepts = concepts.map((concept) => ({
    ...concept,
    lessonIds: lessons.filter((lesson) => lesson.conceptId === concept.id).map((lesson) => lesson.id),
    simulationIds: simulations.filter((simulation) => simulation.conceptIds.includes(concept.id)).map((simulation) => simulation.id),
    exampleIds: problems.filter((problem) => problem.conceptId === concept.id).slice(0, 3).map((problem) => problem.id),
    equationIds: equations.filter((equation) => equation.conceptId === concept.id).map((equation) => equation.id),
  }));

  return {
    users,
    topics: linkedTopics,
    concepts: linkedConcepts,
    lessons: empty ? [] : lessons,
    equations,
    problems: empty ? [] : problemSlice,
    attempts,
    mastery,
    achievements,
    achievementStates,
    missions: empty ? [] : missions,
    simulations,
    snapshots,
    experiments,
    tutorSessions,
    notebook,
    notifications,
    activity,
    dailyActivity,
    reviewQueue,
    mistakes,
    lensRecords: empty ? [] : createLensRecords(),
    scanResults: createScanResults(),
    recommendations,
    learningState: learningFromUser(user, mastery, attempts, empty ? 0 : user.totalLessons, empty ? 0 : user.totalExperiments),
    subscription: mockSubscription(premium ? "plus" : "free", premium ? "active" : "active"),
    entitlements: mockEntitlements(premium),
    offline: offlineFor(pack),
    auth: authFor(scenario),
    bavExperiments: BAV_FALLBACK_EXPERIMENTS,
    bavQuests: BAV_FALLBACK_QUESTS,
    bavVisualizations: BAV_FALLBACK_VISUALIZATIONS,
    worlds: ["orbit", "quantum", "mars", "ocean", "timelab"],
  };
}

export function seedMinimal(): MockDataset { return buildMockDataset("beginner"); }
export function seedDemo(): MockDataset { return buildMockDataset("active-learner"); }
export function seedRich(): MockDataset { return buildMockDataset("power-user"); }
export function seedAdvanced(): MockDataset { return buildMockDataset("advanced-learner"); }
export function seedExamPrep(): MockDataset { return buildMockDataset("exam-prep"); }
export function seedExplorer(): MockDataset { return buildMockDataset("explorer"); }
export function seedOffline(): MockDataset { return buildMockDataset("offline-user"); }
export function seedErrors(): MockDataset { return buildMockDataset("error-state"); }

export function packForScenario(scenario: MockScenarioId): SeedPackId {
  return SCENARIO_TO_PACK[scenario];
}

export function defaultLearnerFor(scenario: MockScenarioId): string {
  return SCENARIO_LEARNER[scenario];
}

export type { MockErrorScenarioId };
