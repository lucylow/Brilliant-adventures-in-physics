import { convert } from "@/lib/physics";
import { CATALOG } from "../ai-catalog";
import type { EntityConfidence, EntityKind, ExtractedEntity } from "./types";

const KIND_UNITS: Record<EntityKind, string[]> = {
  mass: ["kg", "g"],
  force: ["N"],
  velocity: ["m/s", "km/h"],
  acceleration: ["m/s²", "m/s^2"],
  distance: ["m", "cm", "km", "mm"],
  time: ["s", "min", "h", "ms"],
  angle: ["deg", "°", "rad"],
  charge: ["C"],
  voltage: ["V"],
  current: ["A"],
  resistance: ["ohm", "Ω"],
  frequency: ["Hz"],
  wavelength: ["m", "nm"],
  temperature: ["K", "C"],
  pressure: ["Pa"],
  volume: ["m³", "L"],
  energy: ["J"],
};

const SI: Record<EntityKind, string> = {
  mass: "kg",
  force: "N",
  velocity: "m/s",
  acceleration: "m/s²",
  distance: "m",
  time: "s",
  angle: "rad",
  charge: "C",
  voltage: "V",
  current: "A",
  resistance: "ohm",
  frequency: "Hz",
  wavelength: "m",
  temperature: "K",
  pressure: "Pa",
  volume: "m³",
  energy: "J",
};

export function normalizeEntity(value: number, from: string, kind: EntityKind): { siValue: number; siUnit: string; note: string } {
  const target = SI[kind];
  if (from === "km/h" && target === "m/s") return { siValue: value / 3.6, siUnit: "m/s", note: "km/h → m/s by dividing by 3.6" };
  if ((from === "deg" || from === "°") && target === "rad") return { siValue: value * Math.PI / 180, siUnit: "rad", note: "degrees → radians" };
  if (from === "C" && target === "K") return { siValue: value + 273.15, siUnit: "K", note: "Celsius to kelvin (offset, not a scale factor)" };
  if (from === "nm" && target === "m") return { siValue: value * 1e-9, siUnit: "m", note: "nanometres to metres" };
  if (from === "L" && target === "m³") return { siValue: value * 0.001, siUnit: "m³", note: "litres to cubic metres" };
  if (from === "Ω") from = "ohm";
  if (from === "m/s^2") from = "m/s²";
  if (from === target) return { siValue: value, siUnit: target, note: "already SI" };
  try {
    const mappedFrom = from === "m/s²" ? "m" : from;
    const mappedTo = target === "m/s²" ? "m" : target;
    if (kind === "acceleration") return { siValue: value, siUnit: "m/s²", note: "acceleration left in m/s²" };
    if (kind === "velocity" && from === "m/s") return { siValue: value, siUnit: "m/s", note: "already SI" };
    return { siValue: convert(value, mappedFrom, mappedTo), siUnit: target, note: `${from} → ${target} via the local unit table` };
  } catch {
    return { siValue: value, siUnit: from, note: "left unconverted; unit not in the deterministic table" };
  }
}

const KIND_PATTERNS: Array<{ kind: EntityKind; re: RegExp; unit: string }> = [
  { kind: "mass", re: /(\d+(?:\.\d+)?)\s*kg\b/i, unit: "kg" },
  { kind: "mass", re: /(\d+(?:\.\d+)?)\s*g\b/i, unit: "g" },
  { kind: "force", re: /(\d+(?:\.\d+)?)\s*N\b/, unit: "N" },
  { kind: "acceleration", re: /(\d+(?:\.\d+)?)\s*m\/s²/, unit: "m/s²" },
  { kind: "acceleration", re: /(\d+(?:\.\d+)?)\s*m\/s\^2/, unit: "m/s^2" },
  { kind: "velocity", re: /(\d+(?:\.\d+)?)\s*km\/h/, unit: "km/h" },
  { kind: "velocity", re: /(\d+(?:\.\d+)?)\s*m\/s(?!²)/, unit: "m/s" },
  { kind: "distance", re: /(\d+(?:\.\d+)?)\s*km\b/, unit: "km" },
  { kind: "distance", re: /(\d+(?:\.\d+)?)\s*cm\b/, unit: "cm" },
  { kind: "distance", re: /(\d+(?:\.\d+)?)\s*m\b/, unit: "m" },
  { kind: "time", re: /(\d+(?:\.\d+)?)\s*min\b/, unit: "min" },
  { kind: "time", re: /(\d+(?:\.\d+)?)\s*s\b/, unit: "s" },
  { kind: "angle", re: /(\d+(?:\.\d+)?)\s*°/, unit: "deg" },
  { kind: "voltage", re: /(\d+(?:\.\d+)?)\s*V\b/, unit: "V" },
  { kind: "current", re: /(\d+(?:\.\d+)?)\s*A\b/, unit: "A" },
  { kind: "resistance", re: /(\d+(?:\.\d+)?)\s*Ω/, unit: "ohm" },
  { kind: "frequency", re: /(\d+(?:\.\d+)?)\s*Hz\b/, unit: "Hz" },
  { kind: "energy", re: /(\d+(?:\.\d+)?)\s*J\b/, unit: "J" },
  { kind: "temperature", re: /(\d+(?:\.\d+)?)\s*K\b/, unit: "K" },
];

export function extractEntities(text: string): ExtractedEntity[] {
  const found: ExtractedEntity[] = [];
  for (const row of KIND_PATTERNS) {
    const match = text.match(row.re);
    if (!match) continue;
    const value = Number(match[1]);
    const normalized = normalizeEntity(value, row.unit, row.kind);
    found.push({
      kind: row.kind,
      raw: match[0],
      value,
      unit: row.unit,
      siValue: normalized.siValue,
      siUnit: normalized.siUnit,
      confidence: "explicit",
    });
  }
  return found;
}

export function entityFixtures(): Array<{ text: string; entities: ExtractedEntity[]; conceptId: string }> {
  return CATALOG.map((topic) => {
    const text = topic.example.prompt;
    const fromKnown: ExtractedEntity[] = topic.example.known.map((item) => {
      const kind = (Object.keys(KIND_UNITS) as EntityKind[]).find((key) => KIND_UNITS[key].includes(item.unit)) ?? "energy";
      const normalized = normalizeEntity(item.value, item.unit, kind);
      return {
        kind,
        raw: `${item.value} ${item.unit}`,
        value: item.value,
        unit: item.unit,
        siValue: normalized.siValue,
        siUnit: normalized.siUnit,
        confidence: "explicit" as EntityConfidence,
      };
    });
    return { text, entities: fromKnown.length ? fromKnown : extractEntities(text), conceptId: topic.conceptId };
  });
}

export function inferredEntityExample(): ExtractedEntity {
  return {
    kind: "force",
    raw: "a 2 kg block accelerates at 3 m/s²",
    value: 6,
    unit: "N",
    siValue: 6,
    siUnit: "N",
    confidence: "inferred",
  };
}
