import { kinematics, harmonicDisplacement, harmonicVelocity } from "@/lib/physics";
import { createSeededRandom } from "../../utils/rng";
import { roundPhysics } from "../../utils/physics-values";
import type { MeasurementSeries, SeriesKind, SeriesTrend } from "../types";

export type SeriesParams = {
  sampleCount?: number;
  sampleInterval?: number;
  noiseLevel?: number;
  trend?: SeriesTrend;
  offset?: number;
  measurementResolution?: number;
  seed: string;
  kind?: SeriesKind;
  unit?: string;
  amplitude?: number;
  slope?: number;
  decay?: number;
};

function quantize(value: number, resolution: number): number {
  if (resolution <= 0) return value;
  return Math.round(value / resolution) * resolution;
}

function trendValue(trend: SeriesTrend, t: number, params: Required<Pick<SeriesParams, "offset" | "amplitude" | "slope" | "decay">>): number {
  switch (trend) {
    case "flat":
      return params.offset;
    case "linear":
      return params.offset + params.slope * t;
    case "quadratic":
      return params.offset + params.slope * t + 0.5 * params.amplitude * t * t;
    case "exponential-decay":
      return params.offset + params.amplitude * Math.exp(-params.decay * t);
    case "oscillating":
      return params.offset + params.amplitude * Math.cos(2 * Math.PI * 0.5 * t);
    case "saturating":
      return params.offset + params.amplitude * (1 - Math.exp(-params.decay * t));
    default:
      return params.offset;
  }
}

export function createTimeSeries(params: SeriesParams): MeasurementSeries {
  return createMeasurementSeries({ ...params, kind: "time", unit: "s", trend: params.trend ?? "linear" });
}

export function createPositionSeries(params: SeriesParams): MeasurementSeries {
  const sampleCount = params.sampleCount ?? 25;
  const dt = params.sampleInterval ?? 0.1;
  const x0 = params.offset ?? 0;
  const v0 = params.slope ?? 2;
  const a = params.amplitude ?? 0.4;
  const times = Array.from({ length: sampleCount }, (_, index) => roundPhysics(index * dt, 4));
  const values = times.map((t) => roundPhysics(kinematics(x0, v0, a, t).position));
  return finalizeSeries({ ...params, kind: "position", unit: "m", trend: "quadratic", sampleCount, sampleInterval: dt }, times, values, "Constant-acceleration kinematics; air resistance neglected.");
}

export function createVelocitySeries(params: SeriesParams): MeasurementSeries {
  const sampleCount = params.sampleCount ?? 25;
  const dt = params.sampleInterval ?? 0.1;
  const v0 = params.offset ?? 1;
  const a = params.slope ?? 0.8;
  const times = Array.from({ length: sampleCount }, (_, index) => roundPhysics(index * dt, 4));
  const values = times.map((t) => roundPhysics(kinematics(0, v0, a, t).velocity));
  return finalizeSeries({ ...params, kind: "velocity", unit: "m/s", trend: "linear", sampleCount, sampleInterval: dt }, times, values, "v = v₀ + at for constant acceleration.");
}

export function createAccelerationSeries(params: SeriesParams): MeasurementSeries {
  return createMeasurementSeries({ ...params, kind: "acceleration", unit: "m/s²", trend: params.trend ?? "flat" });
}

export function createForceSeries(params: SeriesParams): MeasurementSeries {
  return createMeasurementSeries({ ...params, kind: "force", unit: "N", trend: params.trend ?? "linear" });
}

export function createEnergySeries(params: SeriesParams): MeasurementSeries {
  const sampleCount = params.sampleCount ?? 20;
  const dt = params.sampleInterval ?? 0.05;
  const mass = 0.4;
  const k = 80;
  const times = Array.from({ length: sampleCount }, (_, index) => roundPhysics(index * dt, 4));
  const values = times.map((t) => {
    const x = harmonicDisplacement(0.12, 2.25, t);
    const v = harmonicVelocity(0.12, 2.25, t);
    return roundPhysics(0.5 * mass * v * v + 0.5 * k * x * x);
  });
  return finalizeSeries({ ...params, kind: "energy", unit: "J", trend: "oscillating", sampleCount, sampleInterval: dt }, times, values, "Ideal spring–mass: mechanical energy is constant aside from seeded instrument noise.");
}

export function createVoltageSeries(params: SeriesParams): MeasurementSeries {
  return createMeasurementSeries({ ...params, kind: "voltage", unit: "V", trend: params.trend ?? "exponential-decay" });
}

export function createCurrentSeries(params: SeriesParams): MeasurementSeries {
  const voltage = createVoltageSeries(params);
  const r = 4;
  return {
    ...voltage,
    id: `series-current-${params.seed}`,
    kind: "current",
    unit: "A",
    values: voltage.values.map((v) => roundPhysics(v / r)),
    assumption: "Ohmic resistor R = 4 Ω. I = V/R.",
  };
}

export function createMeasurementSeries(params: SeriesParams): MeasurementSeries {
  const sampleCount = Math.min(80, Math.max(4, params.sampleCount ?? 24));
  const dt = params.sampleInterval ?? 0.2;
  const trend = params.trend ?? "linear";
  const kind = params.kind ?? "time";
  const unit = params.unit ?? unitFor(kind);
  const times = Array.from({ length: sampleCount }, (_, index) => roundPhysics(index * dt, 4));
  const model = {
    offset: params.offset ?? 0,
    amplitude: params.amplitude ?? 1,
    slope: params.slope ?? 1,
    decay: params.decay ?? 0.4,
  };
  const values = times.map((t) => roundPhysics(trendValue(trend, t, model)));
  return finalizeSeries({ ...params, kind, unit, trend, sampleCount, sampleInterval: dt }, times, values, assumptionFor(kind, trend));
}

function finalizeSeries(params: SeriesParams & { kind: SeriesKind; unit: string; trend: SeriesTrend; sampleCount: number; sampleInterval: number }, times: number[], modelValues: number[], assumption: string): MeasurementSeries {
  const noiseLevel = params.noiseLevel ?? 0;
  const resolution = params.measurementResolution ?? 0.001;
  const rng = createSeededRandom(`series:${params.seed}:${params.kind}`);
  const values = modelValues.map((value) => {
    const noisy = noiseLevel === 0 ? value : value + (rng.next() - 0.5) * 2 * noiseLevel;
    return roundPhysics(quantize(noisy, resolution), 4);
  });
  return {
    id: `series-${params.kind}-${params.seed}`,
    kind: params.kind,
    unit: params.unit,
    sampleCount: params.sampleCount,
    sampleInterval: params.sampleInterval,
    noiseLevel,
    trend: params.trend,
    offset: params.offset ?? 0,
    measurementResolution: resolution,
    seed: params.seed,
    values,
    times,
    assumption,
  };
}

function unitFor(kind: SeriesKind): string {
  const units: Record<SeriesKind, string> = {
    time: "s",
    position: "m",
    velocity: "m/s",
    acceleration: "m/s²",
    force: "N",
    energy: "J",
    temperature: "K",
    pressure: "Pa",
    voltage: "V",
    current: "A",
    frequency: "Hz",
    wavelength: "m",
    angle: "deg",
  };
  return units[kind];
}

function assumptionFor(kind: SeriesKind, trend: SeriesTrend): string {
  return `Educational ${kind} series with a ${trend} model. Seeded instrument noise only; not a live sensor log.`;
}
