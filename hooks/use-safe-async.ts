import { useCallback, useRef, useState } from "react";
import { normalizeError, type AppError, type Result } from "@/shared/errors";
import { runSafely } from "@/lib/safe-async";
import { useLatestRequest, useMountedRef } from "./use-mounted-ref";

export type SafeAsyncState<T> = {
  status: "idle" | "loading" | "success" | "error";
  data: T | null;
  error: AppError | null;
  busy: boolean;
};

export function useSafeAsync<T>() {
  const mounted = useMountedRef();
  const requests = useLatestRequest();
  const [state, setState] = useState<SafeAsyncState<T>>({ status: "idle", data: null, error: null, busy: false });

  const run = useCallback(async (task: () => Promise<T>, operation: string, feature?: string): Promise<Result<T>> => {
    const token = requests.next();
    if (mounted.current) setState((current) => ({ ...current, status: "loading", busy: true, error: null }));
    const result = await runSafely(task, { operation, feature });
    if (!mounted.current || !requests.isCurrent(token)) return result;
    if (result.ok) setState({ status: "success", data: result.data, error: null, busy: false });
    else setState({ status: "error", data: null, error: result.error, busy: false });
    return result;
  }, [mounted, requests]);

  const reset = useCallback(() => {
    requests.next();
    if (mounted.current) setState({ status: "idle", data: null, error: null, busy: false });
  }, [mounted, requests]);

  return { ...state, run, reset };
}

export function useAsyncAction() {
  const mounted = useMountedRef();
  const busy = useRef(false);
  const [error, setError] = useState<AppError | null>(null);
  const [pending, setPending] = useState(false);

  const run = useCallback(async <T,>(task: () => Promise<T>, operation: string, feature?: string): Promise<Result<T>> => {
    if (busy.current) {
      return { ok: false, error: normalizeError(new Error("duplicate action prevented"), { operation, feature }) };
    }
    busy.current = true;
    if (mounted.current) {
      setPending(true);
      setError(null);
    }
    try {
      const result = await runSafely(task, { operation, feature });
      if (mounted.current && !result.ok) setError(result.error);
      return result;
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  }, [mounted]);

  return { run, pending, error, disabled: pending };
}

export function useRetryableAction() {
  const action = useAsyncAction();
  const [attempts, setAttempts] = useState(0);

  const run = useCallback(async <T,>(task: () => Promise<T>, operation: string, feature?: string): Promise<Result<T>> => {
    const result = await action.run(task, operation, feature);
    if (!result.ok && result.error.retryable) setAttempts((value) => value + 1);
    if (result.ok) setAttempts(0);
    return result;
  }, [action]);

  return { ...action, run, attempts };
}
