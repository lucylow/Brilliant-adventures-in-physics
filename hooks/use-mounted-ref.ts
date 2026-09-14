import { useCallback, useEffect, useRef } from "react";

export function useMountedRef(): { readonly current: boolean } {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
}

export function useLatestRequest() {
  const generation = useRef(0);
  const next = useCallback(() => {
    generation.current += 1;
    return generation.current;
  }, []);
  const isCurrent = useCallback((token: number) => token === generation.current, []);
  return { next, isCurrent, current: () => generation.current };
}
