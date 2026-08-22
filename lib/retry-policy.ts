export type RetryOptions = {
  maxRetries?: number;
  delayMs?: number;
  sleep?: (delayMs: number) => Promise<void>;
};

function validateRetrySettings(maxRetries: number, delayMs: number): void {
  if (!Number.isInteger(maxRetries) || maxRetries < 0) throw new Error("maxRetries must be a non-negative integer");
  if (!Number.isFinite(delayMs) || delayMs < 0) throw new Error("delayMs must be non-negative and finite");
}

export async function retryAsync<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxRetries = options.maxRetries ?? 1;
  const delayMs = options.delayMs ?? 500;
  validateRetrySettings(maxRetries, delayMs);
  const sleep = options.sleep ?? ((delay: number) => new Promise<void>((resolve) => setTimeout(resolve, delay)));
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      await sleep(delayMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Retry operation failed");
}
