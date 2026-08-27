import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadDraftWithStatus } from "../lib/progress-store";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn() } }));

describe("recovery-aware draft loading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
  });

  it("keeps a clean missing-draft state distinct from recovery", async () => {
    await expect(loadDraftWithStatus("tutor")).resolves.toEqual({ draft: null, recovered: false });
  });

  it("reports malformed draft storage without returning invented work", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("{");
    await expect(loadDraftWithStatus("tutor")).resolves.toEqual({ draft: null, recovered: true, reason: "malformed" });
  });

  it("reports an invalid stored draft record instead of hiding it as absent", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ tutor: { id: "tutor", data: {}, updatedAt: "not-a-time" } }));
    await expect(loadDraftWithStatus("tutor")).resolves.toEqual({ draft: null, recovered: true, reason: "malformed" });
  });

  it("reports unavailable draft storage without discarding the user’s work", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    await expect(loadDraftWithStatus("tutor")).resolves.toEqual({ draft: null, recovered: true, reason: "unavailable" });
  });
});
