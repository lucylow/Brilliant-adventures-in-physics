import { beforeEach, describe, expect, it, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { buildLocalDataShareText, clearAllLocalData, formatLocalDataSummary, formatPrivacyActivityTimestamp, getLocalDataSummary, getLocalDataSummaryWithStatus, loadPrivacyActivity, loadPrivacyActivityWithStatus, localSummaryFileUri, parsePrivacyActivityEvents, recordPrivacyActivity, LOCAL_DATA_STORAGE_KEYS } from "../lib/privacy";

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

  it("labels malformed summary storage and preserves valid summaries", async () => {
    vi.mocked(AsyncStorage.getItem).mockImplementation(async (key) => key === "physicaai.learning.v2" ? "{" : key === "physicaai.experiments.v1" ? JSON.stringify([{ id: "experiment-1" }]) : "{}");
    await expect(getLocalDataSummaryWithStatus()).resolves.toEqual({ summary: { learningRecords: 0, savedQuestions: 0, savedExperiments: 0, activeDrafts: 0, completionEvents: 0, lessonCompletions: 0, labCompletions: 0 }, recovered: true, reason: "malformed" });
    vi.mocked(AsyncStorage.getItem).mockImplementation(async (key) => key === "physicaai.learning.v2" ? null : key === "physicaai.experiments.v1" ? JSON.stringify([{ id: "experiment-1" }]) : "{}");
    await expect(getLocalDataSummaryWithStatus()).resolves.toMatchObject({ summary: { savedExperiments: 1 }, recovered: false });
    vi.mocked(AsyncStorage.getItem).mockImplementation(async (key) => key === "physicaai.learning.v2" ? JSON.stringify({ attempts: 1 }) : key === "physicaai.experiments.v1" ? JSON.stringify({ invalid: true }) : "{}");
    await expect(getLocalDataSummaryWithStatus()).resolves.toMatchObject({ recovered: true, reason: "malformed" });
  });

  it("parses only bounded metadata and orders activity newest-first", () => {
    const events = parsePrivacyActivityEvents([
      { id: "old", kind: "share", outcome: "success", occurredAt: "2026-01-01T00:00:00.000Z", summary: "private answer" },
      { id: "new", kind: "clear", outcome: "failure", occurredAt: "2026-01-02T00:00:00.000Z", rawAnswer: "private answer" },
      { id: "invalid", kind: "share", outcome: "success", occurredAt: "not-a-date" },
    ]);
    expect(events).toEqual([
      { id: "new", kind: "clear", outcome: "failure", occurredAt: "2026-01-02T00:00:00.000Z" },
      { id: "old", kind: "share", outcome: "success", occurredAt: "2026-01-01T00:00:00.000Z" },
    ]);
    expect(JSON.stringify(events)).not.toContain("private answer");
    expect(formatPrivacyActivityTimestamp("2026-01-02T00:00:00.000Z", "en")).toContain("2026");
  });

  it("records an activity event once for the same action timestamp", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([]));
    expect(await recordPrivacyActivity("share", "success", "2026-01-03T00:00:00.000Z")).toBe(true);
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ id: "share:2026-01-03T00:00:00.000Z", kind: "share", outcome: "success", occurredAt: "2026-01-03T00:00:00.000Z" }]));
    expect(await recordPrivacyActivity("share", "success", "2026-01-03T00:00:00.000Z")).toBe(false);
  });

  it("recovers to an empty activity history when storage is malformed", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("{");
    await expect(loadPrivacyActivity()).resolves.toEqual([]);
    await expect(loadPrivacyActivityWithStatus()).resolves.toEqual({ events: [], usedFallback: true, reason: "malformed" });
  });

  it("classifies a partially malformed activity history as recoverable", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ id: "share:1", kind: "share", outcome: "success", occurredAt: "2026-01-01T00:00:00.000Z" }, { id: "bad" }]));
    await expect(loadPrivacyActivityWithStatus()).resolves.toEqual({ events: [], usedFallback: true, reason: "malformed" });
  });

  it("does not overwrite activity history after malformed or unavailable reads", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("{");
    expect(await recordPrivacyActivity("share", "failure", "2026-01-04T00:00:00.000Z")).toBe(false);
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    expect(await recordPrivacyActivity("clear", "failure", "2026-01-05T00:00:00.000Z")).toBe(false);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("owns every local storage key, including offline autosave metadata", () => {
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.autosave.queue.v1");
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.autosave.last-save.v1");
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.autosave.sync-history.v1");
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.privacy-activity.v1");
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.onboarding.v1");
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.puzzle-evidence.v1");
  });

  it("clears every owned local key and reports partial failures", async () => {
    vi.mocked(AsyncStorage.removeItem).mockResolvedValue(undefined);
    await expect(clearAllLocalData()).resolves.toBeUndefined();
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(LOCAL_DATA_STORAGE_KEYS.length);
    vi.mocked(AsyncStorage.removeItem).mockImplementation(async (key) => {
      if (key === "physicaai.notebook.v1") throw new Error("storage unavailable");
    });
    await expect(clearAllLocalData()).rejects.toThrow("could not be cleared");
    expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(LOCAL_DATA_STORAGE_KEYS.length * 2);
  });
});
