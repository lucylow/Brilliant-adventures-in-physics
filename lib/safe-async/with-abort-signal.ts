export function withAbortSignal<T>(task: (signal: AbortSignal) => Promise<T>, parent?: AbortSignal): { promise: Promise<T>; abort: () => void } {
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  if (parent) {
    if (parent.aborted) controller.abort();
    else parent.addEventListener("abort", onParentAbort, { once: true });
  }
  const promise = task(controller.signal).finally(() => {
    parent?.removeEventListener("abort", onParentAbort);
  });
  return {
    promise,
    abort: () => controller.abort(),
  };
}

export function combineAbortSignals(...signals: Array<AbortSignal | undefined>): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (!signal) continue;
    if (signal.aborted) {
      controller.abort();
      break;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}
