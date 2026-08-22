import { describe, expect, it } from "vitest";
import { checkNumericAnswer, projectile, wave, waveFrequency, wavePeriod, waveSpeed } from "../lib/physics";
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

  it("computes wave speed, frequency, wavelength, and period deterministically", () => {
    expect(waveSpeed(4, 0.5)).toBe(2);
    expect(waveFrequency(2, 0.5)).toBe(4);
    expect(wavePeriod(4)).toBe(0.25);
    expect(wave({ frequencyHz: 4, wavelengthM: 0.5 })).toEqual({ speedMps: 2, frequencyHz: 4, wavelengthM: 0.5, periodS: 0.25 });
  });

  it("rejects non-positive wave parameters", () => {
    expect(() => waveSpeed(0, 1)).toThrow("frequencyHz must be positive");
    expect(() => waveFrequency(2, -1)).toThrow("wavelengthM must be positive");
    expect(() => wavePeriod(Number.NaN)).toThrow("frequencyHz must be finite");
  });
});

describe("AI contracts", () => {
  it("creates a schema-compatible mock tutor answer", () => {
    const answer = validateTutorAnswer(createMockTutorAnswer("Explain velocity"));
    expect(answer.steps.length).toBeGreaterThan(0);
    expect(answer.summary).toContain("velocity");
  });
});
