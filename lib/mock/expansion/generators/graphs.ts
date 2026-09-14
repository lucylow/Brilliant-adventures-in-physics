import { sampleProjectile } from "@/lib/physics";
import { roundPhysics } from "../../utils/physics-values";
import type { GraphDataset, GraphPoint, MeasurementSeries, SeriesTrend } from "../types";

function bounds(points: GraphPoint[]): { min: { x: number; y: number }; max: { x: number; y: number } } {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    min: { x: Math.min(...xs), y: Math.min(...ys) },
    max: { x: Math.max(...xs), y: Math.max(...ys) },
  };
}

export function graphFromSeries(id: string, title: string, conceptId: string, x: MeasurementSeries, y: MeasurementSeries, suggestedTrend: SeriesTrend): GraphDataset {
  const count = Math.min(x.values.length, y.values.length);
  const points = Array.from({ length: count }, (_, index) => ({ x: x.times[index] ?? x.values[index], y: y.values[index] }));
  const range = bounds(points);
  return {
    id,
    title,
    conceptId,
    xAxis: { label: x.kind, unit: x.kind === "time" ? "s" : x.unit },
    yAxis: { label: y.kind, unit: y.unit },
    series: [{ id: `${id}-a`, label: title, points }],
    min: range.min,
    max: range.max,
    suggestedTrend,
  };
}

export function createProjectileGraph(): GraphDataset {
  const samples = sampleProjectile({ speed: 18, angleDeg: 40, height: 0 }, 32);
  const points = samples.map((sample) => ({ x: roundPhysics(sample.x), y: roundPhysics(sample.y) }));
  const range = bounds(points);
  return {
    id: "graph-projectile-xy",
    title: "Projectile path (air resistance neglected)",
    conceptId: "projectile-motion",
    xAxis: { label: "horizontal position", unit: "m" },
    yAxis: { label: "height", unit: "m" },
    series: [{ id: "path", label: "trajectory", points }],
    min: range.min,
    max: range.max,
    suggestedTrend: "quadratic",
  };
}

export function createOhmGraph(voltages: number[], resistance = 4): GraphDataset {
  const points = voltages.map((voltage) => ({ x: voltage, y: roundPhysics(voltage / resistance) }));
  const range = bounds(points);
  return {
    id: "graph-ohm-vi",
    title: "Current versus voltage for an ohmic resistor",
    conceptId: "ohms-law",
    xAxis: { label: "voltage", unit: "V" },
    yAxis: { label: "current", unit: "A" },
    series: [{ id: "ohmic", label: `R = ${resistance} Ω`, points }],
    min: range.min,
    max: range.max,
    suggestedTrend: "linear",
  };
}

export function createPvGraph(): GraphDataset {
  const nRT = 101325 * 0.002;
  const volumes = [0.001, 0.0015, 0.002, 0.003, 0.004];
  const points = volumes.map((volume) => ({ x: volume, y: roundPhysics(nRT / volume) }));
  const range = bounds(points);
  return {
    id: "graph-pv",
    title: "Ideal-gas isotherm (n, T fixed)",
    conceptId: "ideal-gas-law",
    xAxis: { label: "volume", unit: "m³" },
    yAxis: { label: "pressure", unit: "Pa" },
    series: [{ id: "isotherm", label: "T fixed", points }],
    min: range.min,
    max: range.max,
    suggestedTrend: "exponential-decay",
  };
}

export function createWavelengthFrequencyGraph(): GraphDataset {
  const speed = 340;
  const frequencies = [170, 340, 510, 680, 850];
  const points = frequencies.map((frequency) => ({ x: frequency, y: roundPhysics(speed / frequency, 4) }));
  const range = bounds(points);
  return {
    id: "graph-lambda-f",
    title: "Wavelength versus frequency at 340 m/s",
    conceptId: "wave-motion",
    xAxis: { label: "frequency", unit: "Hz" },
    yAxis: { label: "wavelength", unit: "m" },
    series: [{ id: "sound", label: "v = 340 m/s", points }],
    min: range.min,
    max: range.max,
    suggestedTrend: "exponential-decay",
  };
}
