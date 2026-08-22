import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "physicaai.autosave.queue.v1";
const LAST_SAVE_KEY = "physicaai.autosave.last-save.v1";
const MAX_ITEMS = 10;
export const RETRY_QUEUE_DISCARD_COPY = "This removes only queued autosaves and keeps your learning history and preferences.";
export const RETRY_QUEUE_DISCARDED_COPY = "Queued offline saves discarded. Learning history was kept.";
export type RetryItem = { id: string; payload: unknown; queuedAt: number };

export function parseRetryQueue(input: unknown): RetryItem[] {
  if (!Array.isArray(input)) return [];
  const valid = input.filter((item): item is RetryItem => Boolean(item) && typeof item === "object" && typeof (item as RetryItem).id === "string" && (item as RetryItem).id.trim().length > 0 && Number.isFinite((item as RetryItem).queuedAt) && (item as RetryItem).queuedAt >= 0);
  const unique = valid.filter((item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index);
  return unique.slice(-MAX_ITEMS);
}

async function readQueue(): Promise<RetryItem[]> { try { const raw = await AsyncStorage.getItem(QUEUE_KEY); return parseRetryQueue(raw ? JSON.parse(raw) : []); } catch { return []; } }
export async function enqueueRetry(item: RetryItem): Promise<number> { const current = (await readQueue()).filter((entry) => entry.id !== item.id); const next = [...current, item].slice(-MAX_ITEMS); await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next)); return next.length; }
export async function retryQueue(save: (item: RetryItem) => Promise<void>): Promise<{ saved: number; remaining: number }> { const current = await readQueue(); const remaining: RetryItem[] = []; let saved = 0; for (const item of current) { try { await save(item); saved += 1; } catch { remaining.push(item); } } await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining)); return { saved, remaining: remaining.length }; }
export async function getRetryCount(): Promise<number> { return (await readQueue()).length; }
export async function clearRetryQueue(): Promise<void> { await Promise.all([AsyncStorage.removeItem(QUEUE_KEY), AsyncStorage.removeItem(LAST_SAVE_KEY)]); }
export async function markLastSave(): Promise<void> { await AsyncStorage.setItem(LAST_SAVE_KEY, new Date().toISOString()); }
export async function getLastSave(): Promise<string | null> { return AsyncStorage.getItem(LAST_SAVE_KEY); }
export function formatLastSave(value: string | null): string { const timestamp = value ? Date.parse(value) : Number.NaN; return Number.isFinite(timestamp) ? `Last local save: ${new Date(timestamp).toLocaleString()}` : "No successful local save recorded yet."; }
export function formatRetryResult(saved: number, remaining: number): string {
  if (!Number.isInteger(saved) || saved < 0 || !Number.isInteger(remaining) || remaining < 0) throw new Error("retry counts must be non-negative integers");
  if (remaining === 0) return saved > 0 ? `Recovered ${saved} offline save${saved === 1 ? "" : "s"}.` : "No pending offline saves.";
  return `Recovered ${saved}; ${remaining} still waiting.`;
}
