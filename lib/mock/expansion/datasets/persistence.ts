import { ERROR_CODES } from "@shared/errors/error-codes";
import { isoDaysAgo } from "../../clock";
import type { ErrorInjection, PersistenceFixture } from "../types";

export function createPersistenceFixtures(): PersistenceFixture[] {
  return [
    {
      kind: "draftSave",
      payload: { id: "practice", data: { index: 2, answer: "12.4" }, updatedAt: isoDaysAgo(0, 1) },
      note: "In-progress practice draft.",
    },
    {
      kind: "completedSave",
      payload: { id: "experiment-ramp-1", status: "completed", updatedAt: isoDaysAgo(1, 4) },
      note: "Fully saved lab snapshot.",
    },
    {
      kind: "corruptedSave",
      payload: "{not-json",
      note: "Unparseable blob for recovery UI tests.",
    },
    {
      kind: "legacySave",
      payload: { schema: "0.9.0", xp: 100, learner: "maya" },
      note: "Pre-1.1 mock schema; migrates into current learner fields.",
    },
    {
      kind: "partialSave",
      payload: { learning: { attempts: 4 }, experiments: null },
      note: "Learning present, experiments missing.",
    },
  ];
}

export function createMigrationFixtures(): PersistenceFixture[] {
  return [
    {
      kind: "legacySave",
      payload: { version: "0.8.0", concepts: [{ id: "motion", title: "Motion" }] },
      note: "Old concept id 'motion' should map to kinematics during tests.",
    },
    {
      kind: "legacySave",
      payload: { version: "1.0.0", problems: [{ id: "p1", xpReward: 10 }] },
      note: "1.0.0 problem records remain valid in 1.1.0.",
    },
  ];
}

export function createCacheFixtures() {
  return {
    freshLesson: { id: "lesson-kinematics", cachedAt: isoDaysAgo(0, 1), stale: false },
    staleSimulation: { id: "sim-projectile", cachedAt: isoDaysAgo(14, 0), stale: true },
    freshProgress: { attempts: 12, cachedAt: isoDaysAgo(0, 2), stale: false },
    staleTutor: { id: "tutor-session-acceleration", cachedAt: isoDaysAgo(21, 3), stale: true },
    freshPractice: { count: 8, cachedAt: isoDaysAgo(0, 3), stale: false },
  };
}

export function createConflictFixtures() {
  return {
    localNewer: { localUpdatedAt: isoDaysAgo(0, 1), serverUpdatedAt: isoDaysAgo(1, 2), winner: "local" as const },
    serverNewer: { localUpdatedAt: isoDaysAgo(2, 1), serverUpdatedAt: isoDaysAgo(0, 2), winner: "server" as const },
    sameTimestamp: { localUpdatedAt: isoDaysAgo(1, 4), serverUpdatedAt: isoDaysAgo(1, 4), winner: "tie" as const },
    conflictingEdit: { localUpdatedAt: isoDaysAgo(0, 3), serverUpdatedAt: isoDaysAgo(0, 3), winner: "conflict" as const, note: "Same timestamp, different payload hashes." },
  };
}

export function createErrorInjections(): ErrorInjection[] {
  return [
    { id: "err-lesson", operation: "lessonLoad", code: ERROR_CODES.NOT_FOUND, message: "Mock lesson payload missing." },
    { id: "err-problem", operation: "problemLoad", code: ERROR_CODES.NOT_FOUND, message: "Mock problem payload missing." },
    { id: "err-progress", operation: "progressSave", code: ERROR_CODES.PERSISTENCE, message: "Mock progress save rejected." },
    { id: "err-experiment", operation: "experimentSave", code: ERROR_CODES.NETWORK, message: "Mock experiment save failed." },
    { id: "err-tutor", operation: "TutorRequest", code: ERROR_CODES.TUTOR_SERVICE, message: "Mock tutor timed out." },
    { id: "err-sim", operation: "simulationLoad", code: ERROR_CODES.SIMULATION, message: "Mock simulation assets unavailable." },
    { id: "err-scan", operation: "scanParse", code: ERROR_CODES.VALIDATION, message: "Mock scan parse rejected." },
    { id: "err-image", operation: "imageLoad", code: ERROR_CODES.MEDIA_UNAVAILABLE, message: "Mock image missing." },
    { id: "err-search", operation: "search", code: ERROR_CODES.TIMEOUT, message: "Mock search timed out." },
    { id: "err-notify", operation: "notificationLoad", code: ERROR_CODES.NETWORK, message: "Mock notifications unavailable." },
  ];
}

export function createPartialDataScenarios() {
  return {
    lessonWithoutSimulation: { lessonId: "lesson-kinematics", simulationId: null },
    progressWithoutActivity: { attempts: 4, activity: [] },
    userWithoutAvatar: { userId: "user-cameron", avatarUrl: null },
    experimentWithoutGraph: { experimentId: "lab-precession-demo", graphId: null },
  };
}

export function createEmptyScenarios() {
  return {
    newUser: { attempts: 0, achievements: 0, experiments: 0, tutorSessions: 0, notifications: 0 },
    newTopic: { masteryPercent: 0, attempts: 0 },
    noAttempts: { attempts: 0 },
    noAchievements: { earned: 0 },
    noSavedExperiments: { experiments: 0 },
    noTutorSessions: { tutorSessions: 0 },
    noNotifications: { notifications: 0 },
  };
}

export function createEdgeCaseNumbers() {
  return {
    progress: [0, 1, 25, 50, 75, 99, 100],
    invalidProgress: [-1, 101],
    streaks: [0, 1, 7, 30, 100, 365],
    xp: [0, 10, 100, 999, 1_000_000],
  };
}

export function createDateEdgeFixtures() {
  return {
    midnight: "2026-09-14T00:00:00.000Z",
    weekBoundary: "2026-09-13T23:59:00.000Z",
    monthBoundary: "2026-08-31T23:59:00.000Z",
    yearBoundary: "2025-12-31T23:59:00.000Z",
    leapDay: "2024-02-29T12:00:00.000Z",
    dstSensitive: "2026-03-08T07:00:00.000Z",
    timezone: { zone: "America/New_York", mockUtc: "2026-09-14T16:00:00.000Z" },
  };
}

export function createRecommendationCases() {
  return [
    { id: "rec-weak-mech", label: "weak mechanics", weak: ["kinematics", "forces"], strong: ["optics"] },
    { id: "rec-strong-mech-weak-opt", label: "strong mechanics / weak optics", weak: ["snells-law"], strong: ["kinematics", "energy"] },
    { id: "rec-high-acc", label: "high practice accuracy", accuracy: 0.92 },
    { id: "rec-low-conf", label: "low conceptual confidence", confidence: 0.28 },
    { id: "rec-new", label: "new learner", learnerId: "user-cameron" },
    { id: "rec-return", label: "returning learner", learnerId: "user-sam" },
    { id: "rec-exam", label: "exam soon", learnerId: "user-taylor" },
    { id: "rec-inactive", label: "long inactive streak", learnerId: "user-sam", streak: 0 },
  ];
}
