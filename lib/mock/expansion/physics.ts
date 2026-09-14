import { ohmsLaw, PHYSICS, projectile, refraction, springForce, wave } from "@/lib/physics";
import { pendulumPeriod as periodFromLength, roundPhysics } from "../utils/physics-values";

export function pendulumTrials(lengthM: number, trials = 5): Array<{ trial: number; lengthM: number; predictedS: number; measuredS: number; uncertaintyS: number }> {
  const predicted = roundPhysics(2 * Math.PI * Math.sqrt(lengthM / PHYSICS.g), 4);
  return Array.from({ length: trials }, (_, index) => ({
    trial: index + 1,
    lengthM,
    predictedS: predicted,
    measuredS: roundPhysics(predicted + (index - 2) * 0.004, 4),
    uncertaintyS: 0.01,
  }));
}

export function springHooke(k: number, extensionsM: number[]): Array<{ extension: number; force: number; k: number }> {
  return extensionsM.map((extension) => ({
    extension,
    force: roundPhysics(-springForce(k, extension)),
    k,
  }));
}

export function ohmTable(resistances: number[], voltage = 12): Array<{ voltage: number; resistance: number; current: number; power: number }> {
  return resistances.map((resistance) => {
    const result = ohmsLaw(voltage, resistance);
    return { voltage, resistance, current: roundPhysics(result.current), power: roundPhysics(result.power) };
  });
}

export function rcCharge(voltage: number, resistance: number, capacitance: number, times: number[]): Array<{ t: number; qOverQmax: number; v: number }> {
  const tau = resistance * capacitance;
  return times.map((t) => {
    const fraction = 1 - Math.exp(-t / tau);
    return { t, qOverQmax: roundPhysics(fraction, 4), v: roundPhysics(voltage * fraction, 4) };
  });
}

export function lensPair(focalM: number, objectDistances: number[]): Array<{ do: number; di: number; f: number; m: number }> {
  return objectDistances.map((objectDistance) => {
    const di = 1 / (1 / focalM - 1 / objectDistance);
    return { do: objectDistance, di: roundPhysics(di, 4), f: focalM, m: roundPhysics(-di / objectDistance, 4) };
  });
}

export function snellRow(n1: number, n2: number, incidentDeg: number) {
  const result = refraction({ incidentAngleDeg: incidentDeg, refractiveIndexFrom: n1, refractiveIndexTo: n2 });
  return { n1, n2, incidentDeg, refractedDeg: result.refractedAngleDeg === null ? null : roundPhysics(result.refractedAngleDeg, 2), critical: result.totalInternalReflection };
}

export function hydrogenTransition(nInitial: number, nFinal: number) {
  const rydberg = 13.6;
  const energyEv = rydberg * (1 / nFinal ** 2 - 1 / nInitial ** 2);
  const energyJ = energyEv * PHYSICS.elementaryCharge;
  const frequency = energyJ / PHYSICS.h;
  const wavelength = PHYSICS.c / frequency;
  return {
    energyEv: roundPhysics(energyEv, 4),
    frequencyHz: frequency,
    wavelengthM: wavelength,
    wavelengthNm: roundPhysics(wavelength * 1e9, 2),
  };
}

export function gammaFromBeta(beta: number): number {
  if (beta < 0 || beta >= 1) throw new Error("beta must satisfy 0 ≤ v/c < 1");
  return roundPhysics(1 / Math.sqrt(1 - beta * beta), 6);
}

export function decayRemaining(halfLives: number): number {
  return roundPhysics(Math.pow(0.5, halfLives), 6);
}

export function projectileRow(speed: number, angleDeg: number, height = 0) {
  const result = projectile({ speed, angleDeg, height });
  return {
    speed,
    angleDeg,
    range: roundPhysics(result.range),
    peak: roundPhysics(result.peakHeight),
    time: roundPhysics(result.flightTime, 3),
  };
}

export function waveRow(frequencyHz: number, wavelengthM: number) {
  const result = wave({ frequencyHz, wavelengthM });
  return { frequencyHz, wavelengthM, speed: roundPhysics(result.speedMps), period: roundPhysics(result.periodS, 4) };
}

export { periodFromLength };
