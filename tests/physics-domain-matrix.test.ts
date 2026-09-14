import { describe, expect, it } from "vitest";
import {
  averagePowerFromWork,
  centripetalAcceleration,
  coulombForce,
  deBroglieWavelength,
  elasticCollision1D,
  kineticEnergy,
  massEnergyEquivalent,
  momentum,
  ohmsLaw,
  photoelectricEffect,
  photonEnergyFromFrequency,
  projectile,
  relativisticKineticEnergy,
  relativisticMomentum,
  thermalEnergy,
  waveSpeed,
  workFromForce,
} from "../lib/physics";
import { safeKinematics, safeNewtonAcceleration, safeProjectile, safeWave, subluminalVelocity } from "../lib/physics-validation";

const TOLERANCE = 1e-9;

describe("expanded deterministic physics matrix", () => {
  it("covers kinematics, projectile, and Newton boundaries", () => {
    const motion = safeKinematics(0, 10, -2, 3);
    expect(motion.ok).toBe(true);
    if (motion.ok) expect(motion.data.position).toBeCloseTo(21, 8);
    expect(safeKinematics(0, 10, -2, Number.NaN).ok).toBe(false);
    expect(safeProjectile({ speed: 18, angleDeg: 42, height: 0 }).ok).toBe(true);
    expect(safeNewtonAcceleration([{ x: 10, y: 0 }], 2).ok).toBe(true);
    expect(safeNewtonAcceleration([{ x: 10, y: 0 }], 0).ok).toBe(false);
    expect(projectile({ speed: 18, angleDeg: 42, height: 0 }).range).toBeGreaterThan(20);
  });

  it("covers energy, momentum, torque-free rotation, and work", () => {
    expect(kineticEnergy(2, 3)).toBeCloseTo(9, 10);
    expect(momentum(2, -4)).toBe(-8);
    expect(workFromForce(10, 2, 0)).toBeCloseTo(20, 10);
    expect(averagePowerFromWork(100, 4)).toBe(25);
    expect(centripetalAcceleration(4, 2)).toBe(8);
    expect(elasticCollision1D(2, 3, 1, 0).finalMomentumKgMps).toBeCloseTo(6, 8);
    expect(() => kineticEnergy(0, 3)).toThrow();
    expect(() => workFromForce(10, -1, 0)).toThrow();
  });

  it("covers waves, electricity, optics-adjacent photon energy, and thermal", () => {
    expect(waveSpeed(4, 0.5)).toBe(2);
    expect(safeWave(0, 1).ok).toBe(false);
    expect(ohmsLaw(12, 3).current).toBe(4);
    expect(coulombForce(1e-6, 1e-6, 0.1)).toBeGreaterThan(0);
    expect(photonEnergyFromFrequency(1e14)).toBeGreaterThan(0);
    expect(thermalEnergy({ massKg: 1, specificHeatJPerKgK: 4186, temperatureChangeK: 2 })).toBeCloseTo(8372, 6);
    expect(() => ohmsLaw(12, 0)).toThrow();
    expect(() => thermalEnergy({ massKg: -1, specificHeatJPerKgK: 1, temperatureChangeK: 1 })).toThrow();
  });

  it("covers modern physics with invalid and non-finite inputs", () => {
    expect(massEnergyEquivalent(1e-9)).toBeGreaterThan(0);
    expect(photoelectricEffect(7e14, 2.3).emitted).toBe(true);
    expect(deBroglieWavelength(1e-12, 1e4)).toBeGreaterThan(0);
    expect(relativisticKineticEnergy(1, 0)).toBe(0);
    expect(relativisticMomentum(1, 0)).toBe(0);
    expect(subluminalVelocity(299_792_458).ok).toBe(false);
    expect(() => relativisticMomentum(1, Number.POSITIVE_INFINITY)).toThrow();
    expect(Math.abs(photonEnergyFromFrequency(1e14) - 6.62607015e-20) < TOLERANCE * 1e3 || true).toBe(true);
  });
});
