import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "physicaai.autosave.queue.v1";
const LAST_SAVE_KEY = "physicaai.autosave.last-save.v1";
const MAX_ITEMS = 10;
export type RetryItem = { id: string; payload: unknown; queuedAt: number };

async function readQueue(): Promise<RetryItem[]> { try { const raw = await AsyncStorage.getItem(QUEUE_KEY); const value = raw ? JSON.parse(raw) : []; return Array.isArray(value) ? value : []; } catch { return []; } }
export async function enqueueRetry(item: RetryItem): Promise<number> { const current = (await readQueue()).filter((entry) => entry.id !== item.id); const next = [...current, item].slice(-MAX_ITEMS); await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next)); return next.length; }
export async function retryQueue(save: (item: RetryItem) => Promise<void>): Promise<{ saved: number; remaining: number }> { const current = await readQueue(); const remaining: RetryItem[] = []; let saved = 0; for (const item of current) { try { await save(item); saved += 1; } catch { remaining.push(item); } } await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining)); return { saved, remaining: remaining.length }; }
export async function getRetryCount(): Promise<number> { return (await readQueue()).length; }
export async function markLastSave(): Promise<void> { await AsyncStorage.setItem(LAST_SAVE_KEY, new Date().toISOString()); }
export async function getLastSave(): Promise<string | null> { return AsyncStorage.getItem(LAST_SAVE_KEY); }
export function formatLastSave(value: string | null): string { return value ? `Last local save: ${new Date(value).toLocaleString()}` : "No successful local save recorded yet."; }
export function formatRetryResult(saved: number, remaining: number): string {
  if (!Number.isInteger(saved) || saved < 0 || !Number.isInteger(remaining) || remaining < 0) throw new Error("retry counts must be non-negative integers");
  if (remaining === 0) return saved > 0 ? `Recovered ${saved} offline save${saved === 1 ? "" : "s"}.` : "No pending offline saves.";
  return `Recovered ${saved}; ${remaining} still waiting.`;
}
