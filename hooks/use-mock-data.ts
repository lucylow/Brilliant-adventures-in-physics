import { useCallback, useMemo, useState } from "react";
import { getMockConfig, isMockModeEnabled, setMockConfig, type MockConfig } from "@/lib/mock/config";
import { getMockDataset, invalidateMockDataset } from "@/lib/mock/registry";
import { getMockDatasetStats } from "@/lib/mock/stats";
import { resetMockData, switchMockLearner } from "@/lib/mock/persistence";
import type { MockLatencyProfile, MockNetworkState, MockScenarioId } from "@/lib/mock/types";

export function useMockDataControls() {
  const enabled = isMockModeEnabled();
  const [config, setConfig] = useState<MockConfig>(getMockConfig());
  const stats = useMemo(() => (enabled ? getMockDatasetStats(getMockDataset(), config.scenario) : null), [enabled, config.scenario, config.learnerId]);

  const apply = useCallback((patch: Partial<MockConfig>) => {
    const next = setMockConfig(patch);
    invalidateMockDataset();
    setConfig(next);
    return next;
  }, []);

  return {
    enabled,
    config,
    stats,
    setScenario: (scenario: MockScenarioId) => apply({ scenario }),
    setLearner: (learnerId: string) => {
      apply({ learnerId });
      return switchMockLearner(learnerId);
    },
    setLatency: (latency: MockLatencyProfile) => apply({ latency }),
    setNetwork: (network: MockNetworkState) => apply({ network }),
    injectFailure: (operation: string) => apply({ failOperations: [...config.failOperations, operation] }),
    clearFailures: () => apply({ failOperations: [], failureRate: 0 }),
    reset: () => resetMockData(),
  };
}
