import { TimeoutError } from "../../shared/errors";

export class TimeoutAbortError extends TimeoutError {
  constructor(operation: string, timeoutMs: number) {
    super({
      message: `${operation} timed out after ${timeoutMs}ms`,
      operation,
      safeMetadata: { timeoutMs },
    });
    this.name = "TimeoutError";
  }
}

export async function withTimeout<T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs: number, label = "operation"): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TimeoutError({ message: "timeoutMs must be a positive finite number", operation: label, retryable: false });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await Promise.race([
      operation(controller.signal),
      new Promise<T>((_, reject) => {
        controller.signal.addEventListener("abort", () => {
          reject(new TimeoutAbortError(label, timeoutMs));
        });
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

export function throwIfAborted(signal?: AbortSignal, operation = "operation"): void {
  if (signal?.aborted) {
    throw new TimeoutError({ message: `${operation} was cancelled`, operation, retryable: true });
  }
}
