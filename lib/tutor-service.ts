import { createMockTutorAnswer, type TutorAnswer, validateTutorAnswer } from "./ai";
import { executeService, serviceFailure, type Service, type ServiceResult } from "./service-result";
import { labeledLocalFallback, parseTutorAnswer, parseTutorRequest } from "./tutor-validation";
import { withTimeout } from "./safe-async";

export type TutorRequest = { question: string; verifiedValues?: TutorAnswer["verifiedValues"] };

export function validateTutorRequest(request: TutorRequest): ServiceResult<TutorRequest> {
  const parsed = parseTutorRequest(request);
  if (!parsed.ok) return serviceFailure("VALIDATION_ERROR", parsed.error.message);
  return { ok: true, data: { question: parsed.data.question, verifiedValues: parsed.data.verifiedValues ?? [] } };
}

export function createDeterministicTutorService(): Service<TutorRequest, TutorAnswer> {
  return {
    async execute(request) {
      const valid = validateTutorRequest(request);
      if (!valid.ok) return valid;
      return { ok: true, data: validateTutorAnswer(createMockTutorAnswer(valid.data.question, valid.data.verifiedValues)) };
    },
  };
}

export type TutorResponse = ServiceResult<TutorAnswer> & { usedFallback?: boolean };

export async function requestTutorAnswer(service: Service<TutorRequest, TutorAnswer>, request: TutorRequest, signal?: AbortSignal): Promise<TutorResponse> {
  const valid = validateTutorRequest(request);
  if (!valid.ok) return valid;
  return executeService(service, valid.data, signal);
}

export async function requestTutorAnswerWithTimeout(
  service: Service<TutorRequest, TutorAnswer>,
  request: TutorRequest,
  timeoutMs = 12_000,
): Promise<TutorResponse> {
  try {
    return await withTimeout((signal) => requestTutorAnswer(service, request, signal), timeoutMs, "tutor");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tutor timed out";
    return serviceFailure(/timed out|cancelled/i.test(message) ? "TIMEOUT" : "UNEXPECTED_ERROR", message);
  }
}

export async function requestTutorAnswerWithFallback(service: Service<TutorRequest, TutorAnswer>, request: TutorRequest, signal?: AbortSignal): Promise<TutorResponse> {
  const response = await requestTutorAnswer(service, request, signal);
  if (response.ok || !response.error.retryable) return response;
  const fallback = labeledLocalFallback(request.question, request.verifiedValues);
  const parsed = parseTutorAnswer(fallback);
  if (!parsed.ok) return serviceFailure("UNEXPECTED_ERROR", parsed.error.userMessage, true);
  return { ok: true, data: parsed.data, usedFallback: true };
}
