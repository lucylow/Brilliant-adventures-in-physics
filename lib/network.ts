import type { ServiceError } from "./service-result";

export type NetworkStatus = "online" | "offline" | "checking" | "unknown";

export function networkStatusLabel(status: NetworkStatus): string {
  return ({ online: "Online", offline: "Offline", checking: "Checking connection", unknown: "Connection status unavailable" })[status];
}

export function serviceErrorNetworkStatus(error: Pick<ServiceError, "code">): NetworkStatus {
  if (error.code === "OFFLINE") return "offline";
  if (error.code === "TIMEOUT" || error.code === "RETRYABLE_ERROR" || error.code === "UNEXPECTED_ERROR") return "unknown";
  return "online";
}

export function recoveryMessage(error: Pick<ServiceError, "code" | "message">): string {
  const status = serviceErrorNetworkStatus(error);
  if (status === "offline") return "You appear to be offline. Your question is still available; reconnect and try again.";
  if (error.code === "TIMEOUT") return "The request took too long. Check your connection and try again.";
  return error.message;
}
