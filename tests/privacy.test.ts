import { beforeEach, describe, expect, it, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildLocalDataShareText, formatLocalDataSummary, getLocalDataSummary, localSummaryFileUri, LOCAL_DATA_STORAGE_KEYS } from "../lib/privacy";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("privacy controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  });

  it("formats a readable local data summary", () => {
    const text = formatLocalDataSummary({ learningRecords: 4, savedQuestions: 2, savedExperiments: 1, activeDrafts: 1, completionEvents: 3, lessonCompletions: 2, labCompletions: 1 });
    expect(text).toContain("Practice attempts: 4");
    expect(text).toContain("Saved experiments: 1");
    expect(text).toContain("Completion events: 3");
    expect(text).toContain("Labs completed: 1");
  });
  it("builds a cleanup-safe temporary summary URI", () => {
    expect(localSummaryFileUri("file:///cache/")).toBe("file:///cache/physicaai-local-summary.txt");
    expect(localSummaryFileUri(null)).toBeNull();
  });

  it("builds a count-only share payload without raw study content", () => {
    const text = buildLocalDataShareText({ learningRecords: 2, savedQuestions: 1, savedExperiments: 1, activeDrafts: 0, completionEvents: 2, lessonCompletions: 1, labCompletions: 1 });
    expect(text).toContain("Completion events: 2");
    expect(text).not.toContain("answer");
    expect(text).not.toContain("kinematics");
  });

  it("summarizes validated completion counts without exposing event content", async () => {
    vi.mocked(AsyncStorage.getItem).mockImplementation(async (key) => {
      if (key === "physicaai.learning.v2") return JSON.stringify({ attempts: 7, savedQuestions: ["q"], completionEvents: [
        { id: "lesson:one", kind: "lesson", contentId: "lesson-one", topic: "kinematics", completedAt: "2026-01-01T00:00:00.000Z" },
        { id: "lab:one", kind: "lab", contentId: "lab-one", topic: "kinematics", completedAt: "2026-01-02T00:00:00.000Z" },
        { id: "invalid", kind: "lesson", contentId: "", topic: "", completedAt: "not-a-date" },
      ] });
      if (key === "physicaai.experiments.v1") return "[]";
      if (key === "physicaai.drafts.v1") return "{}";
      return null;
    });
    const summary = await getLocalDataSummary();
    expect(summary).toEqual({ learningRecords: 7, savedQuestions: 1, savedExperiments: 0, activeDrafts: 0, completionEvents: 2, lessonCompletions: 1, labCompletions: 1 });
  });

  it("recovers with zero counts when local JSON is malformed", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("{");
    await expect(getLocalDataSummary()).resolves.toEqual({ learningRecords: 0, savedQuestions: 0, savedExperiments: 0, activeDrafts: 0, completionEvents: 0, lessonCompletions: 0, labCompletions: 0 });
  });

  it("owns every local storage key, including offline autosave metadata", () => {
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.autosave.queue.v1");
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.autosave.last-save.v1");
  });
});
