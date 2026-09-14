import type { MockDataset } from "../types";
import { buildMockDataset } from "../seed";

export function emptyLessons(): MockDataset["lessons"] { return []; }
export function emptyExperiments(): MockDataset["experiments"] { return []; }
export function emptyNotifications(): MockDataset["notifications"] { return []; }
export function emptyHistory(): MockDataset["activity"] { return []; }
export function emptySearchResults<T>(): T[] { return []; }

export function emptyStateDataset(): MockDataset {
  return buildMockDataset("empty-state");
}

export const malformedFixtures = {
  missingReference: { id: "lesson-orphan", conceptId: "not-a-concept", topicId: "missing-topic" },
  invalidNumber: { finalAnswer: Number.NaN, xpReward: -4 },
  invalidEnum: { difficulty: "legendary" },
  missingField: { prompt: "incomplete" },
  brokenDate: { submittedAt: "not-a-date" },
  corruptSerialized: "{not-json",
} as const;
