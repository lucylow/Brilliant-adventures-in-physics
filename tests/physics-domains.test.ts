import { describe, expect, it } from "vitest";
import { STANDARD_MODEL_PARTICLES, absorptionProbability, diffusionRmsDistanceM, findParticle, getAntiparticle, isBaryonComposition, isMesonComposition, ohmsLawCurrentA, photonMomentumKgMps, relativisticEnergyJ, relativisticMomentumKgMps, snellsLawAngleRad, thinLensImageDistanceM } from "../lib/physics-domains";

describe("extended physics domains", () => {
  it("provides a bounded local standard-model catalog", () => {
    expect(STANDARD_MODEL_PARTICLES.length).toBeGreaterThan(5);
    expect(findParticle("electron")?.charge).toBe(-1);
    expect(getAntiparticle(findParticle("electron")!).charge).toBe(1);
    expect(isBaryonComposition(["up", "up", "down"])).toBe(true);
    expect(isMesonComposition(["up", "anti-down"])).toBe(true);
  });

  it("computes relativistic and optical quantities with guards", () => {
    expect(relativisticEnergyJ(1, 0)).toBeCloseTo(299792458 ** 2, -10);
    expect(relativisticMomentumKgMps(1, 0)).toBe(0);
    expect(thinLensImageDistanceM(1, 2)).toBe(2);
    expect(snellsLawAngleRad(Math.PI / 6, 1, 1)).toBeCloseTo(Math.PI / 6, 10);
    expect(() => relativisticMomentumKgMps(1, 299792458)).toThrow("below c");
    expect(() => thinLensImageDistanceM(1, 1)).toThrow("focal point");
  });

  it("models light-matter, circuits, and biophysics deterministically", () => {
    expect(photonMomentumKgMps(500e-9)).toBeGreaterThan(0);
    expect(absorptionProbability(1, 0)).toBe(0);
    expect(ohmsLawCurrentA(12, 6)).toBe(2);
    expect(diffusionRmsDistanceM(1e-9, 2)).toBeCloseTo(Math.sqrt(4e-9), 15);
    expect(() => ohmsLawCurrentA(1, 0)).toThrow("greater than zero");
  });
});
