import { TRPCError } from "@trpc/server";
import { ERROR_CODES, type ErrorCode } from "../../shared/errors";

export type DatabaseFailureKind =
  | "connection"
  | "timeout"
  | "constraint"
  | "not_found"
  | "duplicate"
  | "invalid_input"
  | "transaction"
  | "unknown";

const SQL_STATE_MAP: Record<string, DatabaseFailureKind> = {
  "23000": "constraint",
  "23001": "constraint",
  "23505": "duplicate",
  "40001": "transaction",
  "40P01": "transaction",
  "08001": "connection",
  "08006": "connection",
  "08S01": "connection",
  HY000: "unknown",
};

export function classifyDatabaseError(error: unknown): DatabaseFailureKind {
  const message = error instanceof Error ? error.message : String(error);
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
  if (/timeout|timed out|etimedout/i.test(message) || code === "ETIMEDOUT") return "timeout";
  if (/duplicate|er_dup_entry|unique/i.test(message) || code === "ER_DUP_ENTRY") return "duplicate";
  if (/foreign key|constraint|er_no_referenced/i.test(message)) return "constraint";
  if (/not found|er_empty_query/i.test(message)) return "not_found";
  if (/connect|econnrefused|enotfound|protocol/i.test(message) || code === "ECONNREFUSED") return "connection";
  if (/invalid|er_truncat|er_bad_field|er_parse/i.test(message)) return "invalid_input";
  if (/transaction|deadlock|lock wait/i.test(message)) return "transaction";
  if (SQL_STATE_MAP[code]) return SQL_STATE_MAP[code];
  return "unknown";
}

export function databaseErrorCode(kind: DatabaseFailureKind): ErrorCode {
  switch (kind) {
    case "connection":
    case "timeout":
    case "transaction":
      return ERROR_CODES.NETWORK;
    case "not_found":
      return ERROR_CODES.NOT_FOUND;
    case "duplicate":
    case "constraint":
      return ERROR_CODES.CONFLICT;
    case "invalid_input":
      return ERROR_CODES.VALIDATION;
    default:
      return ERROR_CODES.UNKNOWN;
  }
}

export function toTrpcDatabaseError(error: unknown, operation: string): TRPCError {
  const kind = classifyDatabaseError(error);
  logDatabaseFailure(operation, error);
  return new TRPCError({
    code: trpcCodeForKind(kind),
    message: userMessageForKind(kind),
    cause: undefined,
  });
}

function trpcCodeForKind(kind: DatabaseFailureKind): TRPCError["code"] {
  switch (kind) {
    case "not_found":
      return "NOT_FOUND";
    case "duplicate":
    case "constraint":
      return "CONFLICT";
    case "invalid_input":
      return "BAD_REQUEST";
    case "timeout":
      return "TIMEOUT";
    case "connection":
      return "INTERNAL_SERVER_ERROR";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}

function userMessageForKind(kind: DatabaseFailureKind): string {
  switch (kind) {
    case "connection":
      return "The database is temporarily unavailable. Please retry.";
    case "timeout":
      return "The database took too long to respond. Please retry.";
    case "constraint":
      return "That change conflicts with existing data.";
    case "not_found":
      return "The requested record was not found.";
    case "duplicate":
      return "That record already exists.";
    case "invalid_input":
      return "The request contained invalid data.";
    case "transaction":
      return "The update could not be completed as a single operation. Please retry.";
    default:
      return "The server could not complete this request.";
  }
}

export function logDatabaseFailure(operation: string, error: unknown): DatabaseFailureKind {
  const kind = classifyDatabaseError(error);
  const message = error instanceof Error ? error.message : "unknown database error";
  console.error("[Database]", {
    operation,
    kind,
    code: databaseErrorCode(kind),
    message: message.slice(0, 180),
  });
  return kind;
}
