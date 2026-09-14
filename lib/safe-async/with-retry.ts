import { DEFAULT_RETRY_POLICY, normalizeError, retryDelayMs, shouldRetryError, type SharedRetryPolicy } from "../../shared/errors";
import { throwIfAborted } from "./with-timeout";

export type WithRetryOptions = {
  policy?: SharedRetryPolicy;
  signal?: AbortSignal;
  operation?: string;
  sleep?: (delayMs: number) => Promise<void>;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

const defaultSleep = (delayMs: number) => new Promise<void>((resolve) => setTimeout(resolve, delayMs));

export async function withRetry<T>(task: (attempt: number) => Promise<T>, options: WithRetryOptions = {}): Promise<T> {
  const policy = options.policy ?? DEFAULT_RETRY_POLICY;
  const sleep = options.sleep ?? defaultSleep;
  const operation = options.operation ?? "retryable-operation";
  let lastError: unknown;
  for (let attempt = 0; attempt <= policy.maxAttempts; attempt += 1) {
    throwIfAborted(options.signal, operation);
    try {
      return await task(attempt);
    } catch (error) {
      lastError = error;
      const retry = options.shouldRetry ? options.shouldRetry(error, attempt) : shouldRetryError(error, policy, attempt);
      if (!retry || attempt === policy.maxAttempts) break;
      await sleep(retryDelayMs(attempt, policy));
    }
  }
  throw normalizeError(lastError, { operation });
}
