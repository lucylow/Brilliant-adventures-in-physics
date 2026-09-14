import { describe, expect, it } from "vitest";
import {
  convertQuantity,
  finiteNumber,
  positiveNumber,
  quantity,
  safeOhmsLaw,
  safeProjectile,
  subluminalVelocity,
  validGravity,
  validMass,
  validTemperature,
  validTime,
} from "../lib/physics-validation";

describe("physics domain validation", () => {
  it("rejects NaN, Infinity, and missing values", () => {
    expect(finiteNumber(Number.NaN, "speed").ok).toBe(false);
    expect(finiteNumber(Number.POSITIVE_INFINITY, "speed").ok).toBe(false);
    expect(finiteNumber(Number.NEGATIVE_INFINITY, "speed").ok).toBe(false);
    expect(positiveNumber(0, "mass").ok).toBe(false);
    expect(validMass(-1, "mass").ok).toBe(false);
  });

  it("rejects superluminal speeds and invalid gravity", () => {
    expect(subluminalVelocity(299_792_458, "speed").ok).toBe(false);
    expect(subluminalVelocity(10, "speed").ok).toBe(true);
    expect(validGravity(0, "gravity").ok).toBe(false);
    expect(validGravity(9.8, "gravity").ok).toBe(true);
    expect(validTemperature(-1, "temperature").ok).toBe(false);
    expect(validTime(0, "time").ok).toBe(true);
  });

  it("returns typed projectile errors instead of NaN", () => {
    const invalid = safeProjectile({ speed: Number.NaN, angleDeg: 40, height: 0 });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.error.code).toBe("PHYSICS_DOMAIN");
      expect(Number.isFinite(Number.NaN)).toBe(false);
    }
    const valid = safeProjectile({ speed: 18, angleDeg: 42, height: 0 });
    expect(valid.ok).toBe(true);
    if (valid.ok) expect(valid.data.range).toBeGreaterThan(20);
  });

  it("rejects zero resistance in Ohm's law", () => {
    expect(safeOhmsLaw(12, 0).ok).toBe(false);
    const current = safeOhmsLaw(12, 4);
    expect(current.ok).toBe(true);
    if (current.ok) expect(current.data.current).toBe(3);
  });

  it("rejects dimensional mismatches during unit conversion", () => {
    const meters = quantity(2, "m");
    expect(meters.ok).toBe(true);
    if (meters.ok) {
      expect(convertQuantity(meters.data, "cm").ok).toBe(true);
      expect(convertQuantity(meters.data, "kg").ok).toBe(false);
    }
    expect(quantity(1, "parsec").ok).toBe(false);
  });
});
