import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteExperiment, loadExperimentsWithStatus, saveExperiment } from "../lib/experiments";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() } }));

describe("experiment persistence recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("classifies malformed experiment storage and provides a labeled fallback", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("not-json");
    const result = await loadExperimentsWithStatus();
    expect(result).toMatchObject({ usedFallback: true, reason: "malformed" });
    expect(result.experiments[0]?.title).toContain("[Demo]");
  });

  it("classifies unavailable experiment storage and provides a labeled fallback", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    const result = await loadExperimentsWithStatus();
    expect(result).toMatchObject({ usedFallback: true, reason: "unavailable" });
    expect(result.experiments[0]?.summary).toContain("storage was unavailable");
  });

  it("does not overwrite partially invalid saved experiments", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ id: "bad", points: [] }]));
    await expect(saveExperiment({ title: "New run", points: [{ time: 0, distance: 0 }], summary: "Local test" })).rejects.toThrow("Experiment storage is malformed");
    await expect(deleteExperiment("bad")).rejects.toThrow("Experiment storage is malformed");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});
