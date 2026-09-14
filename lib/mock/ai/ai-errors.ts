import { serviceFailure, type ServiceResult } from "@/lib/service-result";
import type { ErrorResponse, MockAIErrorCode } from "./ai-types";

export const MOCK_AI_ERROR_LIBRARY: Record<MockAIErrorCode, ErrorResponse> = {
  timeout: {
    code: "timeout",
    userMessage: "Demo AI timed out. Your question was not sent to a live provider.",
    developerMessage: "Mock AI timeout injected by failure mode or mock-slow budget.",
    retryable: true,
    fallbackAvailable: true,
    suggestedAction: "Retry the same question or use the local labeled fallback.",
  },
  offline: {
    code: "offline",
    userMessage: "Demo AI is offline. Local explanations and verified calculations still work.",
    developerMessage: "Mock AI offline scenario; do not enqueue a live completion.",
    retryable: true,
    fallbackAvailable: true,
    suggestedAction: "Reconnect or open a cached Tutor session.",
  },
  rateLimited: {
    code: "rateLimited",
    userMessage: "Demo AI is rate-limited for this session. Try again after a short pause.",
    developerMessage: "Mock rate-limit phase is limited.",
    retryable: true,
    fallbackAvailable: true,
    suggestedAction: "Wait for the recovered phase or use a local hint.",
  },
  serviceUnavailable: {
    code: "serviceUnavailable",
    userMessage: "Demo AI is temporarily unavailable.",
    developerMessage: "Mock provider serviceUnavailable.",
    retryable: true,
    fallbackAvailable: true,
    suggestedAction: "Retry once, then use local fallback.",
  },
  badRequest: {
    code: "badRequest",
    userMessage: "This Tutor request is missing required physics context.",
    developerMessage: "Mock AI rejected malformed request payload.",
    retryable: false,
    fallbackAvailable: false,
    suggestedAction: "Add a question, concept, or scanned values and try again.",
  },
  unauthorized: {
    code: "unauthorized",
    userMessage: "Demo AI cannot use production credentials. This is a development mock.",
    developerMessage: "Unauthorized is simulated; no real API key is read.",
    retryable: false,
    fallbackAvailable: true,
    suggestedAction: "Stay on Demo AI. Do not paste provider secrets.",
  },
  providerError: {
    code: "providerError",
    userMessage: "Demo AI could not complete this request.",
    developerMessage: "Generic mock provider error.",
    retryable: true,
    fallbackAvailable: true,
    suggestedAction: "Retry or switch to a deterministic local explanation.",
  },
  malformedResponse: {
    code: "malformedResponse",
    userMessage: "Demo AI returned a response that could not be used.",
    developerMessage: "Malformed mock payload failed schema validation.",
    retryable: true,
    fallbackAvailable: true,
    suggestedAction: "Retry; the validator will refuse invalid fields.",
  },
  contentUnavailable: {
    code: "contentUnavailable",
    userMessage: "Demo AI has no fixture for this request yet.",
    developerMessage: "Selector could not resolve a catalog record.",
    retryable: false,
    fallbackAvailable: true,
    suggestedAction: "Choose a supported physics concept from the catalog.",
  },
  contextTooLarge: {
    code: "contextTooLarge",
    userMessage: "This conversation is too long for Demo AI. Older turns were dropped.",
    developerMessage: "Context window truncation policy triggered.",
    retryable: true,
    fallbackAvailable: false,
    suggestedAction: "Continue with the truncated recent context, or start a new session.",
  },
  cancelled: {
    code: "cancelled",
    userMessage: "The Demo AI request was cancelled.",
    developerMessage: "AbortSignal fired before completion.",
    retryable: true,
    fallbackAvailable: false,
    suggestedAction: "Send the question again if you still need an answer.",
  },
  emptyResponse: {
    code: "emptyResponse",
    userMessage: "Demo AI returned an empty answer.",
    developerMessage: "Empty or whitespace-only mock payload.",
    retryable: true,
    fallbackAvailable: true,
    suggestedAction: "Retry; empty payloads must not be shown as Tutor text.",
  },
  unsupported: {
    code: "unsupported",
    userMessage: "Demo AI can only help with physics learning questions in this app.",
    developerMessage: "Out-of-scope or safety-boundary fixture.",
    retryable: false,
    fallbackAvailable: true,
    suggestedAction: "Ask about a concept, problem, graph, or experiment in the curriculum.",
  },
};

export function mockAIError(code: MockAIErrorCode): ErrorResponse {
  return { ...MOCK_AI_ERROR_LIBRARY[code] };
}

export function mockAIErrorToServiceResult(code: MockAIErrorCode): ServiceResult<never> {
  const error = mockAIError(code);
  const mapped =
    code === "offline" ? "OFFLINE"
      : code === "timeout" || code === "cancelled" ? "TIMEOUT"
        : code === "badRequest" || code === "unsupported" ? "VALIDATION_ERROR"
          : "RETRYABLE_ERROR";
  return serviceFailure(mapped, error.userMessage, error.retryable);
}

export class MockAIError extends Error {
  readonly code: MockAIErrorCode;
  readonly payload: ErrorResponse;
  constructor(code: MockAIErrorCode) {
    const payload = mockAIError(code);
    super(payload.developerMessage);
    this.name = "MockAIError";
    this.code = code;
    this.payload = payload;
  }
}
