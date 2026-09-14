import { ERROR_CODES } from "./error-codes";
import { AppError, type AppErrorInit } from "./app-error";

function createTypedError(category: AppErrorInit["category"], code: AppErrorInit["code"], retryable: boolean) {
  return class TypedAppError extends AppError {
    constructor(init: Omit<AppErrorInit, "code" | "category"> & { code?: AppErrorInit["code"] }) {
      super({ ...init, code: init.code ?? code, category, retryable: init.retryable ?? retryable });
    }
  };
}

export class ValidationError extends createTypedError("ValidationError", ERROR_CODES.VALIDATION, false) {}
export class PersistenceError extends createTypedError("PersistenceError", ERROR_CODES.PERSISTENCE, true) {}
export class NetworkError extends createTypedError("NetworkError", ERROR_CODES.NETWORK, true) {}
export class TimeoutError extends createTypedError("TimeoutError", ERROR_CODES.TIMEOUT, true) {}
export class AuthenticationError extends createTypedError("AuthenticationError", ERROR_CODES.AUTHENTICATION, false) {}
export class AuthorizationError extends createTypedError("AuthorizationError", ERROR_CODES.AUTHORIZATION, false) {}
export class NotFoundError extends createTypedError("NotFoundError", ERROR_CODES.NOT_FOUND, false) {}
export class ConflictError extends createTypedError("ConflictError", ERROR_CODES.CONFLICT, false) {}
export class RateLimitError extends createTypedError("RateLimitError", ERROR_CODES.RATE_LIMIT, true) {}
export class MediaPermissionError extends createTypedError("MediaPermissionError", ERROR_CODES.MEDIA_PERMISSION, false) {}
export class MediaUnavailableError extends createTypedError("MediaUnavailableError", ERROR_CODES.MEDIA_UNAVAILABLE, false) {}
export class PhysicsDomainError extends createTypedError("PhysicsDomainError", ERROR_CODES.PHYSICS_DOMAIN, false) {}
export class SimulationError extends createTypedError("SimulationError", ERROR_CODES.SIMULATION, false) {}
export class TutorServiceError extends createTypedError("TutorServiceError", ERROR_CODES.TUTOR_SERVICE, true) {}
export class SerializationError extends createTypedError("SerializationError", ERROR_CODES.SERIALIZATION, false) {}
export class MigrationError extends createTypedError("MigrationError", ERROR_CODES.MIGRATION, false) {}
export class ConfigurationError extends createTypedError("ConfigurationError", ERROR_CODES.CONFIGURATION, false) {}
export class UnknownAppError extends createTypedError("UnknownAppError", ERROR_CODES.UNKNOWN, true) {}

export const typedErrorByCode = {
  [ERROR_CODES.VALIDATION]: ValidationError,
  [ERROR_CODES.PERSISTENCE]: PersistenceError,
  [ERROR_CODES.NETWORK]: NetworkError,
  [ERROR_CODES.TIMEOUT]: TimeoutError,
  [ERROR_CODES.AUTHENTICATION]: AuthenticationError,
  [ERROR_CODES.AUTHORIZATION]: AuthorizationError,
  [ERROR_CODES.NOT_FOUND]: NotFoundError,
  [ERROR_CODES.CONFLICT]: ConflictError,
  [ERROR_CODES.RATE_LIMIT]: RateLimitError,
  [ERROR_CODES.MEDIA_PERMISSION]: MediaPermissionError,
  [ERROR_CODES.MEDIA_UNAVAILABLE]: MediaUnavailableError,
  [ERROR_CODES.PHYSICS_DOMAIN]: PhysicsDomainError,
  [ERROR_CODES.SIMULATION]: SimulationError,
  [ERROR_CODES.TUTOR_SERVICE]: TutorServiceError,
  [ERROR_CODES.SERIALIZATION]: SerializationError,
  [ERROR_CODES.MIGRATION]: MigrationError,
  [ERROR_CODES.CONFIGURATION]: ConfigurationError,
  [ERROR_CODES.UNKNOWN]: UnknownAppError,
} as const;
