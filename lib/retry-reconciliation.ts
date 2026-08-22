export type AppLifecycleState = "active" | "background" | "inactive" | "unknown";

export function shouldReconcileOnForeground(previous: AppLifecycleState, next: AppLifecycleState): boolean {
  return next === "active" && previous !== "active";
}
