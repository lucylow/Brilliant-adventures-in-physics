import { clone } from "../utils/clone";
import type { MockDifficulty, MockTopic } from "../types";

export function createMockTopic(overrides: Partial<MockTopic> = {}): MockTopic {
  return clone({
    id: "kinematics",
    name: "Kinematics",
    shortDescription: "Describe motion with position, velocity, and acceleration without naming the cause.",
    domain: "Mechanics",
    difficulty: "easy" as MockDifficulty,
    estimatedMinutes: 45,
    prerequisites: [],
    conceptIds: ["kinematics"],
    simulationIds: ["sim-projectile"],
    lessonIds: ["lesson-kinematics-foundations"],
    practiceProblemIds: [],
    icon: "→",
    accent: "#2563EB",
    featured: true,
    ...overrides,
  });
}
