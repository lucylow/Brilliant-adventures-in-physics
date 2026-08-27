import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PREFERENCES, loadPreferencesWithStatus, savePreferences } from "../lib/preferences";
import { DEMO_NOTEBOOK_ENTRY, loadNotebookEntriesWithStatus, saveNotebookEntry } from "../lib/notebook";
import { DEFAULT_ONBOARDING, saveOnboarding } from "../lib/onboarding";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() } }));

describe("preference and Notebook recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
  });

  it("classifies a partial preference record as malformed and returns safe defaults", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ streakEnabled: false, locale: "fr" }));
    await expect(loadPreferencesWithStatus()).resolves.toEqual({ preferences: DEFAULT_PREFERENCES, recovered: true, reason: "malformed" });
  });

  it("classifies unsupported locale data as malformed", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ ...DEFAULT_PREFERENCES, locale: "xx" }));
    await expect(loadPreferencesWithStatus()).resolves.toEqual({ preferences: DEFAULT_PREFERENCES, recovered: true, reason: "malformed" });
  });

  it("refuses to overwrite preferences when the storage read is unavailable", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    await expect(savePreferences({ ...DEFAULT_PREFERENCES, reducedMotion: true })).rejects.toThrow("refusing to overwrite");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("refuses to overwrite onboarding choices when the prior profile is malformed", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("{");
    await expect(saveOnboarding({ ...DEFAULT_ONBOARDING, completed: true, step: 2 })).rejects.toThrow("refusing to overwrite");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("uses a clearly labeled Notebook demo entry for partially invalid records", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ ...DEMO_NOTEBOOK_ENTRY, content: 42 }]));
    await expect(loadNotebookEntriesWithStatus()).resolves.toEqual({ entries: [DEMO_NOTEBOOK_ENTRY], usedFallback: true, reason: "malformed" });
  });

  it("refuses to overwrite Notebook data when one stored entry is invalid", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ ...DEMO_NOTEBOOK_ENTRY, content: 42 }]));
    await expect(saveNotebookEntry({ title: "Reflection", type: "reflection", content: "Keep units visible.", links: ["kinematics"] })).rejects.toThrow("Notebook storage is malformed");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});

