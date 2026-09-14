import { clone } from "../utils/clone";
import { isoDaysAgo } from "../clock";
import { masteryState } from "@/lib/education";
import type { MockMastery } from "../types";

export function createMockMastery(overrides: Partial<MockMastery> = {}): MockMastery {
  const attemptCount = overrides.attemptCount ?? 8;
  const correctCount = overrides.correctCount ?? 5;
  const masteryPercent = overrides.masteryPercent ?? Math.round((correctCount / Math.max(1, attemptCount)) * 100);
  return clone({
    id: "mastery-maya-kinematics",
    userId: "user-maya",
    conceptId: "kinematics",
    topicId: "kinematics",
    masteryPercent,
    confidence: 0.62,
    attemptCount,
    correctCount,
    lastPracticedAt: isoDaysAgo(1, 3),
    nextReviewAt: isoDaysAgo(-2, 10),
    trend: "up",
    misconceptions: ["acceleration is speed"],
    recommendedAction: masteryPercent < 50 ? "review" : masteryPercent < 80 ? "practice" : "advance",
    state: masteryState(masteryPercent / 100),
    ...overrides,
  });
}
