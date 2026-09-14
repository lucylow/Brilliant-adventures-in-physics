import { MOCK_DATA_VERSION } from "../version";
import { validateMockDataset, validateMockReferences } from "../validation/dataset";
import type { MockDataset, MockScenarioId } from "../types";
import { diagnoseExpansion, validateRelationshipGraph } from "./diagnostics";

export type MockDataReport = {
  generatedAt: string;
  version: string;
  expansionVersion: "1.1.0" | string;
  scenario: MockScenarioId;
  counts: Record<string, number>;
  validation: {
    dataset: string[];
    references: string[];
    relationships: string[];
    duplicateIds: string[];
    invalidConceptRefs: string[];
  };
  packsLoaded: string[];
  notes: string[];
};

export function generateMockDataReport(dataset: MockDataset, scenario: MockScenarioId): MockDataReport {
  const diagnostic = diagnoseExpansion(dataset);
  return {
    generatedAt: "2026-09-14T16:00:00.000Z",
    version: MOCK_DATA_VERSION,
    expansionVersion: dataset.expansion?.version ?? "missing",
    scenario,
    counts: diagnostic.entityCounts,
    validation: {
      dataset: validateMockDataset(dataset),
      references: validateMockReferences(dataset),
      relationships: validateRelationshipGraph(dataset),
      duplicateIds: diagnostic.duplicateIds,
      invalidConceptRefs: diagnostic.invalidConceptRefs,
    },
    packsLoaded: diagnostic.packsLoaded,
    notes: [
      "MOCK DATA IS A DEVELOPMENT CONTENT LAYER.",
      "Social-proof and leaderboard values are DEMO_AGGREGATE_NOT_PRODUCTION / fictional.",
      "Astro fixtures labeled EDUCATIONAL_FIXTURE are not real discoveries.",
    ],
  };
}
