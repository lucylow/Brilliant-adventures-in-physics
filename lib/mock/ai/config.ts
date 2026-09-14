import { assertMockOnly, getMockConfig, isMockModeEnabled, isProductionRuntime, setMockConfig } from "../config";
import { MOCK_AI_DATA_VERSION, type MockAIFailureMode, type MockAILatencyProfile, type MockAIMode, type MockAIScenarioId } from "./ai-types";

export type MockAIConfig = {
  aiMode: MockAIMode;
  scenarioId: MockAIScenarioId;
  failureMode: MockAIFailureMode;
  latency: MockAILatencyProfile;
  streaming: boolean;
  seed: string;
  version: typeof MOCK_AI_DATA_VERSION;
};

const DEFAULT_AI_CONFIG: MockAIConfig = {
  aiMode: "mock-rich",
  scenarioId: "first-tutor-question",
  failureMode: "none",
  latency: "fast",
  streaming: false,
  seed: "physicaai-demo-ai",
  version: MOCK_AI_DATA_VERSION,
};

let runtimeOverrides: Partial<MockAIConfig> = {};

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function envFlag(name: string): boolean | undefined {
  const value = readEnv(name)?.trim().toLowerCase();
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

const VALID_MODES: readonly MockAIMode[] = [
  "mock-off",
  "mock-basic",
  "mock-rich",
  "mock-streaming",
  "mock-offline",
  "mock-error",
  "mock-slow",
  "mock-deterministic",
];

function envMode(): MockAIMode | undefined {
  const value = readEnv("EXPO_PUBLIC_MOCK_AI_MODE");
  return value && (VALID_MODES as readonly string[]).includes(value) ? (value as MockAIMode) : undefined;
}

/**
 * Production safety: mock AI never activates in production builds.
 * Requires the existing mock-data flag path plus an AI-specific mode that is not mock-off.
 */
export function isMockAIEnabled(): boolean {
  if (isProductionRuntime()) return false;
  const explicit = envFlag("EXPO_PUBLIC_USE_MOCK_AI");
  if (explicit === false) return false;
  if (!isMockModeEnabled() && explicit !== true) return false;
  const mode = runtimeOverrides.aiMode ?? envMode() ?? DEFAULT_AI_CONFIG.aiMode;
  if (mode === "mock-off") return false;
  return true;
}

export function getMockAIConfig(): MockAIConfig {
  const base = { ...DEFAULT_AI_CONFIG, ...runtimeOverrides, version: MOCK_AI_DATA_VERSION };
  const mode = runtimeOverrides.aiMode ?? envMode() ?? DEFAULT_AI_CONFIG.aiMode;
  const scenario = runtimeOverrides.scenarioId ?? readEnv("EXPO_PUBLIC_MOCK_AI_SCENARIO") ?? DEFAULT_AI_CONFIG.scenarioId;
  const failure = (runtimeOverrides.failureMode ?? (readEnv("EXPO_PUBLIC_MOCK_AI_FAILURE") as MockAIFailureMode | undefined) ?? DEFAULT_AI_CONFIG.failureMode) as MockAIFailureMode;
  const latencyFromMode: MockAILatencyProfile =
    mode === "mock-slow" ? "slow" : mode === "mock-deterministic" || mode === "mock-basic" ? "instant" : base.latency;
  return {
    ...base,
    aiMode: mode,
    scenarioId: scenario,
    failureMode: mode === "mock-error" ? (failure === "none" ? "provider" : failure) : failure,
    latency: latencyFromMode,
    streaming: mode === "mock-streaming" ? true : base.streaming,
  };
}

export function setMockAIConfig(patch: Partial<MockAIConfig>): MockAIConfig {
  runtimeOverrides = { ...runtimeOverrides, ...patch };
  return getMockAIConfig();
}

export function setMockAIScenario(scenarioId: MockAIScenarioId): MockAIConfig {
  return setMockAIConfig({ scenarioId });
}

export function setAIFailureMode(failureMode: MockAIFailureMode): MockAIConfig {
  return setMockAIConfig({ failureMode });
}

export function resetMockAIConfig(): MockAIConfig {
  runtimeOverrides = {};
  return getMockAIConfig();
}

export function assertMockAIOnly(operation: string): void {
  assertMockOnly(operation);
  if (!isMockAIEnabled()) {
    throw new Error(`${operation} is available only while mock AI is enabled`);
  }
}

export function mockAIAlignsWithParentMock(): boolean {
  return getMockConfig().version.length > 0;
}

export function enableMockAIForTests(patch: Partial<MockAIConfig> = {}): MockAIConfig {
  setMockConfig({ mode: "enabled" });
  return setMockAIConfig({ aiMode: "mock-deterministic", latency: "instant", failureMode: "none", ...patch });
}

export { isProductionRuntime, isMockModeEnabled };
