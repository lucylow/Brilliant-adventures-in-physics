import AsyncStorage from "@react-native-async-storage/async-storage";

export const SYNC_HISTORY_KEY = "physicaai.autosave.sync-history.v1";
export const MAX_SYNC_HISTORY_ITEMS = 8;

export type SyncHistoryEntry = {
  saved: number;
  occurredAt: number;
};

export type SyncHistoryLoadResult = {
  entries: SyncHistoryEntry[];
  recovered: boolean;
  reason?: "malformed" | "unavailable";
};

export type SyncHistoryWriteResult =
  | { ok: true; data: SyncHistoryEntry[] }
  | { ok: false; reason: "malformed" | "unavailable" };

function isSyncHistoryEntry(value: unknown): value is SyncHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.saved === "number" && Number.isInteger(entry.saved) && entry.saved > 0 && typeof entry.occurredAt === "number" && Number.isFinite(entry.occurredAt) && entry.occurredAt >= 0;
}

export function parseSyncHistory(input: unknown): SyncHistoryEntry[] {
  if (!Array.isArray(input) || input.some((entry) => !isSyncHistoryEntry(entry))) return [];
  return input.slice(0, MAX_SYNC_HISTORY_ITEMS) as SyncHistoryEntry[];
}

export async function loadSyncHistoryWithStatus(): Promise<SyncHistoryLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
    if (!raw) return { entries: [], recovered: false };
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      return { entries: [], recovered: true, reason: "malformed" };
    }
    if (!Array.isArray(parsed) || parsed.some((entry) => !isSyncHistoryEntry(entry))) {
      return { entries: [], recovered: true, reason: "malformed" };
    }
    return { entries: parseSyncHistory(parsed), recovered: false };
  } catch {
    return { entries: [], recovered: true, reason: "unavailable" };
  }
}

export async function recordSyncHistory(entry: SyncHistoryEntry): Promise<SyncHistoryWriteResult> {
  if (!isSyncHistoryEntry(entry)) return { ok: false, reason: "malformed" };
  const current = await loadSyncHistoryWithStatus();
  if (current.recovered) return { ok: false, reason: current.reason ?? "unavailable" };
  try {
    const next = [entry, ...current.entries].slice(0, MAX_SYNC_HISTORY_ITEMS);
    await AsyncStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(next));
    return { ok: true, data: next };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
