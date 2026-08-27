import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { consumeTutorUse, loadUsageWithStatus } from "../lib/usage-meter";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() } }));

describe("usage persistence recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("classifies malformed usage and does not reset it during consumption", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("not-json");
    await expect(loadUsageWithStatus()).resolves.toMatchObject({ recovered: true, reason: "malformed" });
    await expect(consumeTutorUse()).rejects.toThrow("usage storage malformed");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("classifies unavailable usage and preserves the local counter", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    await expect(loadUsageWithStatus()).resolves.toMatchObject({ recovered: true, reason: "unavailable" });
    await expect(consumeTutorUse()).rejects.toThrow("usage storage unavailable");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});
