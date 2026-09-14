import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";
import type { TrendKind } from "./types";

export type ResidualPoint = { x: number; y: number; residual: number; unitX: string; unitY: string };

export type ResidualDataset = {
  id: string;
  conceptId: string;
  trend: TrendKind;
  modelName: string;
  points: ResidualPoint[];
  outlierKind: "none" | "single" | "multiple" | "systematic-shift";
  comparison: {
    theoretical: string;
    measured: string;
    alternative: string;
    preferred: "theoretical" | "measured" | "flag-conflict";
    reason: string;
  };
};

function series(trend: TrendKind, n: number): Array<{ x: number; y: number }> {
  return Array.from({ length: n }, (_, index) => {
    const x = index + 1;
    if (trend === "linear") return { x, y: 2 * x + 0.1 * (index % 3 - 1) };
    if (trend === "quadratic") return { x, y: 0.4 * x * x };
    if (trend === "inverse") return { x, y: 12 / x };
    if (trend === "exponential") return { x, y: Number((1.4 ** x).toPrecision(4)) };
    if (trend === "oscillatory") return { x, y: Number((Math.sin(x) * 3).toPrecision(4)) };
    if (trend === "piecewise") return { x, y: x < 4 ? x : 8 - x };
    return { x, y: 5 + 0.2 * (index % 2) };
  });
}

function residualOf(trend: TrendKind, x: number, y: number): number {
  const model =
    trend === "linear" ? 2 * x
      : trend === "quadratic" ? 0.4 * x * x
        : trend === "inverse" ? 12 / x
          : trend === "exponential" ? 1.4 ** x
            : trend === "oscillatory" ? Math.sin(x) * 3
              : trend === "piecewise" ? (x < 4 ? x : 8 - x)
                : 5;
  return Number((y - model).toPrecision(4));
}

const TRENDS: TrendKind[] = ["linear", "quadratic", "inverse", "exponential", "oscillatory", "piecewise", "none"];
const OUTLIERS: ResidualDataset["outlierKind"][] = ["none", "single", "multiple", "systematic-shift"];

let cache: ResidualDataset[] | null = null;

export function getResidualDatasets(): ResidualDataset[] {
  if (cache) return cache;
  cache = CATALOG.flatMap((topic, index) => {
    const trend = TRENDS[index % TRENDS.length];
    const outlierKind = OUTLIERS[index % OUTLIERS.length];
    const raw = series(trend, 8);
    const points: ResidualPoint[] = raw.map((point, pointIndex) => {
      let y = point.y;
      if (outlierKind === "single" && pointIndex === 6) y += 4;
      if (outlierKind === "multiple" && (pointIndex === 2 || pointIndex === 5)) y += 3;
      if (outlierKind === "systematic-shift") y += 1.5;
      return {
        x: point.x,
        y: Number(y.toPrecision(4)),
        residual: residualOf(trend, point.x, y),
        unitX: topic.example.known[0]?.unit ?? "s",
        unitY: topic.example.unknown.includes("F") ? "N" : "m",
      };
    });
    return [{
      id: stableId("res", `${topic.id}-${trend}`),
      conceptId: topic.conceptId,
      trend,
      modelName: topic.equation,
      points,
      outlierKind,
      comparison: {
        theoretical: `If ${topic.equation} holds, residuals should scatter about zero inside the stated uncertainty.`,
        measured: `The mock table for ${topic.experiment.name} shows a ${trend} pattern with ${outlierKind} outliers.`,
        alternative: `A neighbouring slogan (${topic.misconception}) would predict a different curvature.`,
        preferred: outlierKind === "systematic-shift" ? "flag-conflict" : "theoretical",
        reason: outlierKind === "systematic-shift"
          ? "Measured offset disagrees with the lesson model. Flag rather than silently picking a slogan."
          : "Prefer the lesson model plus a residual check; do not invent a new force to absorb scatter.",
      },
    }];
  });
  return cache;
}

export function getModelComparisons() {
  return getResidualDatasets().map((item) => ({
    id: `${item.id}-cmp`,
    conceptId: item.conceptId,
    theoretical: item.comparison.theoretical,
    measured: item.comparison.measured,
    alternative: item.comparison.alternative,
    decision: item.comparison.preferred,
    reason: item.comparison.reason,
  }));
}

export function getTrendFixtures() {
  return TRENDS.map((trend, index) => {
    const topic = CATALOG[index % CATALOG.length];
    return {
      id: `trend-${trend}`,
      trend,
      conceptId: topic.conceptId,
      description:
        trend === "none" ? "Scatter with no preferred curve inside the stated uncertainty."
          : `A ${trend} pattern is a candidate only after axis units match ${topic.equation}.`,
    };
  });
}

export function getLoggingAllowlist() {
  return {
    allowed: ["scenarioId", "learnerId", "conceptId", "diagnosticId", "verificationStatus", "requestId"],
    denied: ["authorization", "cookie", "password", "token", "apiKey", "secret", "database", "EXPO_PUBLIC_MANUS"],
    note: "Demo AI diagnostics never log secrets, auth headers, or full sensitive input.",
  };
}

export function redactDiagnosticInput(input: Record<string, unknown>): Record<string, unknown> {
  const denied = new Set(getLoggingAllowlist().denied.map((item) => item.toLowerCase()));
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (denied.has(key.toLowerCase()) || /token|secret|password|authorization/i.test(key)) {
      out[key] = "[redacted]";
      continue;
    }
    out[key] = typeof value === "string" && value.length > 240 ? `${value.slice(0, 240)}…` : value;
  }
  return out;
}
