import { describe, expect, it } from "vitest";
import { checkNumericAnswer, projectile } from "../lib/physics";
import { createMockTutorAnswer, validateTutorAnswer } from "../lib/ai";

describe("physics engine", () => {
  it("computes a verified projectile result", () => {
    const result = projectile({ speed: 18, angleDeg: 42, height: 0 });
    expect(result.flightTime).toBeGreaterThan(2);
    expect(result.range).toBeGreaterThan(20);
    expect(result.peakHeight).toBeGreaterThan(5);
  });

  it("accepts a small numerical tolerance", () => {
    expect(checkNumericAnswer(9.81, 9.80665)).toBe(true);
    expect(checkNumericAnswer(11, 9.80665)).toBe(false);
  });
});

describe("AI contracts", () => {
  it("creates a schema-compatible mock tutor answer", () => {
    const answer = validateTutorAnswer(createMockTutorAnswer("Explain velocity"));
    expect(answer.steps.length).toBeGreaterThan(0);
    expect(answer.summary).toContain("velocity");
  });
});
