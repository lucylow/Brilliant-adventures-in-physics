import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMonetizationConfig } from "./config";
import { defaultClock } from "./clock";
import { emptyEntitlements, getEntitlements } from "./entitlements";
import type { CustomerEntitlements, EntitlementCacheState, Entitlements } from "./types";
import type { EntitlementSnapshot } from "./compat";
import { createDiagnosticId } from "@/lib/diagnostics/diagnostic-id";

const CACHE_KEY = "bav.monetization.entitlements.v1";

export type CachedEntitlements = {
  entitlements: Entitlements;
  snapshot: EntitlementSnapshot;
  customer?: CustomerEntitlements;
  storedAt: number;
  userId: string | null;
  diagnosticId: string;
};

export function classifyCache(storedAt: number, now = defaultClock.now()): EntitlementCacheState {
  const age = now - storedAt;
  const { freshMs, staleMs, expiredMs } = getMonetizationConfig().cache;
  if (age <= freshMs) return "fresh";
  if (age <= staleMs) return "stale";
  if (age <= expiredMs) return "expired";
  return "expired";
}

export function offlinePremiumAllowed(cached: CachedEntitlements, now = defaultClock.now()): boolean {
  if (!cached.entitlements.lifetimeOwned && cached.entitlements.status !== "unlimited" && cached.entitlements.status !== "trial") {
    return false;
  }
  const age = now - cached.storedAt;
  if (cached.entitlements.lifetimeOwned) {
    return age <= getMonetizationConfig().cache.maxOfflinePremiumMs * 7;
  }
  return age <= getMonetizationConfig().cache.maxOfflinePremiumMs;
}

export async function writeEntitlementCache(record: Omit<CachedEntitlements, "diagnosticId" | "storedAt"> & { storedAt?: number }): Promise<CachedEntitlements> {
  const next: CachedEntitlements = {
    ...record,
    storedAt: record.storedAt ?? defaultClock.now(),
    diagnosticId: createDiagnosticId(),
  };
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next));
  } catch {
    return next;
  }
  return next;
}

export async function readEntitlementCache(): Promise<CachedEntitlements | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntitlements;
    if (!parsed || typeof parsed !== "object" || typeof parsed.storedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearEntitlementCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {
    return;
  }
}

export async function entitlementsForUserChange(userId: string | null): Promise<Entitlements> {
  const cached = await readEntitlementCache();
  if (!cached || cached.userId !== userId) {
    await clearEntitlementCache();
    return emptyEntitlements();
  }
  return getEntitlements({ snapshot: cached.snapshot, customer: cached.customer, cacheAgeMs: defaultClock.now() - cached.storedAt, lifetimeOwned: cached.entitlements.lifetimeOwned });
}

export function sanitizeBillingLog(value: Record<string, unknown>): Record<string, string | number | boolean | null> {
  const blocked = ["receipt", "token", "secret", "card", "credential", "purchaseToken"];
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (blocked.some((item) => key.toLowerCase().includes(item.toLowerCase()))) continue;
    if (entry === null || typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") out[key] = entry;
  }
  return out;
}
