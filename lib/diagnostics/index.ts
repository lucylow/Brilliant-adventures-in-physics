export { createDiagnosticId, isDiagnosticId } from "./diagnostic-id";
export { diagnosticLogger, muteDiagnostics, safeLogError, safeLogWarning, setDiagnosticSink, type DiagnosticLevel, type DiagnosticRecord, type DiagnosticSink } from "./diagnostic-logger";
export { recordFailure, recordRecoverableWarning, type FailureRecord } from "./record-failure";
