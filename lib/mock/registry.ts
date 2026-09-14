import { clone } from "./utils/clone";
import { buildMockDataset } from "./seed";
import { getMockConfig } from "./config";
import type { MockDataset, MockScenarioId } from "./types";

let cached: { key: string; dataset: MockDataset } | null = null;

function cacheKey(scenario: MockScenarioId, learnerId: string): string {
  return `${scenario}::${learnerId}`;
}

export function getMockDataset(scenario?: MockScenarioId, learnerId?: string): MockDataset {
  const config = getMockConfig();
  const resolvedScenario = scenario ?? config.scenario;
  const resolvedLearner = learnerId ?? config.learnerId;
  const key = cacheKey(resolvedScenario, resolvedLearner);
  if (cached?.key === key) return cached.dataset;
  const dataset = buildMockDataset(resolvedScenario, resolvedLearner);
  cached = { key, dataset };
  return dataset;
}

export function peekMockDataset(): MockDataset | null {
  return cached?.dataset ?? null;
}

export function replaceMockDataset(dataset: MockDataset, scenario?: MockScenarioId, learnerId?: string): MockDataset {
  const config = getMockConfig();
  cached = { key: cacheKey(scenario ?? config.scenario, learnerId ?? config.learnerId), dataset: clone(dataset) };
  return cached.dataset;
}

export function invalidateMockDataset(): void {
  cached = null;
}

export function copyMockDataset(): MockDataset {
  return clone(getMockDataset());
}
