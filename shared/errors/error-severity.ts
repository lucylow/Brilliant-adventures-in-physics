export const ERROR_SEVERITIES = {
  info: "info",
  warning: "warning",
  error: "error",
  fatal: "fatal",
} as const;

export type ErrorSeverity = (typeof ERROR_SEVERITIES)[keyof typeof ERROR_SEVERITIES];

export function severityFromCode(code: string): ErrorSeverity {
  if (code === "VALIDATION" || code === "NOT_FOUND" || code === "MEDIA_PERMISSION" || code === "MEDIA_UNAVAILABLE") {
    return ERROR_SEVERITIES.warning;
  }
  if (code === "CONFIGURATION" || code === "AUTHENTICATION" || code === "AUTHORIZATION") {
    return ERROR_SEVERITIES.fatal;
  }
  if (code === "PHYSICS_DOMAIN" || code === "SIMULATION" || code === "SERIALIZATION" || code === "MIGRATION") {
    return ERROR_SEVERITIES.error;
  }
  return ERROR_SEVERITIES.error;
}
