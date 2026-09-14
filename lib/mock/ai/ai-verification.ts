import {
  centripetalAcceleration,
  gravitationalPotentialEnergy,
  impulse,
  kineticEnergy,
  kinematics,
  momentum,
  ohmsLaw,
  projectile,
  thermalEnergy,
  wave,
  workFromForce,
  elasticPotentialEnergy,
} from "@/lib/physics";
import { roundPhysics } from "../utils/physics-values";
import type { CatalogTopic, VerifiedCalcKind } from "./ai-catalog";
import type { VerificationStatus } from "./ai-types";

export type VerifiedQuantity = { name: string; value: number; unit: string; principle: string };

export function runVerifiedCalc(kind: VerifiedCalcKind, inputs: number[]): VerifiedQuantity {
  switch (kind) {
    case "kinematics-v": {
      const [, v0, a, t] = inputs;
      const result = kinematics(inputs[0] ?? 0, v0, a, t);
      return { name: "v", value: roundPhysics(result.velocity), unit: "m/s", principle: "v = v₀ + at" };
    }
    case "projectile-range": {
      const [speed, angle, height] = inputs;
      const result = projectile({ speed, angleDeg: angle, height });
      return { name: "range", value: roundPhysics(result.range), unit: "m", principle: "Independent horizontal/vertical motion" };
    }
    case "kinetic":
      return { name: "K", value: roundPhysics(kineticEnergy(inputs[0], inputs[1])), unit: "J", principle: "K = ½mv²" };
    case "grav-energy":
      return { name: "U_g", value: roundPhysics(gravitationalPotentialEnergy(inputs[0], inputs[1])), unit: "J", principle: "U = mgh" };
    case "ohms-current":
      return { name: "I", value: roundPhysics(ohmsLaw(inputs[0], inputs[1]).current), unit: "A", principle: "I = V/R" };
    case "wave-speed":
      return { name: "v", value: roundPhysics(wave({ frequencyHz: inputs[0], wavelengthM: inputs[1] }).speedMps), unit: "m/s", principle: "v = fλ" };
    case "momentum":
      return { name: "p", value: roundPhysics(momentum(inputs[0], inputs[1])), unit: "kg·m/s", principle: "p = mv" };
    case "thermal":
      return { name: "Q", value: roundPhysics(thermalEnergy({ massKg: inputs[0], specificHeatJPerKgK: inputs[1], temperatureChangeK: inputs[2] })), unit: "J", principle: "Q = mcΔT" };
    case "impulse":
      return { name: "J", value: roundPhysics(impulse(inputs[0], inputs[1])), unit: "N·s", principle: "J = FΔt" };
    case "centripetal":
      return { name: "a_c", value: roundPhysics(centripetalAcceleration(inputs[0], inputs[1])), unit: "m/s²", principle: "a_c = v²/r" };
    case "work":
      return { name: "W", value: roundPhysics(workFromForce(inputs[0], inputs[1], inputs[2] ?? 0)), unit: "J", principle: "W = Fd cos θ" };
    case "spring":
      return { name: "U_s", value: roundPhysics(elasticPotentialEnergy(inputs[0], inputs[1])), unit: "J", principle: "U = ½kx²" };
    default:
      throw new Error(`Unsupported verification kind: ${String(kind)}`);
  }
}

export function verifyTopicCalculation(topic: CatalogTopic): VerifiedQuantity | null {
  if (!topic.verified) return null;
  return runVerifiedCalc(topic.verified.kind, topic.verified.inputs);
}

export function compareNumeric(aiValue: number, expected: number, unit: string, expectedUnit: string): VerificationStatus {
  if (unit !== expectedUnit) return "unit-mismatch";
  if (aiValue === 0 && expected === 0) return "verified";
  if (Math.sign(aiValue) !== Math.sign(expected) && expected !== 0 && aiValue !== 0) return "sign-mismatch";
  const rel = Math.abs(aiValue - expected) / (Math.abs(expected) + 1e-12);
  if (rel <= 1e-9) return "verified";
  if (rel <= 0.015) return "rounding-difference";
  return "mismatch";
}

export function verifyAiNumber(aiValue: number, unit: string, kind: VerifiedCalcKind, inputs: number[]): { expected: VerifiedQuantity; status: VerificationStatus } {
  const expected = runVerifiedCalc(kind, inputs);
  return { expected, status: compareNumeric(aiValue, expected.value, unit, expected.unit) };
}
