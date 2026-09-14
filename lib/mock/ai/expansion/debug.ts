import { MOCK_AI_EXPANSION_VERSION } from "./types";
import { getLearnerModel } from "./learner-model";
import { retrieveRecentMemory, retrievePreferenceMemory } from "./memory-store";
import { classifyDialogueIntent } from "./dialogue";
import { extractEntities } from "./entities";
import { buildTutorContext } from "./context";
import { personalizeRecommendation } from "./personalize";
import { getAIDemoShowcase, getAITestUserState, learnerIdForTestUser } from "./orchestration";
import { isMockAIEnabled, getMockAIConfig, isProductionRuntime } from "../config";

export function inspectExpansion() {
  if (isProductionRuntime()) return null;
  if (!isMockAIEnabled()) {
    return { enabled: false as const, label: "Demo AI expansion off", version: MOCK_AI_EXPANSION_VERSION };
  }
  const learnerId = learnerIdForTestUser();
  const learner = getLearnerModel(learnerId);
  const config = getMockAIConfig();
  return {
    enabled: true as const,
    label: "Demo AI",
    version: MOCK_AI_EXPANSION_VERSION,
    showcase: getAIDemoShowcase(),
    testUser: getAITestUserState(),
    learnerId,
    learner: {
      id: learner.id,
      displayLabel: learner.displayLabel,
      style: learner.preference.explanationStyle,
      hintDependence: learner.hintDependence,
    },
    memoryRecent: retrieveRecentMemory(learner.userId, 3).map((item) => ({ id: item.id, kind: item.kind })),
    preferences: retrievePreferenceMemory(learner.userId).map((item) => item.kind),
    sampleIntent: classifyDialogueIntent("How do I use F = ma without skipping units?"),
    sampleEntities: extractEntities("A 2 kg block accelerates at 3 m/s²"),
    sampleContext: buildTutorContext("projectile range", "kinematics", [], learnerId, "tiny").records.map((item) => item.id),
    recommendations: personalizeRecommendation(learnerId).map((item) => ({ title: item.title, reason: item.reason })),
    request: { scenario: config.scenarioId, mode: config.aiMode, failure: config.failureMode },
    isMock: true as const,
  };
}
