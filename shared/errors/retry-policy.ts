import { PERMANENT_ERROR_CODES, type ErrorCode } from "./error-codes";
import { isAppError } from "./app-error";
import { normalizeError } from "./normalize-error";

export type SharedRetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio: number;
  retryableCodes: readonly ErrorCode[];
};

export const DEFAULT_RETRY_POLICY: SharedRetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 400,
  maxDelayMs: 8_000,
  jitterRatio: 0.2,
  retryableCodes: ["NETWORK", "TIMEOUT", "RATE_LIMIT", "TUTOR_SERVICE", "PERSISTENCE"],
};

export function shouldRetryError(error: unknown, policy: SharedRetryPolicy = DEFAULT_RETRY_POLICY, attempt = 0): boolean {
  if (attempt >= policy.maxAttempts) return false;
  const normalized = isAppError(error) ? error : normalizeError(error);
  if (PERMANENT_ERROR_CODES.has(normalized.code) || !normalized.retryable) return false;
  return policy.retryableCodes.includes(normalized.code);
}

export function retryDelayMs(attempt: number, policy: SharedRetryPolicy = DEFAULT_RETRY_POLICY, random = Math.random): number {
  const safeAttempt = Math.max(0, attempt);
  const exponential = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** safeAttempt);
  const jitter = exponential * policy.jitterRatio * random();
  return Math.round(exponential + jitter);
}

export function nextAttemptAt(attempt: number, now = Date.now(), policy: SharedRetryPolicy = DEFAULT_RETRY_POLICY): number {
  return now + retryDelayMs(attempt, policy, () => 0.5);
}
