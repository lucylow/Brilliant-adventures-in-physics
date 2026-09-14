import { MockAIError } from "./ai-errors";
import { getMockAIProvider } from "./ai-client";
import { createMockAIRequest } from "./ai-factories";
import type { MockAIFeature, MockAIRequest, MockAIWrapped } from "./ai-types";

export async function routeMockAI(feature: MockAIFeature, prompt: string, extras: Partial<MockAIRequest> = {}, signal?: AbortSignal): Promise<MockAIWrapped<unknown>> {
  const request = createMockAIRequest({ ...extras, feature, prompt });
  const provider = getMockAIProvider();
  switch (feature) {
    case "tutor":
      return provider.sendMessage(request, signal);
    case "explanation":
      return provider.generateExplanation(request, signal);
    case "hint":
      return provider.generateHint(request, signal);
    case "problem":
      return provider.analyzeProblem(request, signal);
    case "scan":
      return provider.analyzeImage(request, signal);
    case "feedback":
      return provider.generatePracticeFeedback(request, signal);
    case "recommendation":
      return provider.generateRecommendations(request, signal);
    default:
      throw new MockAIError("contentUnavailable");
  }
}
