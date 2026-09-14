import { PhysicsDomainError, err, ok, type Result } from "../../shared/errors";
import { finiteNumber } from "./numbers";

export type Quantity = {
  value: number;
  unit: string;
  dimension: Dimension;
};

export type Dimension = {
  L: number;
  T: number;
  M: number;
  I: number;
  Theta: number;
};

export const DIMENSIONS = {
  dimensionless: { L: 0, T: 0, M: 0, I: 0, Theta: 0 },
  length: { L: 1, T: 0, M: 0, I: 0, Theta: 0 },
  time: { L: 0, T: 1, M: 0, I: 0, Theta: 0 },
  mass: { L: 0, T: 0, M: 1, I: 0, Theta: 0 },
  velocity: { L: 1, T: -1, M: 0, I: 0, Theta: 0 },
  acceleration: { L: 1, T: -2, M: 0, I: 0, Theta: 0 },
  force: { L: 1, T: -2, M: 1, I: 0, Theta: 0 },
  energy: { L: 2, T: -2, M: 1, I: 0, Theta: 0 },
  power: { L: 2, T: -3, M: 1, I: 0, Theta: 0 },
  charge: { L: 0, T: 1, M: 0, I: 1, Theta: 0 },
  voltage: { L: 2, T: -3, M: 1, I: -1, Theta: 0 },
  resistance: { L: 2, T: -3, M: 1, I: -2, Theta: 0 },
  temperature: { L: 0, T: 0, M: 0, I: 0, Theta: 1 },
  frequency: { L: 0, T: -1, M: 0, I: 0, Theta: 0 },
} as const;

const UNIT_TO_SI: Record<string, { scale: number; dimension: Dimension }> = {
  m: { scale: 1, dimension: DIMENSIONS.length },
  cm: { scale: 0.01, dimension: DIMENSIONS.length },
  mm: { scale: 0.001, dimension: DIMENSIONS.length },
  km: { scale: 1000, dimension: DIMENSIONS.length },
  s: { scale: 1, dimension: DIMENSIONS.time },
  ms: { scale: 0.001, dimension: DIMENSIONS.time },
  min: { scale: 60, dimension: DIMENSIONS.time },
  h: { scale: 3600, dimension: DIMENSIONS.time },
  kg: { scale: 1, dimension: DIMENSIONS.mass },
  g: { scale: 0.001, dimension: DIMENSIONS.mass },
  N: { scale: 1, dimension: DIMENSIONS.force },
  J: { scale: 1, dimension: DIMENSIONS.energy },
  W: { scale: 1, dimension: DIMENSIONS.power },
  V: { scale: 1, dimension: DIMENSIONS.voltage },
  A: { scale: 1, dimension: DIMENSIONS.charge },
  ohm: { scale: 1, dimension: DIMENSIONS.resistance },
  Hz: { scale: 1, dimension: DIMENSIONS.frequency },
  K: { scale: 1, dimension: DIMENSIONS.temperature },
  "m/s": { scale: 1, dimension: DIMENSIONS.velocity },
};

export function sameDimension(a: Dimension, b: Dimension): boolean {
  return a.L === b.L && a.T === b.T && a.M === b.M && a.I === b.I && a.Theta === b.Theta;
}

export function quantity(value: unknown, unit: string): Result<Quantity, PhysicsDomainError> {
  const finite = finiteNumber(value, "quantity");
  if (!finite.ok) return finite;
  const unitInfo = UNIT_TO_SI[unit];
  if (!unitInfo) {
    return err(new PhysicsDomainError({
      message: `Unsupported unit ${unit}`,
      userMessage: `Your experiment could not start because the unit “${unit}” is not supported. Choose a listed unit and try again.`,
      operation: "quantity",
      safeMetadata: { unit },
    }));
  }
  return ok({ value: finite.data, unit, dimension: unitInfo.dimension });
}

export function convertQuantity(input: Quantity, toUnit: string): Result<number, PhysicsDomainError> {
  const from = UNIT_TO_SI[input.unit];
  const to = UNIT_TO_SI[toUnit];
  if (!from || !to) {
    return err(new PhysicsDomainError({
      message: "Unsupported unit conversion",
      operation: "convertQuantity",
      safeMetadata: { from: input.unit, to: toUnit },
    }));
  }
  if (!sameDimension(from.dimension, to.dimension)) {
    return err(new PhysicsDomainError({
      message: "Dimensional mismatch",
      userMessage: `Those units cannot be converted because they measure different physical quantities.`,
      operation: "convertQuantity",
      safeMetadata: { from: input.unit, to: toUnit },
    }));
  }
  return ok(input.value * from.scale / to.scale);
}

export function assertDimension(actual: Dimension, expected: Dimension, label: string): Result<true, PhysicsDomainError> {
  if (sameDimension(actual, expected)) return ok(true);
  return err(new PhysicsDomainError({
    message: `${label} has the wrong physical dimension`,
    userMessage: `${label} uses the wrong units for this calculation. Check the unit and try again.`,
    operation: "assertDimension",
    safeMetadata: { label },
  }));
}
