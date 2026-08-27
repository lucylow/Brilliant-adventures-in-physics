import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyAdventureState, loadAdventureState, saveAdventureState } from "../lib/adventure";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn() } }));

describe("Adventure persistence recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  });

  it("keeps a clean missing state distinct from recovery", async () => {
    await expect(loadAdventureState()).resolves.toEqual({ state: emptyAdventureState(), recovered: false });
  });

  it("classifies malformed Adventure state without trusting arbitrary values", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("not-json");
    await expect(loadAdventureState()).resolves.toEqual({ state: emptyAdventureState(), recovered: true, reason: "malformed" });
  });

  it("classifies a partial Adventure record as malformed recovery", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ worldId: "orbit", completedMissionIds: [] }));
    await expect(loadAdventureState()).resolves.toEqual({ state: emptyAdventureState(), recovered: true, reason: "malformed" });
  });

  it("refuses to overwrite Adventure data when the prior record is partial", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ worldId: "orbit", completedMissionIds: [] }));
    await expect(saveAdventureState(emptyAdventureState())).rejects.toThrow("refusing to overwrite");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("reports unavailable Adventure storage explicitly", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    await expect(loadAdventureState()).resolves.toEqual({ state: emptyAdventureState(), recovered: true, reason: "unavailable" });
  });
});
