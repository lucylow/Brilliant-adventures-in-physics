import type { ServiceError } from "./service-result";

export type NetworkStatus = "online" | "offline" | "checking" | "unknown";

export function networkStateToStatus(state: { isConnected?: boolean | null; isInternetReachable?: boolean | null }): NetworkStatus {
  if (state.isInternetReachable === true) return "online";
  if (state.isInternetReachable === false || state.isConnected === false) return "offline";
  if (state.isConnected === true && state.isInternetReachable == null) return "checking";
  return "unknown";
}

export function networkStatusLabel(status: NetworkStatus): string {
  return ({ online: "Online", offline: "Offline", checking: "Checking connection", unknown: "Connection status unavailable" })[status];
}

export function networkStatusMessage(status: NetworkStatus): string | null {
  if (status === "offline") return "Offline mode: your work stays on this device and will retry when connected.";
  if (status === "checking") return "Checking connection. Your local work remains safe.";
  return null;
}

export function manualNetworkCheckMessage(status: NetworkStatus): string {
  if (status === "online") return "Connection is available. You can retry queued saves now.";
  if (status === "offline") return "No internet connection detected. Queued saves remain on this device.";
  if (status === "checking") return "The connection is still being checked. Your queued saves remain safe.";
  return "We could not confirm the connection. Your queued saves remain on this device.";
}

export function shouldRetryAfterManualCheck(status: NetworkStatus, queuedCount: number): boolean {
  if (!Number.isInteger(queuedCount) || queuedCount < 0) throw new Error("queued count must be a non-negative integer");
  return status === "online" && queuedCount > 0;
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
