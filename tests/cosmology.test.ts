import { describe, expect, it } from "vitest";
import { CMB_TEMPERATURE_K, COSMOLOGY, FALLBACK_COSMIC_ERAS, FALLBACK_UNIVERSE, advanceExpansion, calculateLookbackFraction, cmbPhotonEnergy, cmbTemperatureAtRedshift, createCosmicTimeState, cosmicEraFromTemperature, criticalDensity, generateCMBSpectrum, generateLightCone, hubbleParameter, lorentzFactorBeta, matterDensity, redshiftToScaleFactor, relativisticEnergyBeta, relativisticMomentumBeta, scaleFactorToRedshift, spacetimeInterval, temperatureFromScaleFactor } from "../lib/cosmology";

describe("cosmology", () => {
  it("converts scale factor and redshift deterministically", () => {
    expect(redshiftToScaleFactor(0)).toBe(1);
    expect(redshiftToScaleFactor(1)).toBe(0.5);
    expect(scaleFactorToRedshift(0.5)).toBe(1);
  });

  it("advances a bounded expansion state", () => {
    const next = advanceExpansion({ scaleFactor: 1, redshift: 0, cosmicTimeGyr: 10, expansionRatePerGyr: 0 }, 2, 0.1);
    expect(next.scaleFactor).toBeCloseTo(Math.exp(0.2), 10);
    expect(next.redshift).toBeCloseTo(Math.exp(-0.2) - 1, 10);
    expect(next.cosmicTimeGyr).toBe(12);
    expect(next.expansionRatePerGyr).toBe(0.1);
  });

  it("calculates Hubble and CMB values from the local model", () => {
    expect(hubbleParameter(FALLBACK_UNIVERSE.hubbleConstantKmsMpc, FALLBACK_UNIVERSE.matterFraction, FALLBACK_UNIVERSE.darkEnergyFraction, 0)).toBeCloseTo(67.3663, 3);
    expect(cmbTemperatureAtRedshift(0)).toBe(CMB_TEMPERATURE_K);
    expect(cmbTemperatureAtRedshift(2)).toBeCloseTo(8.175, 10);
    expect(cmbPhotonEnergy(1e-3)).toBeGreaterThan(0);
    expect(generateCMBSpectrum(CMB_TEMPERATURE_K, 400)).toHaveLength(200);
  });

  it("calculates density values and provides bounded offline eras", () => {
    expect(criticalDensity(FALLBACK_UNIVERSE.hubbleConstantKmsMpc)).toBeCloseTo(8.53e-27, 28);
    expect(matterDensity(FALLBACK_UNIVERSE.hubbleConstantKmsMpc, FALLBACK_UNIVERSE.matterFraction)).toBeGreaterThan(0);
    expect(FALLBACK_COSMIC_ERAS.length).toBeLessThanOrEqual(10);
  });

  it("models cosmic time and relativity deterministically", () => {
    const state = createCosmicTimeState(4.35e17);
    expect(state.scaleFactor).toBeCloseTo(1, 10);
    expect(state.redshift).toBeCloseTo(0, 10);
    expect(state.temperatureK).toBeCloseTo(CMB_TEMPERATURE_K, 10);
    expect(temperatureFromScaleFactor(0.5)).toBeCloseTo(CMB_TEMPERATURE_K * 2, 10);
    expect(cosmicEraFromTemperature(2.725)).toBe("modern-cold-universe");
    expect(calculateLookbackFraction(1)).toBe(0.5);
    expect(spacetimeInterval(1, COSMOLOGY.speedOfLight, 0, 0)).toBe(0);
    expect(generateLightCone(1, 4)).toEqual([
      { timeSeconds: 0, distanceMeters: 0 },
      { timeSeconds: 1 / 3, distanceMeters: COSMOLOGY.speedOfLight / 3 },
      { timeSeconds: 2 / 3, distanceMeters: COSMOLOGY.speedOfLight * 2 / 3 },
      { timeSeconds: 1, distanceMeters: COSMOLOGY.speedOfLight },
    ]);
    expect(lorentzFactorBeta(0.5)).toBeCloseTo(1.1547, 4);
    expect(relativisticMomentumBeta(1, 0.5)).toBeGreaterThan(0);
    expect(relativisticEnergyBeta(1, 0.5)).toBeGreaterThan(COSMOLOGY.speedOfLight ** 2);
  });

  it("rejects invalid cosmology inputs", () => {
    expect(() => redshiftToScaleFactor(-1)).toThrow();
    expect(() => scaleFactorToRedshift(0)).toThrow();
    expect(() => advanceExpansion({ scaleFactor: 1, redshift: 0, cosmicTimeGyr: 1, expansionRatePerGyr: 0 }, -1, 0.1)).toThrow();
    expect(() => cmbTemperatureAtRedshift(-2)).toThrow();
    expect(() => generateCMBSpectrum(0)).toThrow();
    expect(() => createCosmicTimeState(0)).toThrow();
    expect(() => temperatureFromScaleFactor(0)).toThrow();
    expect(() => calculateLookbackFraction(-1)).toThrow();
    expect(() => spacetimeInterval(Number.NaN, 0, 0, 0)).toThrow();
    expect(() => generateLightCone(1, 1)).not.toThrow();
    expect(() => lorentzFactorBeta(1)).toThrow();
  });
});
