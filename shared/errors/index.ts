export { ERROR_CATEGORIES, ERROR_CODES, PERMANENT_ERROR_CODES, RETRYABLE_ERROR_CODES, type ErrorCategory, type ErrorCode } from "./error-codes";
export { ERROR_SEVERITIES, severityFromCode, type ErrorSeverity } from "./error-severity";
export { AppError, categoryFromCode, isAppError, isPermanentError, type AppErrorInit } from "./app-error";
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
export { err, fromPromise, isErr, isOk, mapResult, ok, toErrorResult, unwrapOr, type ErrorResult, type Result } from "./error-result";
export { getFriendlyErrorMessage, inferErrorCode, isRetryableError, normalizeError, type NormalizeErrorOptions } from "./normalize-error";
export { DEFAULT_RETRY_POLICY, nextAttemptAt, retryDelayMs, shouldRetryError, type SharedRetryPolicy } from "./retry-policy";
export { assertNever, isObjectRecord } from "./assert-never";
export { defaultFriendlyMessage, featureLabel, type FriendlyMessageContext } from "./friendly-messages";
export { containsSecretLikeValue, sanitizeMetadata, sanitizeUserFacingText, type SafeMetadata } from "./sanitize-metadata";
