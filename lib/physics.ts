export type Vec2 = { x: number; y: number };
export type PhysicsStatus = "ok" | "invalid";

export type Quantity = {
  value: number;
  unit: string;
};

export const PHYSICS = {
  g: 9.80665,
  k: 8.9875517923e9,
  c: 299_792_458,
  h: 6.62607015e-34,
  elementaryCharge: 1.602176634e-19,
} as const;

const UNIT_SCALE: Record<string, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  km: 1000,
  s: 1,
  ms: 0.001,
  min: 60,
  h: 3600,
  kg: 1,
  g: 0.001,
  N: 1,
  J: 1,
  W: 1,
  V: 1,
  A: 1,
  ohm: 1,
};

export function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
  return value;
}

export function convert(value: number, from: string, to: string): number {
  const source = UNIT_SCALE[from];
  const target = UNIT_SCALE[to];
  if (source === undefined || target === undefined) throw new Error("Unsupported unit");
  return finite(value, "value") * source / target;
}

export const vec = {
  add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),
  scale: (a: Vec2, factor: number): Vec2 => ({ x: a.x * factor, y: a.y * factor }),
  magnitude: (a: Vec2): number => Math.hypot(a.x, a.y),
};

export type ProjectileInput = {
  speed: number;
  angleDeg: number;
  height: number;
  gravity?: number;
};

export type ProjectileResult = {
  horizontalSpeed: number;
  verticalSpeed: number;
  flightTime: number;
  range: number;
  peakHeight: number;
};

export function projectile(input: ProjectileInput): ProjectileResult {
  const speed = finite(input.speed, "speed");
  const angle = finite(input.angleDeg, "angleDeg") * Math.PI / 180;
  const height = finite(input.height, "height");
  const gravity = input.gravity ?? PHYSICS.g;
  if (speed < 0 || height < 0 || gravity <= 0) throw new Error("Projectile values are invalid");
  const horizontalSpeed = speed * Math.cos(angle);
  const verticalSpeed = speed * Math.sin(angle);
  const discriminant = verticalSpeed ** 2 + 2 * gravity * height;
  const flightTime = (verticalSpeed + Math.sqrt(Math.max(0, discriminant))) / gravity;
  return {
    horizontalSpeed,
    verticalSpeed,
    flightTime,
    range: horizontalSpeed * flightTime,
    peakHeight: height + verticalSpeed ** 2 / (2 * gravity),
  };
}

export function sampleProjectile(input: ProjectileInput, count = 48): Array<{ x: number; y: number; t: number }> {
  const result = projectile(input);
  const safeCount = Math.max(2, Math.floor(count));
  return Array.from({ length: safeCount }, (_, index) => {
    const t = result.flightTime * index / (safeCount - 1);
    return {
      t,
      x: result.horizontalSpeed * t,
      y: Math.max(0, input.height + result.verticalSpeed * t - 0.5 * (input.gravity ?? PHYSICS.g) * t ** 2),
    };
  });
}

export function kinematics(x0: number, v0: number, acceleration: number, time: number) {
  finite(x0, "x0");
  finite(v0, "v0");
  finite(acceleration, "acceleration");
  finite(time, "time");
  return {
    position: x0 + v0 * time + 0.5 * acceleration * time ** 2,
    velocity: v0 + acceleration * time,
  };
}

export function newtonAcceleration(forces: Vec2[], mass: number): Vec2 {
  if (!Number.isFinite(mass) || mass <= 0) throw new Error("Mass must be positive");
  const net = forces.reduce((total, force) => vec.add(total, force), { x: 0, y: 0 });
  return vec.scale(net, 1 / mass);
}

export type WaveInput = {
  frequencyHz: number;
  wavelengthM: number;
};

export type WaveResult = {
  speedMps: number;
  frequencyHz: number;
  wavelengthM: number;
  periodS: number;
};

function positive(value: number, label: string): number {
  finite(value, label);
  if (value <= 0) throw new Error(`${label} must be positive`);
  return value;
}

export function waveSpeed(frequencyHz: number, wavelengthM: number): number {
  return positive(frequencyHz, "frequencyHz") * positive(wavelengthM, "wavelengthM");
}

