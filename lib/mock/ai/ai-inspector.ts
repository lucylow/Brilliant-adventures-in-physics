import { isMockAIEnabled, getMockAIConfig, isProductionRuntime } from "./config";
import { getAIDatasetCounts } from "./ai-validators";
import { getAIDemoScenario } from "./ai-scenarios";

export function inspectMockAI() {
  if (isProductionRuntime()) return null;
  if (!isMockAIEnabled()) return { enabled: false as const, label: "Demo AI off" };
  const config = getMockAIConfig();
  return {
    enabled: true as const,
    label: "Demo AI",
    scenario: config.scenarioId,
    providerMode: config.aiMode,
    latency: config.latency,
    failureMode: config.failureMode,
    streaming: config.streaming,
    counts: getAIDatasetCounts(),
    scenarioTitle: (() => {
      try {
        return getAIDemoScenario(config.scenarioId as never).title;
      } catch {
        return config.scenarioId;
      }
    })(),
  };
}
