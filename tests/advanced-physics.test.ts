import { describe, expect, it } from "vitest";
import { SPEED_OF_LIGHT, energyMomentum, lengthContracted, lorentzGamma, normalizeWavefunction, probabilityDensity, properTime, quantumOscillatorEnergy, tunnelingFactor } from "../lib/advanced-physics";

describe("advanced physics helpers", () => {
  it("handles relativity deterministically below the speed boundary", () => {
    expect(lorentzGamma(0)).toBe(1);
    expect(properTime(1, 0.6 * SPEED_OF_LIGHT)).toBeCloseTo(0.8, 10);
    expect(lengthContracted(10, 0.6 * SPEED_OF_LIGHT)).toBeCloseTo(8, 10);
    expect(() => lorentzGamma(SPEED_OF_LIGHT)).toThrow("below the speed of light");
  });

  it("computes energy-momentum and quantum ground-state quantities", () => {
    expect(energyMomentum(1, 0)).toBeCloseTo(SPEED_OF_LIGHT ** 2, -10);
    expect(quantumOscillatorEnergy(0, 1e15)).toBeGreaterThan(0);
    expect(probabilityDensity({ re: 3, im: 4 })).toBe(25);
    expect(tunnelingFactor(2, 3, 1, 1)).toBe(1);
  });

  it("normalizes wavefunctions and rejects invalid domains", () => {
    const normalized = normalizeWavefunction([{ re: 1, im: 0 }, { re: 1, im: 0 }], 1);
    expect(normalized[0].re).toBeCloseTo(1 / Math.sqrt(2), 10);
    expect(() => quantumOscillatorEnergy(-1, 1)).toThrow("non-negative integer");
    expect(() => normalizeWavefunction([], 1)).toThrow("must contain samples");
  });
});
