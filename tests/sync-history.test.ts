import AsyncStorage from "@react-native-async-storage/async-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadSyncHistoryWithStatus, MAX_SYNC_HISTORY_ITEMS, parseSyncHistory, recordSyncHistory } from "../lib/sync-history";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() } }));

describe("sync history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
  });

  it("keeps valid entries bounded and newest-first", () => {
    const entries = Array.from({ length: MAX_SYNC_HISTORY_ITEMS + 2 }, (_, index) => ({ saved: index + 1, occurredAt: index + 1 }));
    expect(parseSyncHistory(entries)).toHaveLength(MAX_SYNC_HISTORY_ITEMS);
    expect(parseSyncHistory(entries)[0]).toEqual(entries[0]);
  });

  it("distinguishes clean absence from malformed history", async () => {
    await expect(loadSyncHistoryWithStatus()).resolves.toEqual({ entries: [], recovered: false });
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("{");
    await expect(loadSyncHistoryWithStatus()).resolves.toEqual({ entries: [], recovered: true, reason: "malformed" });
  });

  it("refuses to overwrite malformed history", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ saved: 1, occurredAt: 10 }, { saved: 0, occurredAt: 11 }]));
    await expect(recordSyncHistory({ saved: 2, occurredAt: 12 })).resolves.toEqual({ ok: false, reason: "malformed" });
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("prepends a valid entry and preserves existing history", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(JSON.stringify([{ saved: 1, occurredAt: 10 }]));
    await expect(recordSyncHistory({ saved: 2, occurredAt: 12 })).resolves.toEqual({ ok: true, data: [{ saved: 2, occurredAt: 12 }, { saved: 1, occurredAt: 10 }] });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("physicaai.autosave.sync-history.v1", JSON.stringify([{ saved: 2, occurredAt: 12 }, { saved: 1, occurredAt: 10 }]));
  });
});