export function waveFrequency(speedMps: number, wavelengthM: number): number {
  return positive(speedMps, "speedMps") / positive(wavelengthM, "wavelengthM");
}

export function wavePeriod(frequencyHz: number): number {
  return 1 / positive(frequencyHz, "frequencyHz");
}

export function photonEnergyFromFrequency(frequencyHz: number): number {
  return PHYSICS.h * positive(frequencyHz, "frequencyHz");
}

export function photonEnergyFromWavelength(wavelengthM: number): number {
  return PHYSICS.h * PHYSICS.c / positive(wavelengthM, "wavelengthM");
}

export function massEnergyEquivalent(massKg: number): number {
  return positive(massKg, "massKg") * PHYSICS.c ** 2;
}

export type PhotoelectricResult = {
  photonEnergyJ: number;
  workFunctionJ: number;
  thresholdFrequencyHz: number;
  maximumKineticEnergyJ: number;
  emitted: boolean;
};

export function photoelectricEffect(frequencyHz: number, workFunctionEv: number): PhotoelectricResult {
  const frequency = positive(frequencyHz, "frequencyHz");
  const workFunctionEvSafe = positive(workFunctionEv, "workFunctionEv");
  const workFunctionJ = workFunctionEvSafe * PHYSICS.elementaryCharge;
  const photonEnergyJ = photonEnergyFromFrequency(frequency);
  return {
    photonEnergyJ,
    workFunctionJ,
    thresholdFrequencyHz: workFunctionJ / PHYSICS.h,
    maximumKineticEnergyJ: Math.max(0, photonEnergyJ - workFunctionJ),
    emitted: photonEnergyJ >= workFunctionJ,
  };
}

export function deBroglieWavelength(massKg: number, speedMps: number): number {
  return PHYSICS.h / (positive(massKg, "massKg") * positive(speedMps, "speedMps"));
}

export function relativisticKineticEnergy(massKg: number, speedMps: number): number {
  const mass = positive(massKg, "massKg");
  const speed = finite(speedMps, "speedMps");
  if (speed < 0 || speed >= PHYSICS.c) throw new Error("speedMps must be between zero and the speed of light");
  if (speed === 0) return 0;
  const beta = speed / PHYSICS.c;
  const gamma = 1 / Math.sqrt(1 - beta ** 2);
  return mass * PHYSICS.c ** 2 * (gamma - 1);
}

export function relativisticMomentum(massKg: number, speedMps: number): number {
  const mass = positive(massKg, "massKg");
  const speed = finite(speedMps, "speedMps");
  if (speed < 0 || speed >= PHYSICS.c) throw new Error("speedMps must be between zero and the speed of light");
  if (speed === 0) return 0;
  const beta = speed / PHYSICS.c;
  return mass * speed / Math.sqrt(1 - beta ** 2);
}

export type ElasticCollisionResult = {
  finalVelocity1Mps: number;
  finalVelocity2Mps: number;
  initialMomentumKgMps: number;
  finalMomentumKgMps: number;
};

export function solidDiskMomentOfInertia(massKg: number, radiusM: number): number {
  return 0.5 * positive(massKg, "massKg") * positive(radiusM, "radiusM") ** 2;
}

export function rotationalKineticEnergy(momentOfInertiaKgM2: number, angularSpeedRadS: number): number {
  return 0.5 * positive(momentOfInertiaKgM2, "momentOfInertiaKgM2") * finite(angularSpeedRadS, "angularSpeedRadS") ** 2;
}

export function weightForce(massKg: number, gravity: number = PHYSICS.g): number {
  return positive(massKg, "massKg") * positive(gravity, "gravity");
}

export function gravitationalPotentialEnergy(massKg: number, heightM: number, gravity: number = PHYSICS.g): number {
  return positive(massKg, "massKg") * finite(heightM, "heightM") * positive(gravity, "gravity");
}

export function springForce(springConstantNPerM: number, displacementM: number): number {
  return -positive(springConstantNPerM, "springConstantNPerM") * finite(displacementM, "displacementM");
}

export function elasticPotentialEnergy(springConstantNPerM: number, displacementM: number): number {
  return 0.5 * positive(springConstantNPerM, "springConstantNPerM") * finite(displacementM, "displacementM") ** 2;
}

