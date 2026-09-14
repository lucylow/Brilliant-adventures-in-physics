import { useEffect, useState, type ReactNode } from "react";
import { isMockModeEnabled } from "@/lib/mock/config";
import { hydrateMockPersistence } from "@/lib/mock/persistence";

/**
 * Seeds local persistence from the mock dataset when mock mode is enabled.
 * Development-only; production builds skip this entirely.
 */
export function MockDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(!isMockModeEnabled());
  useEffect(() => {
    if (!isMockModeEnabled()) {
      setReady(true);
      return;
    }
    let active = true;
    void hydrateMockPersistence().finally(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);
  if (!ready) return children;
  return children;
}
