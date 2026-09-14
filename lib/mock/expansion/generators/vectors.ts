import { vec } from "@/lib/physics";
import { roundPhysics } from "../../utils/physics-values";
import type { UncertaintyRecord, Vector2, VectorSet } from "../types";

export function percentUncertainty(value: number, absolute: number): number {
  if (value === 0) return 0;
  return roundPhysics((Math.abs(absolute) / Math.abs(value)) * 100, 2);
}

export function createUncertainty(id: string, quantity: string, value: number, unit: string, absolute: number, kind: UncertaintyRecord["kind"], note: string): UncertaintyRecord {
  return {
    id,
    quantity,
    value,
    unit,
    kind,
    uncertainty: absolute,
    percentUncertainty: percentUncertainty(value, absolute),
    instrumentResolution: kind === "resolution" ? absolute : undefined,
    note,
  };
}

export function vectorFromPolar(magnitude: number, angleDeg: number, unit: string, label: string): Vector2 {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    magnitude: roundPhysics(magnitude),
    angleDeg: roundPhysics(angleDeg),
    x: roundPhysics(magnitude * Math.cos(rad)),
    y: roundPhysics(magnitude * Math.sin(rad)),
    unit,
    label,
  };
}

export function addVectors(vectors: Vector2[], unit: string, label: string): Vector2 {
  const sum = vectors.reduce((total, item) => vec.add(total, { x: item.x, y: item.y }), { x: 0, y: 0 });
  const magnitude = roundPhysics(Math.hypot(sum.x, sum.y));
  const angleDeg = roundPhysics((Math.atan2(sum.y, sum.x) * 180) / Math.PI);
  return { magnitude, angleDeg, x: roundPhysics(sum.x), y: roundPhysics(sum.y), unit, label };
}

export function createVectorSet(id: string, title: string, conceptId: string, context: VectorSet["context"], specs: Array<{ magnitude: number; angleDeg: number; label: string }>, unit = "N"): VectorSet {
  const vectors = specs.map((spec) => vectorFromPolar(spec.magnitude, spec.angleDeg, unit, spec.label));
  return {
    id,
    title,
    conceptId,
    vectors,
    resultant: addVectors(vectors, unit, "resultant"),
    context,
  };
}

export function equilibriumResidual(set: VectorSet): number {
  return roundPhysics(set.resultant.magnitude);
}