export function workFromForce(forceN: number, displacementM: number, angleDeg = 0): number {
  const force = finite(forceN, "forceN");
  const displacement = positive(displacementM, "displacementM");
  const angle = finite(angleDeg, "angleDeg");
  if (angle < 0 || angle > 180) throw new Error("angleDeg must be in the range [0, 180]");
  return force * displacement * Math.cos(angle * Math.PI / 180);
}

export function averagePowerFromWork(workJ: number, durationS: number): number {
  return finite(workJ, "workJ") / positive(durationS, "durationS");
}

export function elasticCollision1D(mass1Kg: number, velocity1Mps: number, mass2Kg: number, velocity2Mps: number): ElasticCollisionResult {
  const m1 = positive(mass1Kg, "mass1Kg");
  const m2 = positive(mass2Kg, "mass2Kg");
  const u1 = finite(velocity1Mps, "velocity1Mps");
  const u2 = finite(velocity2Mps, "velocity2Mps");
  const totalMass = m1 + m2;
  const finalVelocity1Mps = ((m1 - m2) * u1 + 2 * m2 * u2) / totalMass;
  const finalVelocity2Mps = (2 * m1 * u1 + (m2 - m1) * u2) / totalMass;
  return {
    finalVelocity1Mps,
    finalVelocity2Mps,
    initialMomentumKgMps: m1 * u1 + m2 * u2,
    finalMomentumKgMps: m1 * finalVelocity1Mps + m2 * finalVelocity2Mps,
  };
}

export function harmonicDisplacement(amplitudeM: number, frequencyHz: number, timeS: number, phaseRad = 0): number {
  const amplitude = positive(amplitudeM, "amplitudeM");
  const frequency = positive(frequencyHz, "frequencyHz");
  const time = finite(timeS, "timeS");
  const phase = finite(phaseRad, "phaseRad");
  return amplitude * Math.cos(2 * Math.PI * frequency * time + phase);
}

export function harmonicVelocity(amplitudeM: number, frequencyHz: number, timeS: number, phaseRad = 0): number {
  const amplitude = positive(amplitudeM, "amplitudeM");
  const frequency = positive(frequencyHz, "frequencyHz");
  const time = finite(timeS, "timeS");
  const phase = finite(phaseRad, "phaseRad");
  const angularFrequency = 2 * Math.PI * frequency;
  return -amplitude * angularFrequency * Math.sin(angularFrequency * time + phase);
}

export function wave(input: WaveInput): WaveResult {
  const frequencyHz = positive(input.frequencyHz, "frequencyHz");
  const wavelengthM = positive(input.wavelengthM, "wavelengthM");
  return { speedMps: frequencyHz * wavelengthM, frequencyHz, wavelengthM, periodS: 1 / frequencyHz };
}

export type RefractionInput = {
  incidentAngleDeg: number;
  refractiveIndexFrom: number;
  refractiveIndexTo: number;
};

export type RefractionResult = {
  incidentAngleDeg: number;
  refractedAngleDeg: number | null;
  refractiveIndexFrom: number;
  refractiveIndexTo: number;
  totalInternalReflection: boolean;
  criticalAngleDeg: number | null;
};

function angleInRange(angleDeg: number, label: string): number {
  finite(angleDeg, label);
  if (angleDeg < 0 || angleDeg >= 90) throw new Error(`${label} must be in the range [0, 90)`);
  return angleDeg;
}

export function criticalAngleDeg(refractiveIndexFrom: number, refractiveIndexTo: number): number | null {
  const from = positive(refractiveIndexFrom, "refractiveIndexFrom");
  const to = positive(refractiveIndexTo, "refractiveIndexTo");
  if (from <= to) return null;
  return Math.asin(to / from) * 180 / Math.PI;
}

export function refraction(input: RefractionInput): RefractionResult {
  const incidentAngleDeg = angleInRange(input.incidentAngleDeg, "incidentAngleDeg");
  const from = positive(input.refractiveIndexFrom, "refractiveIndexFrom");
  const to = positive(input.refractiveIndexTo, "refractiveIndexTo");
  const incidentRadians = incidentAngleDeg * Math.PI / 180;
  const sineRefracted = from / to * Math.sin(incidentRadians);
  const totalInternalReflection = sineRefracted > 1;
  return {
    incidentAngleDeg,
    refractedAngleDeg: totalInternalReflection ? null : Math.asin(Math.min(1, sineRefracted)) * 180 / Math.PI,
    refractiveIndexFrom: from,
    refractiveIndexTo: to,
    totalInternalReflection,
    criticalAngleDeg: criticalAngleDeg(from, to),
  };
}

