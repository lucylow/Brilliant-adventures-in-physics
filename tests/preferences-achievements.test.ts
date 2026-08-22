import { describe, expect, it } from "vitest";
import { evaluateAchievements } from "../lib/achievements";
import type { LearningState } from "../lib/progress-store";

describe("preferences and achievement evidence", () => {
  it("does not award learn-by-doing without both lesson and lab evidence", () => {
    const base: LearningState = { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 1, labsCompleted: 0 };
    expect(evaluateAchievements(base).find((item) => item.id === "lesson-lab-loop")?.earned).toBe(false);
    expect(evaluateAchievements({ ...base, labsCompleted: 1 }).find((item) => item.id === "lesson-lab-loop")?.earned).toBe(true);
  });
});
