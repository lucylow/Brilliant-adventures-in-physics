import { ERROR_CODES, type ErrorCode } from "./error-codes";
import { AppError, isAppError } from "./app-error";
import { typedErrorByCode } from "./error-classes";
import { defaultFriendlyMessage } from "./friendly-messages";
import { sanitizeMetadata } from "./sanitize-metadata";

const NETWORK_PATTERN = /network|offline|failed to fetch|fetch failed|enetunreach|econnrefused|econnreset|not connected/i;
const TIMEOUT_PATTERN = /timeout|timed out|aborted|abort error/i;
const AUTH_PATTERN = /unauthoriz|unauthenticated|not signed in|session expired/i;
const FORBIDDEN_PATTERN = /forbidden|not allowed|permission denied|access denied/i;
const NOT_FOUND_PATTERN = /not found|missing record|unknown id/i;
const RATE_PATTERN = /rate limit|too many requests|429/;
const VALIDATION_PATTERN = /invalid|required|must be|malformed|schema/i;
const PHYSICS_PATTERN = /must be finite|must be positive|must be non-negative|speed of light|denominator|physically/i;
const PERSISTENCE_PATTERN = /storage|asyncstorage|quota|unreadable|refusing to overwrite/i;
const MEDIA_PERMISSION_PATTERN = /permission was not granted|camera permission/i;
const MEDIA_UNAVAILABLE_PATTERN = /unavailable on this device|no media was selected/i;

function messageOf(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "Unknown application error";
}

function nameOf(error: unknown): string {
  return error instanceof Error ? error.name : "";
}

export function inferErrorCode(error: unknown): ErrorCode {
  if (isAppError(error)) return error.code;
  const name = nameOf(error);
  const message = messageOf(error);
  if (name === "AbortError" || TIMEOUT_PATTERN.test(message)) return ERROR_CODES.TIMEOUT;
  if (NETWORK_PATTERN.test(message)) return ERROR_CODES.NETWORK;
  if (AUTH_PATTERN.test(message)) return ERROR_CODES.AUTHENTICATION;
  if (FORBIDDEN_PATTERN.test(message)) return ERROR_CODES.AUTHORIZATION;
  if (NOT_FOUND_PATTERN.test(message)) return ERROR_CODES.NOT_FOUND;
  if (RATE_PATTERN.test(message)) return ERROR_CODES.RATE_LIMIT;
  if (PHYSICS_PATTERN.test(message)) return ERROR_CODES.PHYSICS_DOMAIN;
  if (PERSISTENCE_PATTERN.test(message)) return ERROR_CODES.PERSISTENCE;
  if (MEDIA_PERMISSION_PATTERN.test(message)) return ERROR_CODES.MEDIA_PERMISSION;
  if (MEDIA_UNAVAILABLE_PATTERN.test(message)) return ERROR_CODES.MEDIA_UNAVAILABLE;
  if (VALIDATION_PATTERN.test(message)) return ERROR_CODES.VALIDATION;
  return ERROR_CODES.UNKNOWN;
}

export type NormalizeErrorOptions = {
  operation?: string;
  feature?: string;
  diagnosticId?: string;
  safeMetadata?: Record<string, unknown>;
};

export function normalizeError(error: unknown, options: NormalizeErrorOptions = {}): AppError {
  if (isAppError(error)) {
    return new AppError({
      code: error.code,
      category: error.category,
      message: error.message,
      userMessage: error.userMessage,
      retryable: error.retryable,
      severity: error.severity,
      operation: options.operation ?? error.operation,
      cause: error.cause ?? error,
      timestamp: error.timestamp,
      safeMetadata: { ...error.safeMetadata, ...sanitizeMetadata(options.safeMetadata ?? {}) },
      diagnosticId: options.diagnosticId ?? error.diagnosticId,
      feature: options.feature ?? error.feature,
    });
  }
  const code = inferErrorCode(error);
  const Ctor = typedErrorByCode[code];
  const message = messageOf(error);
  return new Ctor({
    message,
    userMessage: defaultFriendlyMessage(code, { operation: options.operation, feature: options.feature, detail: message }),
    operation: options.operation,
    feature: options.feature,
    cause: error,
    diagnosticId: options.diagnosticId,
    safeMetadata: options.safeMetadata,
  });
}

export function isRetryableError(error: unknown): boolean {
  return normalizeError(error).retryable;
}

export function getFriendlyErrorMessage(error: unknown): string {
  return normalizeError(error).userMessage;
}
