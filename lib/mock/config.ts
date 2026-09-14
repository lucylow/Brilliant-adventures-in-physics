import { MOCK_DATA_VERSION } from "./version";
import type { MockLatencyProfile, MockNetworkState, MockScenarioId } from "./types";

export type MockMode = "disabled" | "enabled" | "developmentOnly" | "forced";

export type MockConfig = {
  mode: MockMode;
  scenario: MockScenarioId;
  learnerId: string;
  latency: MockLatencyProfile;
  network: MockNetworkState;
  failureRate: number;
  failOperations: readonly string[];
  mockEntitlementsEnabled: boolean;
  persist: boolean;
  version: typeof MOCK_DATA_VERSION;
};

const DEFAULT_CONFIG: MockConfig = {
  mode: "developmentOnly",
  scenario: "active-learner",
  learnerId: "user-maya",
  latency: "fast",
  network: "online",
  failureRate: 0,
  failOperations: [],
  mockEntitlementsEnabled: false,
  persist: true,
  version: MOCK_DATA_VERSION,
};

let runtimeOverrides: Partial<MockConfig> = {};

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function nodeEnv(): string {
  return readEnv("NODE_ENV") ?? "development";
}

export function isProductionRuntime(): boolean {
  return nodeEnv() === "production";
}

export function isDevelopmentRuntime(): boolean {
  return nodeEnv() === "development";
}

function envFlag(name: string): boolean | undefined {
  const value = readEnv(name)?.trim().toLowerCase();
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

function envScenario(): MockScenarioId | undefined {
  const value = readEnv("EXPO_PUBLIC_MOCK_SCENARIO");
  return value && value.length > 0 ? (value as MockScenarioId) : undefined;
}

/**
 * Production safety: mock data never replaces live backends in production builds.
 * EXPO_PUBLIC_USE_MOCK_DATA=true enables mock mode only outside production.
 */
export function isMockModeEnabled(): boolean {
  if (isProductionRuntime()) return false;
  const explicit = envFlag("EXPO_PUBLIC_USE_MOCK_DATA");
  if (explicit === false) return false;
  if (explicit === true) return true;
  const mode = runtimeOverrides.mode ?? DEFAULT_CONFIG.mode;
  if (mode === "disabled") return false;
  if (mode === "forced") return true;
  if (mode === "enabled") return isDevelopmentRuntime() || nodeEnv() === "test";
  return isDevelopmentRuntime();
}

export function isMockEntitlementsEnabled(): boolean {
  if (isProductionRuntime()) return false;
  if (!isMockModeEnabled()) return false;
  const explicit = envFlag("EXPO_PUBLIC_MOCK_ENTITLEMENTS");
  if (explicit === false) return false;
  if (explicit === true) return true;
  return runtimeOverrides.mockEntitlementsEnabled === true;
}

export function getMockConfig(): MockConfig {
  return {
    ...DEFAULT_CONFIG,
    ...runtimeOverrides,
    mode: runtimeOverrides.mode ?? DEFAULT_CONFIG.mode,
    scenario: runtimeOverrides.scenario ?? envScenario() ?? DEFAULT_CONFIG.scenario,
    mockEntitlementsEnabled: isMockEntitlementsEnabled(),
    version: MOCK_DATA_VERSION,
  };
}

export function setMockConfig(patch: Partial<MockConfig>): MockConfig {
  runtimeOverrides = { ...runtimeOverrides, ...patch };
  return getMockConfig();
}

export function setMockScenario(scenario: MockScenarioId): MockConfig {
  return setMockConfig({ scenario });
}

export function getMockScenario(): MockScenarioId {
  return getMockConfig().scenario;
}

export function setMockLearner(learnerId: string): MockConfig {
  return setMockConfig({ learnerId });
}

export function resetMockConfig(): MockConfig {
  runtimeOverrides = {};
  return getMockConfig();
}

export function assertMockOnly(operation: string): void {
  if (!isMockModeEnabled()) {
    throw new Error(`${operation} is available only while mock mode is enabled`);
  }
  if (isProductionRuntime()) {
    throw new Error(`${operation} is blocked in production`);
  }
}
