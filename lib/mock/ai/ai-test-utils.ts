import { resetMockConfig } from "../config";
import { createMockAIRequest, createMockAIResponse } from "./ai-factories";
import { resetMockAIProvider } from "./ai-client";
import { resetLearnerMemory } from "./ai-memory";
import { resetSessions } from "./ai-session";
import { enableMockAIForTests, resetMockAIConfig } from "./config";

export function withMockAI() {
  enableMockAIForTests();
  return {
    request: createMockAIRequest({ prompt: "Explain projectile motion." }),
    response: createMockAIResponse({ type: "tutor", confidence: 0.9 }),
  };
}

export function resetMockAIHarness() {
  resetMockAIConfig();
  resetMockConfig();
  resetMockAIProvider();
  resetSessions();
  resetLearnerMemory();
}
