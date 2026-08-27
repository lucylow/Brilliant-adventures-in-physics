import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteDraft, loadDraftWithStatus, saveDraft } from "../lib/progress-store";

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

  it("reports malformed sibling drafts even when the requested draft is absent", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ practice: { id: "practice", data: {}, updatedAt: -1 } }));
    await expect(loadDraftWithStatus("tutor")).resolves.toEqual({ draft: null, recovered: true, reason: "malformed" });
  });

  it("refuses to overwrite drafts when a sibling record is malformed", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ practice: { id: "practice", data: {}, updatedAt: -1 } }));
    await expect(saveDraft({ id: "tutor", data: { question: "A projectile" }, updatedAt: Date.now() })).rejects.toThrow("draft storage is malformed");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("refuses to delete a draft when another stored record is malformed", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify({ practice: { id: "practice", data: {}, updatedAt: -1 } }));
    await expect(deleteDraft("tutor")).rejects.toThrow("draft storage is malformed");
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("reports unavailable draft storage without discarding the user’s work", async () => {
    vi.mocked(AsyncStorage.getItem).mockRejectedValue(new Error("storage unavailable"));
    await expect(loadDraftWithStatus("tutor")).resolves.toEqual({ draft: null, recovered: true, reason: "unavailable" });
  });
});
