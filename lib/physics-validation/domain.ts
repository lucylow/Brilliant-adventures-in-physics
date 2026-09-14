import { PhysicsDomainError, err, type Result } from "../../shared/errors";
import { finiteNumber, nonNegativeNumber, nonzeroNumber, positiveNumber } from "./numbers";

const SPEED_OF_LIGHT = 299_792_458;

function rangeError(label: string, detail: string): Result<never, PhysicsDomainError> {
  return err(new PhysicsDomainError({
    message: `${label} ${detail}`,
    userMessage: `Your experiment could not start because ${label} ${detail}`,
    operation: "physics-domain",
    safeMetadata: { label },
  }));
}

export function validAngle(value: unknown, label = "angle"): Result<number, PhysicsDomainError> {
  const finite = finiteNumber(value, label);
  if (!finite.ok) return finite;
  if (finite.data < 0 || finite.data > 360) return rangeError(label, "must be between 0 and 360 degrees.");
  return finite;
}

export function validRadians(value: unknown, label = "angleRadians"): Result<number, PhysicsDomainError> {
  const finite = finiteNumber(value, label);
  if (!finite.ok) return finite;
  if (finite.data < -Math.PI * 2 || finite.data > Math.PI * 2) return rangeError(label, "must be a reasonable angle in radians.");
  return finite;
}

export function validVelocity(value: unknown, label = "velocity"): Result<number, PhysicsDomainError> {
  return finiteNumber(value, label);
}

export function subluminalVelocity(value: unknown, label = "speed"): Result<number, PhysicsDomainError> {
  const finite = finiteNumber(value, label);
  if (!finite.ok) return finite;
  if (finite.data < 0) return rangeError(label, "cannot be negative.");
  if (finite.data >= SPEED_OF_LIGHT) return rangeError(label, "must stay below the speed of light.");
  return finite;
}

export function validMass(value: unknown, label = "mass"): Result<number, PhysicsDomainError> {
  return positiveNumber(value, label);
}

export function validTime(value: unknown, label = "time"): Result<number, PhysicsDomainError> {
  return nonNegativeNumber(value, label);
}

export function validGravity(value: unknown, label = "gravity"): Result<number, PhysicsDomainError> {
  const finite = finiteNumber(value, label);
  if (!finite.ok) return finite;
  if (finite.data <= 0) return rangeError(label, "is missing or not positive. Check the value and try again.");
  if (finite.data > 100) return rangeError(label, "is outside the supported laboratory range.");
  return finite;
}

export function validCharge(value: unknown, label = "charge"): Result<number, PhysicsDomainError> {
  return finiteNumber(value, label);
}

export function validResistance(value: unknown, label = "resistance"): Result<number, PhysicsDomainError> {
  return positiveNumber(value, label);
}

export function validVoltage(value: unknown, label = "voltage"): Result<number, PhysicsDomainError> {
  return finiteNumber(value, label);
}

export function validFrequency(value: unknown, label = "frequency"): Result<number, PhysicsDomainError> {
  return positiveNumber(value, label);
}

export function validWavelength(value: unknown, label = "wavelength"): Result<number, PhysicsDomainError> {
  return positiveNumber(value, label);
}

export function validTemperature(value: unknown, label = "temperature"): Result<number, PhysicsDomainError> {
  const finite = finiteNumber(value, label);
  if (!finite.ok) return finite;
  if (finite.data < 0) return rangeError(label, "cannot be below absolute zero.");
  return finite;
}

export function validCurrent(value: unknown, label = "current"): Result<number, PhysicsDomainError> {
  return nonzeroNumber(value, label);
}

export { SPEED_OF_LIGHT };
