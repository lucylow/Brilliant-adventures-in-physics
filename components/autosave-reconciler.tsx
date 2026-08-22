import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as Network from "expo-network";
import { networkStateToStatus } from "@/lib/network";
import { saveDraft } from "@/lib/progress-store";
import { getRetryCount, markLastSave, retryQueue, type RetryItem } from "@/lib/retry-queue";
import { shouldReconcileOnForeground, shouldReconcileOnNetwork, type AppLifecycleState } from "@/lib/retry-reconciliation";

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
    let active = true;
    void Network.getNetworkStateAsync().then((state) => {
      if (active && shouldReconcileOnNetwork(networkStateToStatus(state))) void reconcile();
    }).catch(() => {
      // AppState reconciliation remains available when network inspection fails.
    });
    const networkSubscription = Network.addNetworkStateListener((state) => {
      if (shouldReconcileOnNetwork(networkStateToStatus(state))) void reconcile();
    });
    let previous = normalizeState(AppState.currentState);
    const subscription = AppState.addEventListener("change", (next) => {
      const normalized = normalizeState(next);
      if (shouldReconcileOnForeground(previous, normalized)) void reconcile();
      previous = normalized;
    });
    return () => { active = false; subscription.remove(); networkSubscription.remove(); };
  }, [reconcile]);

  return null;
}
