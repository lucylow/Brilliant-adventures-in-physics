import { describe, expect, it } from "vitest";
import { SPEED_OF_LIGHT, braggAngleRad, crystalDensityKgM3, electronConfiguration, energyMomentum, hydrogenicTransitionEnergyEV, lengthContracted, lorentzGamma, normalizeWavefunction, probabilityDensity, properTime, quantumOscillatorEnergy, radioactiveRemaining, spectralWavelengthNm, tunnelingFactor, vibrationalEnergyJ } from "../lib/advanced-physics";

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

  it("computes atomic, molecular, nuclear, and lattice models", () => {
    const transition = hydrogenicTransitionEnergyEV(1, 3, 2);
    expect(transition).toBeCloseTo(1.8896795833333333, 12);
    expect(spectralWavelengthNm(transition)).toBeCloseTo(656.1122823505145, 10);
    expect(electronConfiguration(10)).toEqual([{ shell: 1, electrons: 2 }, { shell: 2, electrons: 8 }]);
    expect(vibrationalEnergyJ(0, 1e15)).toBeGreaterThan(0);
    expect(radioactiveRemaining(1, 10, 10)).toBeCloseTo(0.5, 10);
    expect(crystalDensityKgM3(2, 4)).toBe(0.5);
    expect(braggAngleRad(1, 2)).toBeCloseTo(Math.asin(0.25), 10);
    expect(() => braggAngleRad(5, 2)).toThrow("no real angle");
  });

  it("normalizes wavefunctions and rejects invalid domains", () => {
    const normalized = normalizeWavefunction([{ re: 1, im: 0 }, { re: 1, im: 0 }], 1);
    expect(normalized[0].re).toBeCloseTo(1 / Math.sqrt(2), 10);
    expect(() => quantumOscillatorEnergy(-1, 1)).toThrow("non-negative integer");
    expect(() => normalizeWavefunction([], 1)).toThrow("must contain samples");
  });
});
