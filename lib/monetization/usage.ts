import { consume, remaining } from "./compat";
import { defaultClock, monetizationIso, nextUtcReset } from "./clock";
import { getMonetizationConfig } from "./config";
import type { AIUsageState, Entitlements, UsageLimit, UsageMeterId } from "./types";
import { hasEntitlement } from "./entitlements";

export type UsageSnapshot = {
  dateKey: string;
  meters: Record<UsageMeterId, { used: number }>;
};

export function emptyUsageSnapshot(now = defaultClock.now()): UsageSnapshot {
  return {
    dateKey: defaultClock.dateKey(now),
    meters: {
      ai_requests: { used: 0 },
      experiments: { used: 0 },
      premium_previews: { used: 0 },
      downloads: { used: 0 },
    },
  };
}

export function alignUsageSnapshot(snapshot: UsageSnapshot, now = defaultClock.now()): UsageSnapshot {
  const today = defaultClock.dateKey(now);
  if (snapshot.dateKey === today) return snapshot;
  return emptyUsageSnapshot(now);
}

function freeLimitFor(meter: UsageMeterId): number {
  const limits = getMonetizationConfig().freeLimits;
  if (meter === "ai_requests") return limits.dailyAiRequests;
  if (meter === "experiments") return limits.dailyExperiments;
  if (meter === "premium_previews") return limits.dailyPremiumPreviews;
  return limits.dailyDownloads;
}

function unlimitedFor(meter: UsageMeterId, entitlements: Entitlements): boolean {
  if (entitlements.lifetimeOwned) return true;
  if (meter === "ai_requests") return hasEntitlement(entitlements, "unlimited_tutor") || hasEntitlement(entitlements, "advanced_tutor");
  if (meter === "experiments") return hasEntitlement(entitlements, "unlimited_experiments");
  if (meter === "downloads") return hasEntitlement(entitlements, "downloadable_reports");
  if (meter === "premium_previews") return hasEntitlement(entitlements, "advanced_labs");
  return false;
}

export function getUsageLimit(meter: UsageMeterId, snapshot: UsageSnapshot, entitlements: Entitlements, now = defaultClock.now()): UsageLimit {
  const aligned = alignUsageSnapshot(snapshot, now);
  const used = aligned.meters[meter]?.used ?? 0;
  const unlimited = unlimitedFor(meter, entitlements);
  const limit = unlimited ? 0 : freeLimitFor(meter);
  return {
    meter,
    used: unlimited ? used : Math.min(used, Math.max(limit, 0)),
    limit,
    remaining: unlimited ? Number.MAX_SAFE_INTEGER : remaining({ used, limit: Math.max(limit, 0) }),
    resetAt: monetizationIso(nextUtcReset(now)),
    unlimited,
    period: "daily",
  };
}

export function getAIUsageState(snapshot: UsageSnapshot, entitlements: Entitlements, now = defaultClock.now()): AIUsageState {
  const limit = getUsageLimit("ai_requests", snapshot, entitlements, now);
  return {
    dailyLimit: limit.unlimited ? 0 : limit.limit,
    used: limit.used,
    remaining: limit.unlimited ? Number.MAX_SAFE_INTEGER : limit.remaining,
    resetAt: limit.resetAt,
    isUnlimited: limit.unlimited,
  };
}

export function canConsumeUsage(meter: UsageMeterId, snapshot: UsageSnapshot, entitlements: Entitlements, now = defaultClock.now(), cost = 1): boolean {
  const limit = getUsageLimit(meter, snapshot, entitlements, now);
  if (limit.unlimited) return true;
  if (limit.limit <= 0) return false;
  return limit.used + cost <= limit.limit;
}

export function consumeUsage(meter: UsageMeterId, snapshot: UsageSnapshot, entitlements: Entitlements, now = defaultClock.now(), cost = 1): UsageSnapshot {
  const aligned = alignUsageSnapshot(snapshot, now);
  const limit = getUsageLimit(meter, aligned, entitlements, now);
  if (limit.unlimited) {
    return {
      ...aligned,
      meters: {
        ...aligned.meters,
        [meter]: { used: aligned.meters[meter].used + cost },
      },
    };
  }
  const next = consume({ used: aligned.meters[meter].used, limit: limit.limit }, cost);
  return {
    ...aligned,
    meters: {
      ...aligned.meters,
      [meter]: { used: next.used },
    },
  };
}

export function usagePercent(limit: UsageLimit): number {
  if (limit.unlimited) return 0;
  if (limit.limit <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((limit.used / limit.limit) * 100)));
}

export const AI_USAGE_FIXTURE_PERCENTS = [0, 25, 50, 75, 90, 100] as const;

export function aiUsageFixture(percent: number | "unlimited", now = defaultClock.now()): { snapshot: UsageSnapshot; label: string } {
  const snapshot = emptyUsageSnapshot(now);
  if (percent === "unlimited") return { snapshot, label: "unlimited" };
  const limit = getMonetizationConfig().freeLimits.dailyAiRequests;
  snapshot.meters.ai_requests.used = Math.round((percent / 100) * limit);
  return { snapshot, label: `${percent}%` };
}

export function resetUsageIfNeeded(snapshot: UsageSnapshot, now = defaultClock.now()): UsageSnapshot {
  return alignUsageSnapshot(snapshot, now);
}
