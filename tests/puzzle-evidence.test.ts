import { beforeEach, describe, expect, it, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadPuzzleEvidence, loadResolvedPuzzleIds, missedPuzzleReviewQueue, recordPuzzleEvidence, resolvePuzzleEvidence, reviewHistorySummary, reviewMasteryPercentDelta, summarizePuzzleEvidence } from "../lib/puzzle-evidence";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

describe("puzzle evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("summarizes unique evidence without answer farming inflation", () => {
    const summary = summarizePuzzleEvidence([
      { puzzleId: "p-1", topic: "energy", outcome: "correct", hintsUsed: 0, xp: 25, recordedAt: "now" },
      { puzzleId: "p-1", topic: "energy", outcome: "incorrect", hintsUsed: 2, xp: 0, recordedAt: "later" },
      { puzzleId: "p-2", topic: "waves", outcome: "assisted-correct", hintsUsed: 1, xp: 20, recordedAt: "now" },
    ]);
    expect(summary).toEqual({ total: 2, correct: 2, assisted: 1, xp: 45, accuracy: 1 });
  });

  it("orders a bounded missed-principle queue without duplicate IDs", () => {
    const queue = missedPuzzleReviewQueue([
      { puzzleId: "p-2", topic: "waves", outcome: "incorrect", hintsUsed: 0, xp: 0, recordedAt: "2026-01-02" },
      { puzzleId: "p-1", topic: "energy", outcome: "incorrect", hintsUsed: 0, xp: 0, recordedAt: "2026-01-01" },
      { puzzleId: "p-1", topic: "energy", outcome: "incorrect", hintsUsed: 1, xp: 0, recordedAt: "2026-01-03" },
      { puzzleId: "p-3", topic: "motion", outcome: "correct", hintsUsed: 0, xp: 25, recordedAt: "2026-01-01" },
    ], 2);
    expect(queue.map((entry) => entry.puzzleId)).toEqual(["p-1", "p-2"]);
  });

  it("resolves a puzzle once without deleting its original evidence", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null).mockResolvedValueOnce(JSON.stringify(["p-1"]));
    await expect(resolvePuzzleEvidence("p-1")).resolves.toBe(true);
    await expect(resolvePuzzleEvidence("p-1")).resolves.toBe(false);
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify(["p-1"]));
    await expect(loadResolvedPuzzleIds()).resolves.toEqual(["p-1"]);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it("summarizes a bounded redacted review history by unique topic", () => {
    expect(reviewHistorySummary([
      { resolutionId: "r-1", topic: "energy", recordedAt: "2026-01-01" },
      { resolutionId: "r-2", topic: "waves", recordedAt: "2026-01-03" },
      { resolutionId: "r-3", topic: "energy", recordedAt: "2026-01-04" },
    ], 2)).toEqual([
      { topic: "energy", recordedAt: "2026-01-04" },
      { topic: "waves", recordedAt: "2026-01-03" },
    ]);
  });

  it("filters malformed records when loading", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ puzzleId: "valid", outcome: "incorrect", hintsUsed: 1, xp: 0, recordedAt: "now" }, { puzzleId: "bad" }]));
    await expect(loadPuzzleEvidence()).resolves.toHaveLength(1);
  });

  it("derives a capped five-point mastery signal without changing evidence counts", () => {
    const records = Array.from({ length: 25 }, (_, index) => ({ resolutionId: `r-${index}`, topic: "energy", recordedAt: `2026-01-${String(index + 1).padStart(2, "0")}` }));
    expect(reviewMasteryPercentDelta(records, "energy")).toBe(100);
    expect(reviewMasteryPercentDelta(records.slice(0, 2), "energy")).toBe(10);
    expect(reviewMasteryPercentDelta(records, "waves")).toBe(0);
    expect(reviewMasteryPercentDelta(records, "energy", 0)).toBe(0);
  });
});
