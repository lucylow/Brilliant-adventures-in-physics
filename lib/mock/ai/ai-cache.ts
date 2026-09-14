import { TTLCache } from "@/lib/ai";
import type { CacheStatus } from "./ai-types";

const cache = new TTLCache<unknown>();
const MAX_PROMPT = 20_000;

export function cacheStatus(key: string, ttlMs: number): CacheStatus {
  const hit = cache.get(key);
  if (hit === undefined) return "miss";
  return "hit";
}

export function readCache<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function writeCache<T>(key: string, value: T, ttlMs = 60_000): void {
  cache.set(key, value, ttlMs);
}

export function cacheKeyFor(prompt: string, feature: string): string {
  return `${feature}:${prompt.trim().toLowerCase().slice(0, 180)}`;
}

export function validatePromptInput(prompt: string): { ok: true; prompt: string } | { ok: false; reason: string } {
  const clean = prompt.trim();
  if (!clean) return { ok: false, reason: "missing user input" };
  if (clean.length > MAX_PROMPT) return { ok: false, reason: "too-large input" };
  return { ok: true, prompt: clean };
}

export { MAX_PROMPT };
