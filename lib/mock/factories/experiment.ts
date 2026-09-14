import { clone } from "../utils/clone";
import { isoDaysAgo } from "../clock";
import type { MockExperiment } from "../types";

export function createMockExperiment(overrides: Partial<MockExperiment> = {}): MockExperiment {
  return clone({
    id: "experiment-ramp-1",
    title: "Rolling object on a ramp",
    points: [
      { time: 0, distance: 0 },
      { time: 0.5, distance: 0.4 },
      { time: 1, distance: 1.6 },
    ],
    summary: "Distance grew faster than linearly, consistent with roughly constant acceleration down the ramp.",
    createdAt: isoDaysAgo(6, 11),
    category: "mechanical",
    description: "A cart rolls from rest down a straight ramp. Time and distance were recorded locally.",
    components: ["ramp", "cart", "meter stick", "stopwatch"],
    variables: { angleDeg: 20, massKg: 0.5 },
    initialConditions: { v0: 0, x0: 0 },
    expectedObservation: "Displacement should increase with t² if acceleration is constant.",
    status: "completed",
    updatedAt: isoDaysAgo(6, 10),
    conceptId: "kinematics",
    ...overrides,
  });
}
