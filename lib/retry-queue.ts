import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "physicaai.autosave.queue.v1";
const LAST_SAVE_KEY = "physicaai.autosave.last-save.v1";
const MAX_ITEMS = 10;
export const RETRY_QUEUE_DISCARD_COPY = "This removes only queued autosaves and keeps your learning history and preferences.";
export const RETRY_QUEUE_DISCARDED_COPY = "Queued offline saves discarded. Learning history was kept.";
export const RETRY_ITEM_DISCARD_COPY = "This removes only the selected queued autosave. Other queued saves and learning history stay available.";
export const RETRY_ITEM_DISCARDED_COPY = "Queued autosave discarded. Other local data was kept.";
export type RetryItem = { id: string; payload: unknown; queuedAt: number };

function isRetryItem(item: unknown): item is RetryItem {
  return Boolean(item) && typeof item === "object" && typeof (item as RetryItem).id === "string" && (item as RetryItem).id.trim().length > 0 && Number.isFinite((item as RetryItem).queuedAt) && (item as RetryItem).queuedAt >= 0;
}

export function parseRetryQueue(input: unknown): RetryItem[] {
  if (!Array.isArray(input)) return [];
  const valid = input.filter(isRetryItem);
  const unique = valid.filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index);
  return unique.slice(-MAX_ITEMS);
}

export type RetryQueueLoadResult = { items: RetryItem[]; recovered: boolean; reason?: "malformed" | "unavailable" };
export async function loadRetryQueueWithStatus(): Promise<RetryQueueLoadResult> { try { const raw = await AsyncStorage.getItem(QUEUE_KEY); if (!raw) return { items: [], recovered: false }; let parsed: unknown; try { parsed = JSON.parse(raw) as unknown; } catch { return { items: [], recovered: true, reason: "malformed" }; } if (!Array.isArray(parsed) || parsed.some((item) => !isRetryItem(item))) return { items: [], recovered: true, reason: "malformed" }; return { items: parseRetryQueue(parsed), recovered: false }; } catch { return { items: [], recovered: true, reason: "unavailable" }; } }
async function readQueue(): Promise<RetryItem[]> { const result = await loadRetryQueueWithStatus(); if (result.recovered) throw new Error(`retry queue ${result.reason ?? "unavailable"}`); return result.items; }
export async function enqueueRetry(item: RetryItem): Promise<number> { const current = (await readQueue()).filter((entry) => entry.id !== item.id); const next = [...current, item].slice(-MAX_ITEMS); await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next)); return next.length; }
export type RetryProgress = { processed: number; total: number; saved: number };
export async function retryQueue(save: (item: RetryItem) => Promise<void>, onProgress?: (progress: RetryProgress) => void): Promise<{ saved: number; remaining: number }> { const current = await readQueue(); const remaining: RetryItem[] = []; let saved = 0; onProgress?.({ processed: 0, total: current.length, saved }); for (const item of current) { try { await save(item); saved += 1; } catch { remaining.push(item); } onProgress?.({ processed: saved + remaining.length, total: current.length, saved }); } await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining)); return { saved, remaining: remaining.length }; }
export async function getRetryCount(): Promise<number> { return (await readQueue()).length; }
export async function getRetryItems(): Promise<RetryItem[]> { return readQueue(); }
export async function removeRetryItem(id: string): Promise<number> {
  if (typeof id !== "string" || id.trim().length === 0) throw new Error("retry item id is required");
  const next = (await readQueue()).filter((item) => item.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next));
  return next.length;
}
export async function retryOneItem(id: string, save: (item: RetryItem) => Promise<void>): Promise<{ saved: boolean; remaining: number }> {
  if (typeof id !== "string" || id.trim().length === 0) throw new Error("retry item id is required");
  const current = await readQueue();
  const target = current.find((item) => item.id === id);
  if (!target) return { saved: false, remaining: current.length };
  try {
    await save(target);
  } catch {
    return { saved: false, remaining: current.length };
  }
  const next = current.filter((item) => item.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next));
  return { saved: true, remaining: next.length };
}
export function formatRetryItemAge(queuedAt: number, now: number): string {
  if (!Number.isFinite(queuedAt) || !Number.isFinite(now) || queuedAt < 0) return "age unavailable";
  const elapsedMs = Math.max(0, now - queuedAt);
  if (elapsedMs < 60_000) return "just now";
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
export async function clearRetryQueue(): Promise<void> { await Promise.all([AsyncStorage.removeItem(QUEUE_KEY), AsyncStorage.removeItem(LAST_SAVE_KEY)]); }
export async function markLastSave(): Promise<void> { await AsyncStorage.setItem(LAST_SAVE_KEY, new Date().toISOString()); }
export async function getLastSave(): Promise<string | null> { return AsyncStorage.getItem(LAST_SAVE_KEY); }
export function formatLastSave(value: string | null): string { const timestamp = value ? Date.parse(value) : Number.NaN; return Number.isFinite(timestamp) ? `Last local save: ${new Date(timestamp).toLocaleString()}` : "No successful local save recorded yet."; }
export function formatRetryProgress(progress: RetryProgress): string {
  if (!Number.isInteger(progress.processed) || progress.processed < 0 || !Number.isInteger(progress.total) || progress.total < 0 || progress.processed > progress.total || !Number.isInteger(progress.saved) || progress.saved < 0 || progress.saved > progress.processed) throw new Error("invalid retry progress");
  return `Recovering offline saves: ${progress.processed} of ${progress.total} checked; ${progress.saved} saved.`;
}
export function formatRetryResult(saved: number, remaining: number): string {
  if (!Number.isInteger(saved) || saved < 0 || !Number.isInteger(remaining) || remaining < 0) throw new Error("retry counts must be non-negative integers");
  if (remaining === 0) return saved > 0 ? `Recovered ${saved} offline save${saved === 1 ? "" : "s"}.` : "No pending offline saves.";
  return `Recovered ${saved}; ${remaining} still waiting.`;
}
export function formatRetryItemResult(index: number, saved: boolean, remaining: number): string {
  if (!Number.isInteger(index) || index < 0 || typeof saved !== "boolean" || !Number.isInteger(remaining) || remaining < 0) throw new Error("invalid retry item result");
  return saved ? `Recovered draft ${index + 1}. ${remaining} still waiting.` : `Draft ${index + 1} is still waiting. Your queued work was kept.`;
}
