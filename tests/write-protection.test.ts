import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteDraft, recordAttempt, saveDraft } from "../lib/progress-store";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() } }));

describe("local write protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("not-json");
  });

  it("does not replace learning state after malformed storage reads", async () => {
    await expect(recordAttempt(true, "kinematics")).rejects.toThrow("learning storage malformed");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("does not replace drafts after malformed storage reads", async () => {
    await expect(saveDraft({ id: "tutor", data: { question: "v" }, updatedAt: Date.now() })).rejects.toThrow("draft storage is malformed");
    await expect(deleteDraft("tutor")).rejects.toThrow("draft storage is malformed");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("propagates unavailable learning and draft reads without clearing them", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    await expect(recordAttempt(false, "energy")).rejects.toThrow("learning storage unavailable");
    await expect(saveDraft({ id: "practice", data: { index: 1 }, updatedAt: Date.now() })).rejects.toThrow("storage unavailable");
    await expect(deleteDraft("practice")).rejects.toThrow("storage unavailable");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});