export function angularSpeedFromRpm(revolutionsPerMinute: number): number {
  return finite(revolutionsPerMinute, "revolutionsPerMinute") * 2 * Math.PI / 60;
}

export function tangentialSpeed(angularSpeedRadS: number, radiusM: number): number {
  return finite(angularSpeedRadS, "angularSpeedRadS") * positive(radiusM, "radiusM");
}

export function centripetalAcceleration(speedMps: number, radiusM: number): number {
  return finite(speedMps, "speedMps") ** 2 / positive(radiusM, "radiusM");
}

export function kineticEnergy(massKg: number, velocityMps: number): number {
  return 0.5 * positive(massKg, "massKg") * finite(velocityMps, "velocityMps") ** 2;
}

export function momentum(massKg: number, velocityMps: number): number {
  return positive(massKg, "massKg") * finite(velocityMps, "velocityMps");
}

export function impulse(forceN: number, durationS: number): number {
  return finite(forceN, "forceN") * positive(durationS, "durationS");
}

export function velocityChangeFromImpulse(impulseNs: number, massKg: number): number {
  return finite(impulseNs, "impulseNs") / positive(massKg, "massKg");
}

export type ThermalInput = {
  massKg: number;
  specificHeatJPerKgK: number;
  temperatureChangeK: number;
};

export function thermalEnergy(input: ThermalInput): number {
  return positive(input.massKg, "massKg") * positive(input.specificHeatJPerKgK, "specificHeatJPerKgK") * finite(input.temperatureChangeK, "temperatureChangeK");
}

export function temperatureChangeFromEnergy(energyJ: number, massKg: number, specificHeatJPerKgK: number): number {
  return finite(energyJ, "energyJ") / (positive(massKg, "massKg") * positive(specificHeatJPerKgK, "specificHeatJPerKgK"));
}

export function hydrostaticPressure(densityKgM3: number, depthM: number, gravity = PHYSICS.g): number {
  return positive(densityKgM3, "densityKgM3") * positive(depthM, "depthM") * positive(gravity, "gravity");
}

export function buoyantForce(fluidDensityKgM3: number, displacedVolumeM3: number, gravity = PHYSICS.g): number {
  return positive(fluidDensityKgM3, "fluidDensityKgM3") * positive(displacedVolumeM3, "displacedVolumeM3") * positive(gravity, "gravity");
}

export function volumetricFlowRate(areaM2: number, speedMps: number): number {
  return positive(areaM2, "areaM2") * finite(speedMps, "speedMps");
}

export function coulombForce(charge1C: number, charge2C: number, distanceM: number): number {
  return PHYSICS.k * finite(charge1C, "charge1C") * finite(charge2C, "charge2C") / positive(distanceM, "distanceM") ** 2;
}

export function electricField(chargeC: number, distanceM: number): number {
  return PHYSICS.k * finite(chargeC, "chargeC") / positive(distanceM, "distanceM") ** 2;
}

export function ohmsLaw(voltage: number, resistance: number) {
  const safeVoltage = finite(voltage, "voltage");
  const safeResistance = positive(resistance, "resistance");
  const current = safeVoltage / safeResistance;
  return { voltage: safeVoltage, resistance: safeResistance, current, power: safeVoltage * current };
}

export function resistanceFromVoltageCurrent(voltage: number, current: number): number {
  const safeVoltage = finite(voltage, "voltage");
  const safeCurrent = finite(current, "current");
  if (safeCurrent === 0) throw new Error("current must be non-zero");
  return safeVoltage / safeCurrent;
}

export function powerFromCurrentResistance(current: number, resistance: number): number {
  return finite(current, "current") ** 2 * positive(resistance, "resistance");
}

export function checkNumericAnswer(actual: number, expected: number, tolerance = 0.02): boolean {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false;
  return Math.abs(actual - expected) <= Math.max(Math.abs(expected) * tolerance, 0.01);
}
