import { describe, expect, it } from "vitest";
import { formatLocalDataSummary } from "../lib/privacy";

describe("privacy controls", () => {
  it("formats a readable local data summary", () => {
    const text = formatLocalDataSummary({ learningRecords: 4, savedQuestions: 2, savedExperiments: 1, activeDrafts: 1 });
    expect(text).toContain("Practice attempts: 4");
    expect(text).toContain("Saved experiments: 1");
  });
});
