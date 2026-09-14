import { clone } from "../utils/clone";
import type { MockDifficulty, MockProblem } from "../types";

export function createMockProblem(overrides: Partial<MockProblem> = {}): MockProblem {
  const givenValues = overrides.givenValues ?? { mass: 2, speed: 3 };
  const finalAnswer = overrides.finalAnswer ?? 0.5 * givenValues.mass * givenValues.speed ** 2;
  return clone({
    id: "problem-kinetic-default",
    conceptId: "energy",
    topicId: "energy",
    difficulty: "easy" as MockDifficulty,
    prompt: `A ${givenValues.mass} kg object moves at ${givenValues.speed} m/s. What is its kinetic energy?`,
    givenValues,
    unknown: "kinetic energy",
    unit: "J",
    hints: ["Kinetic energy depends on mass and speed, not on direction.", "Use K = ½mv² and keep joules visible."],
    solutionSteps: [`Write K = ½mv².`, `Substitute m = ${givenValues.mass} kg and v = ${givenValues.speed} m/s.`, `K = ${finalAnswer} J.`],
    finalAnswer,
    tolerance: 0.02,
    explanation: "Kinetic energy is a scalar. Doubling speed quadruples K because of the v² dependence.",
    commonWrongAnswers: [givenValues.mass * givenValues.speed, givenValues.mass * givenValues.speed ** 2],
    estimatedTime: 90,
    xpReward: 10,
    equationId: "eq-kinetic",
    ...overrides,
  });
}
