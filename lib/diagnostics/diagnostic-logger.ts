import { sanitizeMetadata, sanitizeUserFacingText, type AppError, type SafeMetadata } from "../../shared/errors";

export type DiagnosticLevel = "debug" | "info" | "warn" | "error";

export type DiagnosticRecord = {
  level: DiagnosticLevel;
  operation: string;
  feature?: string;
  code?: string;
  retryable?: boolean;
  diagnosticId?: string;
  message: string;
  safeMetadata: SafeMetadata;
  timestamp: number;
};

const SENSITIVE_LOG_PATTERN = /(authorization|bearer|api[_-]?key|secret|password|token|cookie|prompt)/i;

export type DiagnosticSink = (record: DiagnosticRecord) => void;

const defaultSink: DiagnosticSink = (record) => {
  if (record.level === "error") {
    console.error("[PhysicaAI]", record);
    return;
  }
  if (record.level === "warn") {
    console.warn("[PhysicaAI]", record);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.info("[PhysicaAI]", record);
  }
};

let sink: DiagnosticSink = defaultSink;

export function setDiagnosticSink(next: DiagnosticSink | null): void {
  sink = next ?? defaultSink;
}

export function muteDiagnostics(): void {
  sink = () => undefined;
}

export function diagnosticLogger(input: Omit<DiagnosticRecord, "timestamp" | "safeMetadata" | "message"> & { message: string; safeMetadata?: SafeMetadata; timestamp?: number }): DiagnosticRecord {
  const record: DiagnosticRecord = {
    level: input.level,
    operation: input.operation,
    feature: input.feature,
    code: input.code,
    retryable: input.retryable,
    diagnosticId: input.diagnosticId,
    message: sanitizeUserFacingText(input.message),
    safeMetadata: sanitizeMetadata(input.safeMetadata ?? {}),
    timestamp: input.timestamp ?? Date.now(),
  };
  if (SENSITIVE_LOG_PATTERN.test(record.message) || SENSITIVE_LOG_PATTERN.test(JSON.stringify(record.safeMetadata))) {
    record.message = "A failure was recorded with sensitive fields redacted.";
    record.safeMetadata = sanitizeMetadata(record.safeMetadata);
  }
  sink(record);
  return record;
}

export function safeLogError(error: AppError, operation: string, feature?: string): DiagnosticRecord {
  return diagnosticLogger({
    level: "error",
    operation: error.operation ?? operation,
    feature: error.feature ?? feature,
    code: error.code,
    retryable: error.retryable,
    diagnosticId: error.diagnosticId,
    message: error.message,
    safeMetadata: error.safeMetadata,
  });
}

export function safeLogWarning(message: string, operation: string, safeMetadata?: SafeMetadata): DiagnosticRecord {
  return diagnosticLogger({
    level: "warn",
    operation,
    message,
    safeMetadata,
  });
}
