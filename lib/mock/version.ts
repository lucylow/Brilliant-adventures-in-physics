/** Schema version for persisted mock datasets. Bump when fixture shapes change. */
export const MOCK_DATA_VERSION = "1.1.0" as const;

export const MOCK_STORAGE_KEYS = {
  datasetVersion: "physicaai.mock.version.v1",
  scenario: "physicaai.mock.scenario.v1",
  learnerId: "physicaai.mock.learner.v1",
  runtime: "physicaai.mock.runtime.v1",
  analytics: "physicaai.mock.analytics.v1",
} as const;
