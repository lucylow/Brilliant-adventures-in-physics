import { beforeEach, describe, expect, it, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCAL_DATA_STORAGE_KEYS, clearAllLocalData, clearAllLocalDataWithReport, formatClearLocalDataReport } from "../lib/privacy";
import { buildPrivacyExport, privacyExportIsSafe } from "../lib/privacy-export";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));

describe("privacy clearing and export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.removeItem).mockResolvedValue(undefined);
  });

  it("reports a full clear when every owned key is removed", async () => {
    const report = await clearAllLocalDataWithReport();
    expect(report.status).toBe("fullyCleared");
    expect(report.cleared).toHaveLength(LOCAL_DATA_STORAGE_KEYS.length);
    expect(LOCAL_DATA_STORAGE_KEYS).toContain("physicaai.quarantine.v1");
    expect(formatClearLocalDataReport(report)).toContain("All PhysicaAI local data");
  });

  it("reports a partial clear instead of claiming success", async () => {
    vi.mocked(AsyncStorage.removeItem).mockImplementation(async (key) => {
      if (key === "physicaai.notebook.v1") throw new Error("storage unavailable");
    });
    const report = await clearAllLocalDataWithReport();
    expect(report.status).toBe("partiallyCleared");
    expect(report.failed[0]?.key).toBe("physicaai.notebook.v1");
    expect(formatClearLocalDataReport(report)).toContain("Some local data could not be cleared");
    await expect(clearAllLocalData()).rejects.toThrow("could not be cleared");
  });

  it("omits secrets from privacy export payloads", () => {
    const payload = buildPrivacyExport(
      { learningRecords: 1, savedQuestions: 0, savedExperiments: 0, activeDrafts: 0, completionEvents: 0, lessonCompletions: 0, labCompletions: 0 },
      { apiKey: "sk-secret", token: "abc", locale: "en" },
    );
    const text = JSON.stringify(payload);
    expect(text).not.toContain("sk-secret");
    expect(payload.notes.some((note) => note.includes("apiKey"))).toBe(true);
    expect(privacyExportIsSafe(text)).toBe(true);
  });
});
