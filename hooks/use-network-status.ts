import { useCallback, useEffect, useState } from "react";
import * as Network from "expo-network";
import { networkStateToStatus, type NetworkStatus } from "@/lib/network";
import { useMountedRef } from "./use-mounted-ref";

export function useNetworkStatus(): {
  status: NetworkStatus;
  online: boolean;
  offline: boolean;
  checking: boolean;
  refresh: () => Promise<NetworkStatus>;
} {
  const mounted = useMountedRef();
  const [status, setStatus] = useState<NetworkStatus>("unknown");

  const apply = useCallback((next: NetworkStatus) => {
    if (mounted.current) setStatus(next);
  }, [mounted]);

  const refresh = useCallback(async () => {
    apply("checking");
    try {
      const state = await Network.getNetworkStateAsync();
      const next = networkStateToStatus(state);
      apply(next);
      return next;
    } catch {
      apply("unknown");
      return "unknown" as const;
    }
  }, [apply]);

  useEffect(() => {
    let active = true;
    const subscription = Network.addNetworkStateListener((state) => {
      if (!active) return;
      apply(networkStateToStatus(state));
    });
    void Network.getNetworkStateAsync()
      .then((state) => {
        if (active) apply(networkStateToStatus(state));
      })
      .catch(() => {
        if (active) apply("unknown");
      });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [apply]);

  return {
    status,
    online: status === "online",
    offline: status === "offline",
    checking: status === "checking",
    refresh,
  };
}
