import { clone } from "../utils/clone";
import { isoDaysAgo } from "../clock";
import { createMockProblem } from "../factories/problem";
import { createMockTutorSession } from "../factories/tutor-session";
import { createMockMission } from "../factories/mission";
import { createMockExperiment } from "../factories/experiment";
import { createMockSimulation } from "../factories/simulation";
import { createCsvTable } from "./generators/csv";
import type { DailyChallenge, ExamSession, LabExperiment, LearnerJourney, MockExpansion, WeeklyCampaign } from "./types";
import type { MockActivity, MockProblem, MockReviewItem, MockSimulation, MockTutorSession } from "../types";

export function createLearnerJourney(overrides: Partial<LearnerJourney> = {}): LearnerJourney {
  return {
    id: "journey-demo",
    learnerId: "user-maya",
    startingLevel: "core",
    goals: ["Keep a streak", "Secure projectile motion"],
    completedTopics: ["kinematics"],
    currentTopic: "projectile-motion",
    futureTopics: ["energy", "orbits"],
    attemptHistoryIds: [],
    mistakeIds: [],
    streakHistory: [1, 2, 3, 4, 5, 6],
    recommendedNextSteps: ["Projectile lesson", "Range practice"],
    ...overrides,
  };
}

export function createExperimentSeries(base: LabExperiment, count = 3): LabExperiment[] {
  return Array.from({ length: count }, (_, index) => ({
    ...clone(base),
    id: `${base.id}-series-${index + 1}`,
    title: `${base.title} · trial set ${index + 1}`,
    data: createCsvTable(
      `${base.data.id}-s${index + 1}`,
      `${base.title} series ${index + 1}`,
      `${base.id}-series-${index + 1}`,
      base.data.columns,
      base.data.rows.map((row) => row.map((cell, cellIndex) => (cellIndex === 0 ? cell : cell + index * 0.01))),
    ),
  }));
}

export function createPracticeSession(problems: readonly MockProblem[], size = 8): MockProblem[] {
  return clone(problems.slice(0, Math.min(size, problems.length)));
}

export function createMissionCampaign(theme: string, missions: ReturnType<typeof createMockMission>[]): WeeklyCampaign {
  return {
    id: `campaign-${theme.toLowerCase().replace(/\s+/g, "-")}`,
    week: 1,
    theme,
    conceptIds: [...new Set(missions.flatMap((mission) => mission.conceptIds))],
    missionIds: missions.map((mission) => mission.id),
    simulationIds: missions.flatMap((mission) => mission.steps.filter((step) => step.action === "simulation").map((step) => step.referenceId)),
    mockLabel: "MOCK_CAMPAIGN",
  };
}

export function createTutorConversation(title: string, conceptId: string): MockTutorSession {
  return createMockTutorSession({
    id: `tutor-factory-${conceptId}`,
    title,
    conceptId,
    topicId: conceptId,
  });
}

export function createSimulationCollection(simulations: readonly MockSimulation[], category?: string): MockSimulation[] {
  const filtered = category ? simulations.filter((item) => item.category === category) : [...simulations];
  return clone(filtered);
}

export function createExamSession(problemIds: string[], count: 10 | 20 | 40 | 60): ExamSession {
  return {
    id: `exam-factory-${count}`,
    title: `${count}-question factory paper`,
    questionCount: count,
    questionIds: problemIds.slice(0, count),
    kinds: ["numeric", "conceptual", "multi-step"],
    difficultyDistribution: { easy: 0.3, medium: 0.4, hard: 0.2, challenge: 0.1 },
    timeLimitMin: count * 1.5,
    score: 70,
    accuracy: 0.7,
    timePerQuestionS: 60,
    weakAreas: ["units"],
    reviewList: problemIds.slice(0, 5),
    mockLabel: "MOCK_EXAM",
  };
}

export function createReviewQueue(userId: string, conceptIds: string[]): MockReviewItem[] {
  return conceptIds.map((conceptId, index) => ({
    id: `review-factory-${conceptId}`,
    userId,
    conceptId,
    dueAt: isoDaysAgo(index, 10),
    priority: 20 - index,
    reason: "Spaced review from expansion factory",
    lastScore: 0.4 + index * 0.05,
  }));
}

export function createActivityTimeline(userId: string, days = 180): MockActivity[] {
  const kinds: MockActivity["kind"][] = ["lesson-completed", "problem-solved", "simulation-run", "tutor-asked", "review", "experiment-saved"];
  return Array.from({ length: days }, (_, index) => {
    const kind = kinds[index % kinds.length];
    return {
      id: `activity-day-${index + 1}`,
      userId,
      kind,
      title: `${kind.replace(/-/g, " ")} · day ${index + 1}`,
      detail: "Deterministic expansion-II activity fixture.",
      occurredAt: isoDaysAgo(index, 8),
      xp: 6 + (index % 5),
      referenceId: `ref-day-${index + 1}`,
    };
  });
}

export { createMockProblem, createMockMission, createMockExperiment, createMockSimulation };

export function challengeForDay(challenges: readonly DailyChallenge[], dayIndex: number): DailyChallenge {
  return challenges[Math.abs(dayIndex) % challenges.length];
}
