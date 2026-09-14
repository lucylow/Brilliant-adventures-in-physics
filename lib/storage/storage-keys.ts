export const CURRENT_SCHEMA_VERSION = 1 as const;

export type SchemaVersion = typeof CURRENT_SCHEMA_VERSION;

export const STORAGE_KEYS = {
  preferences: "physicaai.preferences.v1",
  onboarding: "physicaai.onboarding.v1",
  learning: "physicaai.learning.v2",
  drafts: "physicaai.drafts.v1",
  experiments: "physicaai.experiments.v1",
  notebook: "physicaai.notebook.v1",
  usage: "physicaai.usage.v1",
  retryQueue: "physicaai.autosave.queue.v1",
  lastSave: "physicaai.autosave.last-save.v1",
  syncHistory: "physicaai.autosave.sync-history.v1",
  privacyActivity: "physicaai.privacy-activity.v1",
  adventure: "physicaai.adventure.v1",
  puzzleEvidence: "physicaai.puzzle-evidence.v1",
  puzzleResolved: "physicaai.puzzle-evidence-resolved.v1",
  reviewMastery: "physicaai.review-mastery.v1",
  astronomyCatalog: "physicaai.astronomy-catalog.v1",
  quantumCatalog: "physicaai.quantum-catalog.v1",
  bavAcknowledgements: "physicaai.bav-milestone-acknowledgements.v1",
  quarantine: "physicaai.quarantine.v1",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const OWNED_STORAGE_KEYS = Object.values(STORAGE_KEYS);
