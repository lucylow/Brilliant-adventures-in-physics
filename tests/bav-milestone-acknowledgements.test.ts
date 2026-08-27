import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { acknowledgeBAVMilestone, BAV_MILESTONE_ACKNOWLEDGEMENTS_KEY, loadBAVMilestoneAcknowledgementsWithStatus, MAX_BAV_MILESTONE_ACKNOWLEDGEMENTS, parseBAVMilestoneAcknowledgements, resetBAVMilestoneAcknowledgements } from "../lib/bav-milestone-acknowledgements";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() } }));

describe("B.A.V. milestone acknowledgements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
  });

  it("keeps valid acknowledgements unique and bounded", () => {
    const entries = [
      { id: "build-foundation", acknowledgedAt: 1 },
      { id: "build-foundation", acknowledgedAt: 2 },
      { id: "adventure-loop", acknowledgedAt: 3 },
      { id: "visualize-mastery", acknowledgedAt: 4 },
      { id: "build-foundation", acknowledgedAt: 5 },
    ];
    expect(parseBAVMilestoneAcknowledgements(entries)).toHaveLength(MAX_BAV_MILESTONE_ACKNOWLEDGEMENTS);
    expect(parseBAVMilestoneAcknowledgements(entries)[0]).toEqual(entries[0]);
  });

  it("distinguishes clean absence from malformed storage", async () => {
    await expect(loadBAVMilestoneAcknowledgementsWithStatus()).resolves.toEqual({ entries: [], recovered: false });
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ id: "unknown", acknowledgedAt: 1 }]));
    await expect(loadBAVMilestoneAcknowledgementsWithStatus()).resolves.toEqual({ entries: [], recovered: true, reason: "malformed" });
  });

  it("refuses to overwrite malformed storage", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ id: "build-foundation", acknowledgedAt: -1 }]));
    await expect(acknowledgeBAVMilestone("adventure-loop", 2)).resolves.toEqual({ ok: false, reason: "malformed" });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("resets trusted acknowledgements without touching learning storage", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ id: "build-foundation", acknowledgedAt: 1 }]));
    await expect(resetBAVMilestoneAcknowledgements()).resolves.toEqual({ ok: true });
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(BAV_MILESTONE_ACKNOWLEDGEMENTS_KEY);
  });

  it("refuses to reset malformed acknowledgements", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("{");
    await expect(resetBAVMilestoneAcknowledgements()).resolves.toEqual({ ok: false, reason: "malformed" });
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
  });

  it("acknowledges a new milestone once and preserves the existing record", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ id: "build-foundation", acknowledgedAt: 1 }]));
    await expect(acknowledgeBAVMilestone("adventure-loop", 2)).resolves.toEqual({ ok: true, data: [{ id: "adventure-loop", acknowledgedAt: 2 }, { id: "build-foundation", acknowledgedAt: 1 }] });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(BAV_MILESTONE_ACKNOWLEDGEMENTS_KEY, JSON.stringify([{ id: "adventure-loop", acknowledgedAt: 2 }, { id: "build-foundation", acknowledgedAt: 1 }]));
  });
});
