export { ERROR_CATEGORIES, ERROR_CODES, PERMANENT_ERROR_CODES, RETRYABLE_ERROR_CODES } from "./error-codes";
export type { ErrorCategory, ErrorCode } from "./error-codes";
export { ERROR_SEVERITIES, severityFromCode } from "./error-severity";
export type { ErrorSeverity } from "./error-severity";
export { AppError, categoryFromCode, isAppError, isPermanentError } from "./app-error";
export type { AppErrorInit } from "./app-error";
export {
  AuthenticationError,
  AuthorizationError,
  ConfigurationError,
  ConflictError,
  MediaPermissionError,
  MediaUnavailableError,
  MigrationError,
  NetworkError,
  NotFoundError,
  PersistenceError,
  PhysicsDomainError,
  RateLimitError,
  SerializationError,
  SimulationError,
  TimeoutError,
  TutorServiceError,
  UnknownAppError,
  ValidationError,
  typedErrorByCode,
} from "./error-classes";
export { err, fromPromise, isErr, isOk, mapResult, ok, toErrorResult, unwrapOr } from "./error-result";
export type { ErrorResult, Result } from "./error-result";
export { getFriendlyErrorMessage, inferErrorCode, isRetryableError, normalizeError } from "./normalize-error";
export type { NormalizeErrorOptions } from "./normalize-error";
export { DEFAULT_RETRY_POLICY, nextAttemptAt, retryDelayMs, shouldRetryError } from "./retry-policy";
export type { SharedRetryPolicy } from "./retry-policy";
export { assertNever, isObjectRecord } from "./assert-never";
export { defaultFriendlyMessage, featureLabel } from "./friendly-messages";
export type { FriendlyMessageContext } from "./friendly-messages";
export { containsSecretLikeValue, sanitizeMetadata, sanitizeUserFacingText } from "./sanitize-metadata";
export type { SafeMetadata } from "./sanitize-metadata";
