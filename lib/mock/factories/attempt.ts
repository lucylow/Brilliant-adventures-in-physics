import { clone } from "../utils/clone";
import { isoDaysAgo } from "../clock";
import type { MockAttempt } from "../types";

export function createMockAttempt(overrides: Partial<MockAttempt> = {}): MockAttempt {
  return clone({
    id: "attempt-demo-1",
    problemId: "problem-kinetic-default",
    userId: "user-maya",
    submittedAt: isoDaysAgo(1, 4),
    answer: 9,
    isCorrect: true,
    durationSeconds: 48,
    hintsUsed: 0,
    attemptNumber: 1,
    xpEarned: 10,
    abandoned: false,
    timed: false,
    ...overrides,
  });
}
