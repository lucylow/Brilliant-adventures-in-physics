import {
  centripetalAcceleration,
  elasticPotentialEnergy,
  gravitationalPotentialEnergy,
  impulse,
  kineticEnergy,
  momentum,
  ohmsLaw,
  PHYSICS,
  projectile,
  thermalEnergy,
  wave,
  workFromForce,
} from "@/lib/physics";

export function roundPhysics(value: number, decimals = 3): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function projectileRange(speed: number, angleDeg: number, height = 0): number {
  return roundPhysics(projectile({ speed, angleDeg, height }).range);
}

export function circuitCurrent(voltage: number, resistance: number): number {
  return roundPhysics(ohmsLaw(voltage, resistance).current);
}

export function circuitPower(voltage: number, resistance: number): number {
  return roundPhysics(ohmsLaw(voltage, resistance).power);
}

export function kinetic(mass: number, speed: number): number {
  return roundPhysics(kineticEnergy(mass, speed));
}

export function gravEnergy(mass: number, height: number): number {
  return roundPhysics(gravitationalPotentialEnergy(mass, height));
}

export function springEnergy(k: number, x: number): number {
  return roundPhysics(elasticPotentialEnergy(k, x));
}

export function waveSpeedFrom(frequency: number, wavelength: number): number {
  return roundPhysics(wave({ frequencyHz: frequency, wavelengthM: wavelength }).speedMps);
}

export function pendulumPeriod(lengthM: number, gravity = PHYSICS.g): number {
  return roundPhysics(2 * Math.PI * Math.sqrt(lengthM / gravity));
}

export function centripetal(speed: number, radius: number): number {
  return roundPhysics(centripetalAcceleration(speed, radius));
}

export function workOf(force: number, distance: number, angleDeg = 0): number {
  return roundPhysics(workFromForce(force, distance, angleDeg));
}

export function heatOf(mass: number, c: number, dT: number): number {
  return roundPhysics(thermalEnergy({ massKg: mass, specificHeatJPerKgK: c, temperatureChangeK: dT }));
}

export function momentumOf(mass: number, speed: number): number {
  return roundPhysics(momentum(mass, speed));
}

export function impulseOf(force: number, time: number): number {
  return roundPhysics(impulse(force, time));
}

export function ohmsFrom(voltage: number, resistance: number): { current: number; power: number } {
  const result = ohmsLaw(voltage, resistance);
  return { current: roundPhysics(result.current), power: roundPhysics(result.power) };
}
