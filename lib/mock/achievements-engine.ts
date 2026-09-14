import type { LearningState } from "@/lib/progress-store";
import { createMockAchievementState } from "./factories/achievement";
import { getMockDataset } from "./registry";
import type { MockAchievementState } from "./types";

export function evaluateMockAchievements(learning: LearningState): MockAchievementState[] {
  const definitions = getMockDataset().achievements;
  return definitions.map((definition) => {
    let earned = false;
    if (definition.criteria.kind === "attempts") earned = learning.attempts >= definition.criteria.threshold;
    if (definition.criteria.kind === "lessons") earned = learning.lessonsCompleted >= definition.criteria.threshold;
    if (definition.criteria.kind === "labs") earned = learning.labsCompleted >= definition.criteria.threshold;
    if (definition.criteria.kind === "streak") earned = learning.streak >= definition.criteria.threshold;
    if (definition.criteria.kind === "topics") earned = Object.keys(learning.topics).length >= definition.criteria.threshold;
    if (definition.criteria.kind === "lesson-lab") earned = learning.lessonsCompleted >= 1 && learning.labsCompleted >= 1;
    if (definition.criteria.kind === "strong-topic") {
      earned = Object.values(learning.topics).some((topic) => topic.attempts >= 3 && topic.correct / topic.attempts >= 0.8);
    }
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
    });
  });
}
