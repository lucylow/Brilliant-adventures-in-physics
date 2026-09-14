import { PhysicsDomainError, err, ok, type Result } from "../../shared/errors";

export type PhysicsLabel = string;

function domainError(label: PhysicsLabel, detail: string): PhysicsDomainError {
  return new PhysicsDomainError({
    message: `${label} ${detail}`,
    userMessage: `Your experiment could not start because ${label} ${detail}`,
    operation: "physics-validation",
    safeMetadata: { label },
  });
}

export function finiteNumber(value: unknown, label: PhysicsLabel): Result<number, PhysicsDomainError> {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    return err(domainError(label, "must be a finite number. Check the value and try again."));
  }
  return ok(value);
}

export function positiveNumber(value: unknown, label: PhysicsLabel): Result<number, PhysicsDomainError> {
  const finite = finiteNumber(value, label);
  if (!finite.ok) return finite;
  if (finite.data <= 0) return err(domainError(label, "must be greater than zero. Check the value and try again."));
  return finite;
}

export function nonNegativeNumber(value: unknown, label: PhysicsLabel): Result<number, PhysicsDomainError> {
  const finite = finiteNumber(value, label);
  if (!finite.ok) return finite;
  if (finite.data < 0) return err(domainError(label, "cannot be negative. Check the value and try again."));
  return finite;
}

export function rejectNonFinite(value: unknown, label: PhysicsLabel): Result<number, PhysicsDomainError> {
  if (value === undefined || value === null) return err(domainError(label, "is missing. Check the value and try again."));
  return finiteNumber(value, label);
}

export function nonzeroNumber(value: unknown, label: PhysicsLabel): Result<number, PhysicsDomainError> {
  const finite = finiteNumber(value, label);
  if (!finite.ok) return finite;
  if (finite.data === 0) return err(domainError(label, "cannot be zero because it would divide by zero. Check the value and try again."));
  return finite;
}
