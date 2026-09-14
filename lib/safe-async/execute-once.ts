export function executeOnce<T extends (...args: never[]) => Promise<unknown>>(task: T): T {
  let inFlight: Promise<unknown> | null = null;
  const wrapped = ((...args: never[]) => {
    if (inFlight) return inFlight;
    inFlight = task(...args).finally(() => {
      inFlight = null;
    });
    return inFlight;
  }) as T;
  return wrapped;
}

export function createAsyncOperationGuard() {
  let inFlight = false;
  return {
    get busy() {
      return inFlight;
    },
    async run<T>(task: () => Promise<T>): Promise<T | undefined> {
      if (inFlight) return undefined;
      inFlight = true;
      try {
        return await task();
      } finally {
        inFlight = false;
      }
    },
  };
}
