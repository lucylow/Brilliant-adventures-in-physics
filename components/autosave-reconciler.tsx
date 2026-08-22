import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { saveDraft } from "@/lib/progress-store";
import { getRetryCount, markLastSave, retryQueue, type RetryItem } from "@/lib/retry-queue";
import { shouldReconcileOnForeground, type AppLifecycleState } from "@/lib/retry-reconciliation";

function normalizeState(state: AppStateStatus): AppLifecycleState {
  return state === "active" || state === "background" || state === "inactive" ? state : "unknown";
}

export function AutosaveReconciler() {
  const running = useRef(false);
  const reconcile = useCallback(async () => {
    if (running.current) return;
    try {
      if ((await getRetryCount()) === 0) return;
      running.current = true;
      const result = await retryQueue(async (item: RetryItem) => {
        await saveDraft({ id: item.id, data: item.payload, updatedAt: item.queuedAt });
      });
      if (result.saved > 0) await markLastSave();
    } catch {
      // Keep failed items queued for the next foreground attempt.
    } finally {
      running.current = false;
    }
  }, []);

  useEffect(() => {
    void reconcile();
    let previous = normalizeState(AppState.currentState);
    const subscription = AppState.addEventListener("change", (next) => {
      const normalized = normalizeState(next);
      if (shouldReconcileOnForeground(previous, normalized)) void reconcile();
      previous = normalized;
    });
    return () => subscription.remove();
  }, [reconcile]);

  return null;
}
