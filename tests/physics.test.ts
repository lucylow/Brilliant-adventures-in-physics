import { describe, expect, it } from "vitest";
import { angularSpeedFromRpm, averagePowerFromWork, buoyantForce, centripetalAcceleration, checkNumericAnswer, coulombForce, criticalAngleDeg, electricField, elasticCollision1D, harmonicDisplacement, harmonicVelocity, hydrostaticPressure, impulse, kineticEnergy, momentum, ohmsLaw, powerFromCurrentResistance, projectile, refraction, resistanceFromVoltageCurrent, tangentialSpeed, temperatureChangeFromEnergy, thermalEnergy, velocityChangeFromImpulse, volumetricFlowRate, wave, waveFrequency, wavePeriod, waveSpeed, workFromForce } from "../lib/physics";
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

  it("computes mechanics quantities deterministically", () => {
    expect(kineticEnergy(2, 3)).toBe(9);
    expect(momentum(2, -3)).toBe(-6);
    expect(impulse(10, 0.4)).toBe(4);
    expect(velocityChangeFromImpulse(4, 2)).toBe(2);
  });

  it("rejects invalid mechanics parameters", () => {
    expect(() => kineticEnergy(0, 3)).toThrow("massKg must be positive");
    expect(() => momentum(1, Number.NaN)).toThrow("velocityMps must be finite");
    expect(() => impulse(2, 0)).toThrow("durationS must be positive");
    expect(() => velocityChangeFromImpulse(2, -1)).toThrow("massKg must be positive");
  });

  it("computes circular motion deterministically", () => {
    const omega = angularSpeedFromRpm(60);
    expect(omega).toBeCloseTo(2 * Math.PI, 8);
    expect(tangentialSpeed(omega, 2)).toBeCloseTo(4 * Math.PI, 8);
    expect(centripetalAcceleration(4, 2)).toBe(8);
  });

  it("rejects invalid circular-motion parameters", () => {
    expect(() => angularSpeedFromRpm(Number.NaN)).toThrow("revolutionsPerMinute must be finite");
    expect(() => tangentialSpeed(2, 0)).toThrow("radiusM must be positive");
    expect(() => centripetalAcceleration(4, -1)).toThrow("radiusM must be positive");
  });

  it("computes Coulomb force and electric field deterministically", () => {
    expect(coulombForce(1e-6, 2e-6, 0.5)).toBeCloseTo(0.0719004, 7);
    expect(coulombForce(1e-6, -2e-6, 0.5)).toBeCloseTo(-0.0719004, 7);
    expect(electricField(1e-6, 0.5)).toBeCloseTo(35950.2071692, 6);
  });

  it("rejects invalid electrostatics parameters", () => {
    expect(() => coulombForce(1, 2, 0)).toThrow("distanceM must be positive");
    expect(() => electricField(Number.NaN, 1)).toThrow("chargeC must be finite");
  });

  it("computes circuit quantities deterministically", () => {
    expect(ohmsLaw(12, 4)).toEqual({ voltage: 12, resistance: 4, current: 3, power: 36 });
    expect(resistanceFromVoltageCurrent(12, 3)).toBe(4);
    expect(powerFromCurrentResistance(3, 4)).toBe(36);
  });

  it("rejects invalid circuit parameters", () => {
    expect(() => ohmsLaw(Number.NaN, 4)).toThrow("voltage must be finite");
    expect(() => ohmsLaw(12, 0)).toThrow("resistance must be positive");
    expect(() => resistanceFromVoltageCurrent(12, 0)).toThrow("current must be non-zero");
    expect(() => powerFromCurrentResistance(3, -1)).toThrow("resistance must be positive");
  });

  it("computes fluid quantities deterministically", () => {
    expect(hydrostaticPressure(1000, 2)).toBeCloseTo(19613.3, 6);
    expect(buoyantForce(1000, 0.01)).toBeCloseTo(98.0665, 6);
    expect(volumetricFlowRate(0.02, 3)).toBe(0.06);
  });

  it("rejects invalid fluid parameters", () => {
    expect(() => hydrostaticPressure(0, 2)).toThrow("densityKgM3 must be positive");
    expect(() => buoyantForce(1000, -1)).toThrow("displacedVolumeM3 must be positive");
    expect(() => volumetricFlowRate(0, 3)).toThrow("areaM2 must be positive");
    expect(() => volumetricFlowRate(1, Number.NaN)).toThrow("speedMps must be finite");
  });

  it("computes harmonic motion deterministically", () => {
    expect(harmonicDisplacement(0.2, 1, 0)).toBeCloseTo(0.2, 8);
    expect(harmonicDisplacement(0.2, 1, 0.25)).toBeCloseTo(0, 8);
    expect(harmonicVelocity(0.2, 1, 0)).toBeCloseTo(0, 8);
    expect(harmonicVelocity(0.2, 1, 0.25)).toBeCloseTo(-0.4 * Math.PI, 8);
    expect(harmonicDisplacement(0.2, 1, 0, Math.PI / 2)).toBeCloseTo(0, 8);
  });

  it("rejects invalid harmonic-motion parameters", () => {
    expect(() => harmonicDisplacement(0, 1, 0)).toThrow("amplitudeM must be positive");
    expect(() => harmonicVelocity(1, -1, 0)).toThrow("frequencyHz must be positive");
    expect(() => harmonicDisplacement(1, 1, Number.NaN)).toThrow("timeS must be finite");
    expect(() => harmonicVelocity(1, 1, 0, Number.NaN)).toThrow("phaseRad must be finite");
  });

  it("computes an elastic collision and conserves momentum", () => {
    const result = elasticCollision1D(2, 3, 1, -1);
    expect(result.finalVelocity1Mps).toBeCloseTo(1 / 3, 8);
    expect(result.finalVelocity2Mps).toBeCloseTo(13 / 3, 8);
    expect(result.finalMomentumKgMps).toBeCloseTo(result.initialMomentumKgMps, 8);
  });

  it("rejects invalid collision masses and velocities", () => {
    expect(() => elasticCollision1D(0, 1, 1, 0)).toThrow("mass1Kg must be positive");
    expect(() => elasticCollision1D(1, Number.NaN, 1, 0)).toThrow("velocity1Mps must be finite");
    expect(() => elasticCollision1D(1, 1, -1, 0)).toThrow("mass2Kg must be positive");
  });

  it("computes work and average power deterministically", () => {
    expect(workFromForce(10, 3)).toBe(30);
    expect(workFromForce(10, 3, 60)).toBeCloseTo(15, 8);
    expect(averagePowerFromWork(30, 5)).toBe(6);
  });

  it("rejects invalid work-energy parameters", () => {
    expect(() => workFromForce(10, 0)).toThrow("displacementM must be positive");
    expect(() => workFromForce(10, 1, 181)).toThrow("angleDeg must be in the range");
    expect(() => averagePowerFromWork(Number.NaN, 1)).toThrow("workJ must be finite");
    expect(() => averagePowerFromWork(10, 0)).toThrow("durationS must be positive");
  });
});

describe("AI contracts", () => {
  it("creates a schema-compatible mock tutor answer", () => {
    const answer = validateTutorAnswer(createMockTutorAnswer("Explain velocity"));
    expect(answer.steps.length).toBeGreaterThan(0);
    expect(answer.summary).toContain("velocity");
  });
});
