import { describe, expect, it } from "vitest";
import { formatLocalDataSummary, LOCAL_DATA_STORAGE_KEYS } from "../lib/privacy";

describe("privacy controls", () => {
  it("formats a readable local data summary", () => {
    const text = formatLocalDataSummary({ learningRecords: 4, savedQuestions: 2, savedExperiments: 1, activeDrafts: 1 });
    expect(text).toContain("Practice attempts: 4");
    expect(text).toContain("Saved experiments: 1");
  });
  it("owns every local storage key, including offline autosave metadata", () => {
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.autosave.queue.v1");
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.autosave.last-save.v1");
  });
});
