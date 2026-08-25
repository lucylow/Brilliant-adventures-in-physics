import { createMockTutorAnswer, type TutorAnswer, validateTutorAnswer } from "./ai";
import { executeService, serviceFailure, type Service, type ServiceResult } from "./service-result";

export type TutorRequest = { question: string; verifiedValues?: TutorAnswer["verifiedValues"] };

export function validateTutorRequest(request: TutorRequest): ServiceResult<TutorRequest> {
  const question = request.question.trim();
  if (!question) return serviceFailure("VALIDATION_ERROR", "Ask a physics question before sending.");
  if (question.length > 20000) return serviceFailure("VALIDATION_ERROR", "Keep the question under 20,000 characters.");
  return { ok: true, data: { question, verifiedValues: request.verifiedValues ?? [] } };
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

export async function requestTutorAnswerWithFallback(service: Service<TutorRequest, TutorAnswer>, request: TutorRequest, signal?: AbortSignal): Promise<TutorResponse> {
  const response = await requestTutorAnswer(service, request, signal);
  if (response.ok || !response.error.retryable) return response;
  return { ok: true, data: validateTutorAnswer(createMockTutorAnswer(request.question, request.verifiedValues)), usedFallback: true };
}
