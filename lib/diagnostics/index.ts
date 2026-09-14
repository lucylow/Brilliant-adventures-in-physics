export { createDiagnosticId, isDiagnosticId } from "./diagnostic-id";
export { diagnosticLogger, muteDiagnostics, safeLogError, safeLogWarning, setDiagnosticSink } from "./diagnostic-logger";
export type { DiagnosticLevel, DiagnosticRecord, DiagnosticSink } from "./diagnostic-logger";
export { recordFailure, recordRecoverableWarning } from "./record-failure";
export type { FailureRecord } from "./record-failure";
