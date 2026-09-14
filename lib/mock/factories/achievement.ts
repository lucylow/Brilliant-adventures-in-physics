import { clone } from "../utils/clone";
import type { MockAchievementDefinition, MockAchievementState } from "../types";

export function createMockAchievement(overrides: Partial<MockAchievementDefinition> = {}): MockAchievementDefinition {
  return clone({
    id: "first-discovery",
    name: "First Discovery",
    description: "Complete your first lesson or verified practice attempt.",
    category: "practice",
    icon: "◇",
    criteria: { kind: "attempts", threshold: 1 },
    xpReward: 15,
    rarity: "common",
    ...overrides,
  });
}

export function createMockAchievementState(overrides: Partial<MockAchievementState> = {}): MockAchievementState {
  const definition = createMockAchievement();
  return clone({
    id: definition.id,
    title: definition.name,
    description: definition.description,
    icon: definition.icon,
    earned: false,
    definitionId: definition.id,
    xpReward: definition.xpReward,
    rarity: definition.rarity,
    category: definition.category,
    ...overrides,
  });
}
