export type ServiceErrorCode = "VALIDATION_ERROR" | "OFFLINE" | "TIMEOUT" | "UNEXPECTED_ERROR" | "RETRYABLE_ERROR";

export type ServiceError = { code: ServiceErrorCode; message: string; retryable: boolean };
export type ServiceResult<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

export interface Service<TInput, TOutput> {
  execute(input: TInput, signal?: AbortSignal): Promise<ServiceResult<TOutput>>;
}

export async function executeService<TInput, TOutput>(service: Service<TInput, TOutput>, input: TInput, signal?: AbortSignal): Promise<ServiceResult<TOutput>> {
  try {
    return await service.execute(input, signal);
  } catch (error) {
    return { ok: false, error: { code: "UNEXPECTED_ERROR", message: error instanceof Error ? error.message : "Unknown service error", retryable: true } };
  }
}

export function serviceFailure(code: ServiceErrorCode, message: string, retryable = code === "OFFLINE" || code === "TIMEOUT" || code === "RETRYABLE_ERROR"): ServiceResult<never> {
  return { ok: false, error: { code, message, retryable } };
}

export function isServiceSuccess<T>(result: ServiceResult<T>): result is { ok: true; data: T } {
  return result.ok;
}
