export type ServiceErrorCode = "VALIDATION_ERROR" | "OFFLINE" | "TIMEOUT" | "UNEXPECTED_ERROR" | "RETRYABLE_ERROR";

export type ServiceError = { code: ServiceErrorCode; message: string; retryable: boolean };
export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

export interface Service<TInput, TOutput> {
  execute(input: TInput, signal?: AbortSignal): Promise<ServiceResult<TOutput>>;
}

export function normalizeServiceError(error: unknown): ServiceError {
  const message = error instanceof Error ? error.message : "Unknown service error";
  const name = error instanceof Error ? error.name : "";
  if (name === "AbortError") return { code: "TIMEOUT", message: "The request was cancelled or timed out.", retryable: true };
  if (/network|offline|failed to fetch|fetch failed/i.test(message)) return { code: "OFFLINE", message: "The network is unavailable. Please reconnect and try again.", retryable: true };
  if (/timeout|timed out/i.test(message)) return { code: "TIMEOUT", message, retryable: true };
  return { code: "UNEXPECTED_ERROR", message, retryable: true };
}

export async function executeService<TInput, TOutput>(service: Service<TInput, TOutput>, input: TInput, signal?: AbortSignal): Promise<ServiceResult<TOutput>> {
  try {
    return await service.execute(input, signal);
  } catch (error) {
    return { ok: false, error: normalizeServiceError(error) };
  }
}

export function serviceFailure(code: ServiceErrorCode, message: string, retryable = code === "OFFLINE" || code === "TIMEOUT" || code === "RETRYABLE_ERROR"): ServiceResult<never> {
  return { ok: false, error: { code, message, retryable } };
}

export function isServiceSuccess<T>(result: ServiceResult<T>): result is { ok: true; data: T } {
  return result.ok;
}

export function appErrorToServiceError(error: import("../shared/errors").AppError): ServiceError {
  const codeMap: Record<string, ServiceErrorCode> = {
    VALIDATION: "VALIDATION_ERROR",
    NETWORK: "OFFLINE",
    TIMEOUT: "TIMEOUT",
    PERSISTENCE: "RETRYABLE_ERROR",
    RATE_LIMIT: "RETRYABLE_ERROR",
    TUTOR_SERVICE: "RETRYABLE_ERROR",
  };
  return {
    code: codeMap[error.code] ?? "UNEXPECTED_ERROR",
    message: error.userMessage,
    retryable: error.retryable,
  };
}
