import { beforeEach, describe, expect, it, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadPuzzleEvidence, recordPuzzleEvidence } from "../lib/puzzle-evidence";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe("puzzle evidence", () => {
  beforeEach(() => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
  });

  it("records a normalized entry and does not duplicate a puzzle id", async () => {
    vi.mocked(AsyncStorage.getItem)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(JSON.stringify([{ puzzleId: "p-1", outcome: "correct", hintsUsed: 0, xp: 20, recordedAt: "2026-01-01T00:00:00.000Z" }]));
    const first = await recordPuzzleEvidence({ puzzleId: "p-1", outcome: "correct", hintsUsed: -2, xp: -4 }, "2026-01-01T00:00:00.000Z");
    const repeated = await recordPuzzleEvidence({ puzzleId: "p-1", outcome: "incorrect", hintsUsed: 2, xp: 0 }, "2026-01-02T00:00:00.000Z");
    expect(first.recorded).toBe(true);
    expect(first.entry.hintsUsed).toBe(0);
    expect(first.entry.xp).toBe(0);
    expect(repeated.recorded).toBe(false);
    expect(repeated.entry.outcome).toBe("correct");
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it("filters malformed records when loading", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ puzzleId: "valid", outcome: "incorrect", hintsUsed: 1, xp: 0, recordedAt: "now" }, { puzzleId: "bad" }]));
    await expect(loadPuzzleEvidence()).resolves.toHaveLength(1);
  });
});
