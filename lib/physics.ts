export type Vec2 = { x: number; y: number };
export type PhysicsStatus = "ok" | "invalid";

export type Quantity = {
  value: number;
  unit: string;
};

export const PHYSICS = {
  g: 9.80665,
  k: 8.9875517923e9,
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

export function ohmsLaw(voltage: number, resistance: number) {
  if (!Number.isFinite(resistance) || resistance <= 0) throw new Error("Resistance must be positive");
  const current = voltage / resistance;
  return { current, power: voltage * current };
}

export function checkNumericAnswer(actual: number, expected: number, tolerance = 0.02): boolean {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) return false;
  return Math.abs(actual - expected) <= Math.max(Math.abs(expected) * tolerance, 0.01);
}
