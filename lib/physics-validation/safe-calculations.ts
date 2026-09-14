import { PhysicsDomainError, err, ok, type Result } from "../../shared/errors";
import * as physics from "../physics";
import { validAngle, validGravity, validMass, validTime } from "./domain";
import { finiteNumber, nonNegativeNumber, positiveNumber } from "./numbers";

function fromThrowing<T>(operation: () => T, label: string): Result<T, PhysicsDomainError> {
  try {
    return ok(operation());
  } catch (error) {
    const message = error instanceof Error ? error.message : `${label} is invalid`;
    return err(new PhysicsDomainError({
      message,
      userMessage: `Your experiment could not start because ${message}. Check the value and try again.`,
      operation: label,
    }));
  }
}

export function safeProjectile(input: physics.ProjectileInput): Result<physics.ProjectileResult, PhysicsDomainError> {
  const speed = nonNegativeNumber(input.speed, "speed");
  if (!speed.ok) return speed;
  const angle = validAngle(input.angleDeg, "launch angle");
  if (!angle.ok) return angle;
  const height = nonNegativeNumber(input.height, "height");
  if (!height.ok) return height;
  if (input.gravity !== undefined) {
    const gravity = validGravity(input.gravity, "gravity");
    if (!gravity.ok) return gravity;
  }
  return fromThrowing(() => physics.projectile(input), "projectile");
}

export function safeKinematics(x0: number, v0: number, acceleration: number, time: number) {
  const position = finiteNumber(x0, "initial position");
  if (!position.ok) return position;
  const velocity = finiteNumber(v0, "initial velocity");
  if (!velocity.ok) return velocity;
  const accel = finiteNumber(acceleration, "acceleration");
  if (!accel.ok) return accel;
  const duration = finiteNumber(time, "time");
  if (!duration.ok) return duration;
  return fromThrowing(() => physics.kinematics(x0, v0, acceleration, time), "kinematics");
}

export function safeNewtonAcceleration(forces: physics.Vec2[], mass: number) {
  const safeMass = validMass(mass, "mass");
  if (!safeMass.ok) return safeMass;
  for (const force of forces) {
    const x = finiteNumber(force.x, "force.x");
    if (!x.ok) return x;
    const y = finiteNumber(force.y, "force.y");
    if (!y.ok) return y;
  }
  return fromThrowing(() => physics.newtonAcceleration(forces, mass), "newton");
}

export function safeOhmsLaw(voltage: number, resistance: number) {
  const volts = finiteNumber(voltage, "voltage");
  if (!volts.ok) return volts;
  const ohms = positiveNumber(resistance, "resistance");
  if (!ohms.ok) return ohms;
  return fromThrowing(() => physics.ohmsLaw(voltage, resistance), "ohms-law");
}

export function safeWave(frequencyHz: number, wavelengthM: number) {
  const frequency = positiveNumber(frequencyHz, "frequency");
  if (!frequency.ok) return frequency;
  const wavelength = positiveNumber(wavelengthM, "wavelength");
  if (!wavelength.ok) return wavelength;
  return fromThrowing(() => physics.wave({ frequencyHz, wavelengthM }), "wave");
}

export { finiteNumber, nonNegativeNumber, positiveNumber, validMass, validTime };
