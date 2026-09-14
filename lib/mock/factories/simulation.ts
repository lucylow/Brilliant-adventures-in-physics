import { clone } from "../utils/clone";
import type { MockDifficulty, MockSimulation } from "../types";

export function createMockSimulation(overrides: Partial<MockSimulation> = {}): MockSimulation {
  return clone({
    id: "sim-projectile",
    title: "Projectile Lab",
    description: "Launch a projectile and inspect range, peak height, and flight time from a verified kinematics model.",
    category: "projectile motion",
    difficulty: "easy" as MockDifficulty,
    thumbnail: { motif: "arc", accent: "#2563EB" },
    parameters: [
      { key: "speed", label: "Launch speed", unit: "m/s", min: 5, max: 40, step: 1, defaultValue: 18 },
      { key: "angleDeg", label: "Launch angle", unit: "°", min: 10, max: 80, step: 1, defaultValue: 42 },
    ],
    defaultParameters: { speed: 18, angleDeg: 42, height: 0 },
    observableQuantities: ["range", "peakHeight", "flightTime"],
    equations: ["x = vₓ t", "y = y₀ + vᵧ t − ½gt²"],
    learningGoals: ["Separate horizontal and vertical motion", "Predict range from speed and angle"],
    controls: ["speed", "angle", "play", "reset"],
    duration: 8,
    featured: true,
    tags: ["mechanics", "kinematics", "lab"],
    conceptIds: ["kinematics"],
    topicId: "projectile-motion",
    ...overrides,
  });
}
