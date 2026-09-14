import { clone } from "../utils/clone";
import type { MockConcept, MockDifficulty } from "../types";

export function createMockConcept(overrides: Partial<MockConcept> = {}): MockConcept {
  const title = overrides.title ?? "Velocity";
  return clone({
    id: overrides.id ?? "velocity",
    title,
    domain: "Mechanics",
    level: "foundation",
    prerequisites: [],
    intuition: "Velocity is the rate of change of position, including direction.",
    equation: "v = Δx / Δt",
    units: "m/s",
    misconceptionKeywords: ["velocity is the same as speed"],
    whyItMatters: "It lets you predict where an object will be after a known time.",
    topicId: "kinematics",
    summary: "Velocity combines speed with direction and is the slope of a position–time graph.",
    equationIds: ["eq-velocity"],
    exampleIds: [],
    lessonIds: [],
    simulationIds: [],
    difficulty: "easy" as MockDifficulty,
    masteryThresholds: { developing: 0.35, practicing: 0.65, strong: 0.85 },
    estimatedMinutes: 12,
    ...overrides,
  });
}
