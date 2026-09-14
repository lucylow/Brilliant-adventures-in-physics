import { isDevelopmentRuntime, isProductionRuntime } from "@/lib/mock/config";
import type { BillingPeriod, MonetizationEnvironment, StoreIdMap } from "./types";
import { ALL_FEATURES, FEATURE_GATES } from "./features";

export type FreeLimitConfig = {
  dailyAiRequests: number;
  dailyExperiments: number;
  dailyPremiumPreviews: number;
  dailyDownloads: number;
};

export type TrialConfig = {
  enabled: boolean;
  periodDays: number;
  endingSoonHours: number;
};

export type GraceConfig = {
  enabled: boolean;
  periodDays: number;
};

export type CacheConfig = {
  freshMs: number;
  staleMs: number;
  expiredMs: number;
  maxOfflinePremiumMs: number;
};

export type MonetizationConfig = {
  environment: MonetizationEnvironment;
  storeIds: StoreIdMap;
  freeLimits: FreeLimitConfig;
  trial: TrialConfig;
  grace: GraceConfig;
  cache: CacheConfig;
  allowMockBilling: boolean;
  educationalLicensingEnabled: boolean;
};

const PLACEHOLDER = {
  ios: {
    monthly: "dev.bav.plus.monthly",
    annual: "dev.bav.plus.annual",
    lifetime: "dev.bav.lifetime",
  },
  android: {
    monthly: "dev.bav.plus.monthly",
    annual: "dev.bav.plus.annual",
    lifetime: "dev.bav.lifetime",
  },
} as const satisfies StoreIdMap;

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function envInt(name: string, fallback: number): number {
  const raw = readEnv(name);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function envFlag(name: string): boolean | undefined {
  const value = readEnv(name)?.toLowerCase();
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

function environment(): MonetizationEnvironment {
  if (isProductionRuntime()) return "production";
  const nodeEnv = readEnv("NODE_ENV");
  if (nodeEnv === "test") return "test";
  return "development";
}

export function loadStoreIds(): StoreIdMap {
  return {
    ios: {
      monthly: readEnv("EXPO_PUBLIC_IOS_PLUS_MONTHLY") ?? PLACEHOLDER.ios.monthly,
      annual: readEnv("EXPO_PUBLIC_IOS_PLUS_ANNUAL") ?? PLACEHOLDER.ios.annual,
      lifetime: readEnv("EXPO_PUBLIC_IOS_LIFETIME") ?? PLACEHOLDER.ios.lifetime,
    },
    android: {
      monthly: readEnv("EXPO_PUBLIC_ANDROID_PLUS_MONTHLY") ?? PLACEHOLDER.android.monthly,
      annual: readEnv("EXPO_PUBLIC_ANDROID_PLUS_ANNUAL") ?? PLACEHOLDER.android.annual,
      lifetime: readEnv("EXPO_PUBLIC_ANDROID_LIFETIME") ?? PLACEHOLDER.android.lifetime,
    },
  };
}

export function isPlaceholderStoreId(id: string): boolean {
  return id.startsWith("dev.") || id.includes("placeholder") || id.includes("TODO");
}

export function storeIdsAreConfigured(ids: StoreIdMap): boolean {
  const values = [ids.ios.monthly, ids.ios.annual, ids.ios.lifetime, ids.android.monthly, ids.android.annual, ids.android.lifetime];
  return values.every((value) => value.length > 0) && !values.some(isPlaceholderStoreId);
}

export function productIdFor(platform: "ios" | "android", period: Exclude<BillingPeriod, "none">, ids = loadStoreIds()): string {
  if (period === "monthly") return ids[platform].monthly;
  if (period === "annual") return ids[platform].annual;
  return ids[platform].lifetime;
}

export function getMonetizationConfig(): MonetizationConfig {
  const env = environment();
  const explicitMock = envFlag("EXPO_PUBLIC_MOCK_BILLING");
  const allowMockBilling = env === "production" ? false : explicitMock !== false;
  return {
    environment: env,
    storeIds: loadStoreIds(),
    freeLimits: {
      dailyAiRequests: envInt("EXPO_PUBLIC_FREE_AI_DAILY", 5),
      dailyExperiments: envInt("EXPO_PUBLIC_FREE_EXPERIMENT_DAILY", 4),
      dailyPremiumPreviews: envInt("EXPO_PUBLIC_FREE_PREVIEW_DAILY", 3),
      dailyDownloads: envInt("EXPO_PUBLIC_FREE_DOWNLOAD_DAILY", 0),
    },
    trial: {
      enabled: envFlag("EXPO_PUBLIC_TRIAL_ENABLED") === true,
      periodDays: envInt("EXPO_PUBLIC_TRIAL_DAYS", 7),
      endingSoonHours: 48,
    },
    grace: {
      enabled: true,
      periodDays: envInt("EXPO_PUBLIC_GRACE_DAYS", 3),
    },
    cache: {
      freshMs: 15 * 60 * 1000,
      staleMs: 6 * 60 * 60 * 1000,
      expiredMs: 36 * 60 * 60 * 1000,
      maxOfflinePremiumMs: 36 * 60 * 60 * 1000,
    },
    allowMockBilling,
    educationalLicensingEnabled: false,
  };
}

export type ConfigIssue = { path: string; message: string; severity: "error" | "warning" };

export function validateMonetizationConfig(config: MonetizationConfig = getMonetizationConfig()): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  const { storeIds, freeLimits, trial, environment: env } = config;

  for (const [platform, ids] of [
    ["ios", storeIds.ios],
    ["android", storeIds.android],
  ] as const) {
    for (const [slot, id] of Object.entries(ids)) {
      if (!id.trim()) issues.push({ path: `storeIds.${platform}.${slot}`, message: "Product ID is empty", severity: "error" });
      if (env === "production" && isPlaceholderStoreId(id)) {
        issues.push({ path: `storeIds.${platform}.${slot}`, message: "Placeholder product ID is not allowed in production", severity: "error" });
      }
    }
  }

  if (freeLimits.dailyAiRequests < 1) {
    issues.push({ path: "freeLimits.dailyAiRequests", message: "Free AI allowance must stay at least 1 so Tutor is not empty", severity: "error" });
  }
  if (freeLimits.dailyExperiments < 1) {
    issues.push({ path: "freeLimits.dailyExperiments", message: "Free experiment allowance must stay at least 1", severity: "error" });
  }
  if (trial.enabled && trial.periodDays < 1) {
    issues.push({ path: "trial.periodDays", message: "Trial days must be positive when trial is enabled", severity: "error" });
  }
  if (config.allowMockBilling && env === "production") {
    issues.push({ path: "allowMockBilling", message: "Mock billing cannot be enabled in production", severity: "error" });
  }
  for (const feature of ALL_FEATURES) {
    if (!FEATURE_GATES[feature]) issues.push({ path: `features.${feature}`, message: "Missing feature gate", severity: "error" });
  }
  return issues;
}

export function assertValidMonetizationConfig(config: MonetizationConfig = getMonetizationConfig()): void {
  const errors = validateMonetizationConfig(config).filter((issue) => issue.severity === "error");
  if (errors.length === 0) return;
  if (config.environment === "production" || isDevelopmentRuntime() || config.environment === "test") {
    const details = errors.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    if (config.environment === "production") {
      throw new Error(`Invalid production monetization config: ${details}`);
    }
  }
}

export function assertProductionBillingSafety(config: MonetizationConfig = getMonetizationConfig()): void {
  if (config.environment !== "production") return;
  if (config.allowMockBilling) throw new Error("Mock billing selected in production");
  if (!storeIdsAreConfigured(config.storeIds)) {
    throw new Error("Production billing requires real store product IDs");
  }
}

export const DEMO_PRICE_MICROS = {
  monthlyUsd: 4_990_000,
  annualUsd: 39_990_000,
  lifetimeUsd: 79_990_000,
} as const;
