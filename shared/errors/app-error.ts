import { ERROR_CODES, PERMANENT_ERROR_CODES, RETRYABLE_ERROR_CODES, type ErrorCategory, type ErrorCode } from "./error-codes";
import { ERROR_SEVERITIES, severityFromCode, type ErrorSeverity } from "./error-severity";
import { defaultFriendlyMessage, type FriendlyMessageContext } from "./friendly-messages";
import { sanitizeMetadata, sanitizeUserFacingText, type SafeMetadata } from "./sanitize-metadata";

export type AppErrorInit = {
  code?: ErrorCode;
  category?: ErrorCategory;
  message: string;
  userMessage?: string;
  retryable?: boolean;
  severity?: ErrorSeverity;
  operation?: string;
  cause?: unknown;
  timestamp?: number;
  safeMetadata?: SafeMetadata;
  diagnosticId?: string;
  feature?: string;
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly category: ErrorCategory;
  readonly userMessage: string;
  readonly retryable: boolean;
  readonly severity: ErrorSeverity;
  readonly operation?: string;
  readonly cause?: unknown;
  readonly timestamp: number;
  readonly safeMetadata: SafeMetadata;
  readonly diagnosticId?: string;
  readonly feature?: string;

  constructor(init: AppErrorInit) {
    const code = init.code ?? ERROR_CODES.UNKNOWN;
    const category = init.category ?? categoryFromCode(code);
    super(sanitizeUserFacingText(init.message));
    this.name = category;
    this.code = code;
    this.category = category;
    this.userMessage = sanitizeUserFacingText(init.userMessage ?? defaultFriendlyMessage(code, { operation: init.operation, feature: init.feature }));
    this.retryable = init.retryable ?? RETRYABLE_ERROR_CODES.has(code);
    this.severity = init.severity ?? severityFromCode(code);
    this.operation = init.operation;
    this.cause = init.cause;
    this.timestamp = init.timestamp ?? Date.now();
    this.safeMetadata = sanitizeMetadata(init.safeMetadata ?? {});
    this.diagnosticId = init.diagnosticId;
    this.feature = init.feature;
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      category: this.category,
      message: this.message,
      userMessage: this.userMessage,
      retryable: this.retryable,
      severity: this.severity,
      operation: this.operation,
      timestamp: this.timestamp,
      safeMetadata: this.safeMetadata,
      diagnosticId: this.diagnosticId,
      feature: this.feature,
    };
  }
}

export function categoryFromCode(code: ErrorCode): ErrorCategory {
  switch (code) {
    case ERROR_CODES.VALIDATION:
      return "ValidationError";
    case ERROR_CODES.PERSISTENCE:
      return "PersistenceError";
    case ERROR_CODES.NETWORK:
      return "NetworkError";
    case ERROR_CODES.TIMEOUT:
      return "TimeoutError";
    case ERROR_CODES.AUTHENTICATION:
      return "AuthenticationError";
    case ERROR_CODES.AUTHORIZATION:
      return "AuthorizationError";
    case ERROR_CODES.NOT_FOUND:
      return "NotFoundError";
    case ERROR_CODES.CONFLICT:
      return "ConflictError";
    case ERROR_CODES.RATE_LIMIT:
      return "RateLimitError";
    case ERROR_CODES.MEDIA_PERMISSION:
      return "MediaPermissionError";
    case ERROR_CODES.MEDIA_UNAVAILABLE:
      return "MediaUnavailableError";
    case ERROR_CODES.PHYSICS_DOMAIN:
      return "PhysicsDomainError";
    case ERROR_CODES.SIMULATION:
      return "SimulationError";
    case ERROR_CODES.TUTOR_SERVICE:
      return "TutorServiceError";
    case ERROR_CODES.SERIALIZATION:
      return "SerializationError";
    case ERROR_CODES.MIGRATION:
      return "MigrationError";
    case ERROR_CODES.CONFIGURATION:
      return "ConfigurationError";
    default:
      return "UnknownAppError";
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

export function isPermanentError(error: Pick<AppError, "code" | "retryable">): boolean {
  return PERMANENT_ERROR_CODES.has(error.code) || error.retryable === false;
}

export { ERROR_SEVERITIES };
