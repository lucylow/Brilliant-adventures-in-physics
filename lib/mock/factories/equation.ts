import { clone } from "../utils/clone";
import type { MockEquation } from "../types";

export function createMockEquation(overrides: Partial<MockEquation> = {}): MockEquation {
  return clone({
    id: "eq-newton-2",
    latex: "F = ma",
    plainText: "F = ma",
    variables: [
      { symbol: "F", name: "net force", unit: "N" },
      { symbol: "m", name: "mass", unit: "kg" },
      { symbol: "a", name: "acceleration", unit: "m/s²" },
    ],
    units: "N, kg, m/s²",
    topicId: "dynamics",
    conceptId: "forces",
    description: "Net force equals mass times acceleration. This is a vector relation; direction matters.",
    exampleProblemIds: [],
    ...overrides,
  });
}
