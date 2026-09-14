import { createMockAttempt } from "../factories/attempt";
import { createMockMastery } from "../factories/mastery";
import { isoDateDaysAgo, isoDaysAgo } from "../clock";
import { createSeededRandom } from "../utils/rng";
import { masteryState } from "@/lib/education";
import { xpFor } from "@/lib/gamification";
import type { MockAttempt, MockConcept, MockDailyActivity, MockLearnerProfile, MockMastery, MockProblem } from "../types";

export function createAttemptHistory(user: MockLearnerProfile, problems: readonly MockProblem[], seed: string): MockAttempt[] {
  const rng = createSeededRandom(`${seed}:${user.id}:attempts`);
  const target = user.totalProblems <= 4 ? Math.max(6, user.totalProblems * 3) : Math.min(problems.length * 3, Math.max(520, user.totalProblems * 6));
  const attempts: MockAttempt[] = [];
  let attemptIndex = 0;
  let problemCursor = 0;
  while (attempts.length < target && problems.length > 0) {
    const problem = problems[problemCursor % problems.length];
    problemCursor += 1;
    const attemptsOnProblem = rng.randomBoolean(0.25) ? rng.randomInt(2, 3) : 1;
    for (let number = 1; number <= attemptsOnProblem; number += 1) {
      attemptIndex += 1;
      const abandoned = number < attemptsOnProblem && rng.randomBoolean(0.15);
      const correct = abandoned ? false : number === attemptsOnProblem ? rng.randomBoolean(0.62) : false;
      const hintsUsed = correct && rng.randomBoolean(0.3) ? rng.randomInt(1, 2) : rng.randomInt(0, 2);
      attempts.push(createMockAttempt({
        id: `attempt-${user.id}-${attemptIndex}`,
        problemId: problem.id,
        userId: user.id,
        submittedAt: isoDaysAgo(rng.randomInt(0, 89), rng.randomInt(1, 20)),
        answer: abandoned ? null : roundTo(problem.finalAnswer * (correct ? 1 : rng.randomChoice([0.5, 1.2, 2, -1])), problem.finalAnswer),
        isCorrect: correct,
        durationSeconds: rng.randomInt(20, 180),
        hintsUsed,
        attemptNumber: number,
        xpEarned: correct ? Math.max(0, xpFor("practice") - hintsUsed) : 0,
        abandoned,
        timed: rng.randomBoolean(0.2),
      }));
    }
  }
  return attempts.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

function roundTo(value: number, expected: number): number {
  if (!Number.isFinite(value)) return expected;
  const decimals = Math.abs(expected) < 0.01 ? 8 : 3;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function masteryFromAttempts(user: MockLearnerProfile, attempts: readonly MockAttempt[], problems: readonly MockProblem[], concepts: readonly MockConcept[]): MockMastery[] {
  const byConcept = new Map<string, MockAttempt[]>();
  const problemMap = new Map(problems.map((problem) => [problem.id, problem]));
  for (const attempt of attempts) {
    const conceptId = problemMap.get(attempt.problemId)?.conceptId;
    if (!conceptId) continue;
    const list = byConcept.get(conceptId) ?? [];
    list.push(attempt);
    byConcept.set(conceptId, list);
  }
  const records: MockMastery[] = [];
  for (const concept of concepts) {
    const conceptAttempts = byConcept.get(concept.id) ?? [];
    const explicit = user.masterySummary[concept.id] ?? user.masterySummary[concept.topicId];
    const correct = conceptAttempts.filter((attempt) => attempt.isCorrect).length;
    const attemptCount = conceptAttempts.length;
    const derived = attemptCount ? correct / attemptCount : 0;
    const masteryPercent = Math.round(100 * (explicit !== undefined ? explicit : attemptCount ? derived : 0.08));
    const last = conceptAttempts[conceptAttempts.length - 1];
    records.push(createMockMastery({
      id: `mastery-${user.id}-${concept.id}`,
      userId: user.id,
      conceptId: concept.id,
      topicId: concept.topicId,
      masteryPercent,
      confidence: Math.min(0.95, 0.35 + masteryPercent / 200),
      attemptCount: Math.max(attemptCount, explicit !== undefined ? Math.max(3, Math.round(masteryPercent / 12)) : 0),
      correctCount: attemptCount ? correct : Math.round((masteryPercent / 100) * Math.max(3, Math.round(masteryPercent / 12))),
      lastPracticedAt: last?.submittedAt ?? isoDaysAgo(Math.max(1, Math.round((100 - masteryPercent) / 8)), 6),
      nextReviewAt: isoDaysAgo(-Math.max(1, Math.round((100 - masteryPercent) / 20)), 10),
      trend: masteryPercent >= 70 ? "up" : masteryPercent >= 40 ? "steady" : "down",
      misconceptions: concept.misconceptionKeywords ?? [],
      recommendedAction: masteryPercent < 40 ? "revisit-prereq" : masteryPercent < 70 ? "practice" : masteryPercent < 85 ? "review" : "advance",
      state: masteryState(masteryPercent / 100),
    }));
  }
  return records;
}

export function createDailyActivity(user: MockLearnerProfile, attempts: readonly MockAttempt[], seed: string): MockDailyActivity[] {
  const rng = createSeededRandom(`${seed}:${user.id}:days`);
  const byDate = new Map<string, MockAttempt[]>();
  for (const attempt of attempts) {
    const key = attempt.submittedAt.slice(0, 10);
    const list = byDate.get(key) ?? [];
    list.push(attempt);
    byDate.set(key, list);
  }
  const days: MockDailyActivity[] = [];
  for (let day = 89; day >= 0; day -= 1) {
    const date = isoDateDaysAgo(day);
    const missed = rng.randomBoolean(0.22);
    const dayAttempts = byDate.get(date) ?? [];
    if (missed && dayAttempts.length === 0 && day !== 0) {
      days.push({ date, minutes: 0, problems: 0, lessons: 0, xp: 0 });
      continue;
    }
    const problems = dayAttempts.length || (missed ? 0 : rng.randomInt(0, 4));
    const lessons = problems > 2 ? 1 : rng.randomBoolean(0.2) ? 1 : 0;
    const minutes = problems === 0 && lessons === 0 ? 0 : rng.randomInt(8, 42);
    const xp = problems * 10 + lessons * 20;
    days.push({ date, minutes, problems, lessons, xp });
  }
  return days;
}
