import { clone } from "../utils/clone";
import type { MockDifficulty, MockMission, MockMissionStep } from "../types";

export function createMockMission(overrides: Partial<MockMission> = {}): MockMission {
  const steps: MockMissionStep[] = overrides.steps ?? [
    { id: "step-lesson", title: "Study the lesson", action: "lesson", referenceId: "lesson-projectile-foundations", complete: false },
    { id: "step-practice", title: "Solve a range problem", action: "practice", referenceId: "problem-projectile-range-1", complete: false },
    { id: "step-lab", title: "Run the projectile lab", action: "simulation", referenceId: "sim-projectile", complete: false },
  ];
  const completeCount = steps.filter((step) => step.complete).length;
  return clone({
    id: "orbit-mission-1",
    worldId: "orbit",
    title: "Catch a Falling Satellite",
    story: "A training satellite is drifting on a predictable ballistic arc. You must reconstruct its path before the next pass.",
    objective: "Predict range and flight time from launch speed and angle.",
    topic: "projectile-motion",
    goal: 3,
    rewardXp: 40,
    requiredLevel: 1,
    missionId: "orbit-mission-1",
    hook: "The range is wrong unless horizontal and vertical motion stay independent.",
    conceptIds: ["kinematics", "projectile-motion"],
    steps,
    requiredActions: steps.map((step) => step.action),
    rewardBadge: "gravity-explorer",
    difficulty: "medium" as MockDifficulty,
    estimatedMinutes: 18,
    completionPercent: steps.length ? completeCount / steps.length : 0,
    ...overrides,
  });
}
