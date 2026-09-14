import { normalizeError, type AppError } from "../../shared/errors";
import { createDiagnosticId } from "./diagnostic-id";
import { diagnosticLogger, safeLogError, type DiagnosticRecord } from "./diagnostic-logger";

export type FailureRecord = {
  error: AppError;
  diagnostic: DiagnosticRecord;
};

export function recordFailure(error: unknown, operation: string, feature?: string): FailureRecord {
  const diagnosticId = createDiagnosticId();
  const normalized = normalizeError(error, { operation, feature, diagnosticId });
  const diagnostic = safeLogError(normalized, operation, feature);
  return { error: normalized, diagnostic };
}

export function recordRecoverableWarning(operation: string, message: string, feature?: string): DiagnosticRecord {
  return diagnosticLogger({
    level: "warn",
    operation,
    feature,
    message,
    diagnosticId: createDiagnosticId(),
  });
}
