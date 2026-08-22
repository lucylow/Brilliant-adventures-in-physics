import type { NetworkStatus } from "./network";

export type AppLifecycleState = "active" | "background" | "inactive" | "unknown";

export function shouldReconcileOnNetwork(status: NetworkStatus): boolean {
  return status === "online";
}

export function shouldReconcileOnForeground(previous: AppLifecycleState, next: AppLifecycleState): boolean {
  return next === "active" && previous !== "active";
}
