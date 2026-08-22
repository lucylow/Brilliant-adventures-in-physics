import { describe, expect, it } from "vitest";
import { checkNumericAnswer, criticalAngleDeg, projectile, refraction, temperatureChangeFromEnergy, thermalEnergy, wave, waveFrequency, wavePeriod, waveSpeed } from "../lib/physics";
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

  it("computes refraction using Snell's law", () => {
    const result = refraction({ incidentAngleDeg: 30, refractiveIndexFrom: 1, refractiveIndexTo: 1.5 });
    expect(result.totalInternalReflection).toBe(false);
    expect(result.refractedAngleDeg).toBeCloseTo(19.4712, 3);
    expect(result.criticalAngleDeg).toBeNull();
  });

  it("detects total internal reflection and critical angle", () => {
    const critical = criticalAngleDeg(1.5, 1);
    expect(critical).toBeCloseTo(41.8103, 3);
    const result = refraction({ incidentAngleDeg: 60, refractiveIndexFrom: 1.5, refractiveIndexTo: 1 });
    expect(result.totalInternalReflection).toBe(true);
    expect(result.refractedAngleDeg).toBeNull();
    expect(result.criticalAngleDeg).toBeCloseTo(critical ?? 0, 6);
  });

  it("rejects invalid optical parameters", () => {
    expect(() => refraction({ incidentAngleDeg: 90, refractiveIndexFrom: 1, refractiveIndexTo: 1.5 })).toThrow("incidentAngleDeg must be in the range");
    expect(() => criticalAngleDeg(0, 1)).toThrow("refractiveIndexFrom must be positive");
  });

  it("computes thermal energy and temperature change deterministically", () => {
    expect(thermalEnergy({ massKg: 2, specificHeatJPerKgK: 4186, temperatureChangeK: 5 })).toBe(41860);
    expect(temperatureChangeFromEnergy(41860, 2, 4186)).toBe(5);
  });

  it("rejects invalid thermal parameters", () => {
    expect(() => thermalEnergy({ massKg: 0, specificHeatJPerKgK: 4186, temperatureChangeK: 5 })).toThrow("massKg must be positive");
    expect(() => temperatureChangeFromEnergy(100, 1, -1)).toThrow("specificHeatJPerKgK must be positive");
    expect(() => thermalEnergy({ massKg: 1, specificHeatJPerKgK: 1, temperatureChangeK: Number.NaN })).toThrow("temperatureChangeK must be finite");
  });
});

describe("AI contracts", () => {
  it("creates a schema-compatible mock tutor answer", () => {
    const answer = validateTutorAnswer(createMockTutorAnswer("Explain velocity"));
    expect(answer.steps.length).toBeGreaterThan(0);
    expect(answer.summary).toContain("velocity");
  });
});
