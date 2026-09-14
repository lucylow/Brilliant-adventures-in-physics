import { err, ok, type Result } from "../../shared/errors";
import { normalizeError } from "../../shared/errors";
import { recordFailure } from "../diagnostics";

export type RunSafelyOptions = {
  operation: string;
  feature?: string;
  signal?: AbortSignal;
};

export async function runSafely<T>(task: () => Promise<T>, options: RunSafelyOptions): Promise<Result<T>> {
  try {
    if (options.signal?.aborted) {
      return err(normalizeError(new Error("operation was cancelled"), { operation: options.operation, feature: options.feature }));
    }
    return ok(await task());
  } catch (error) {
    const failure = recordFailure(error, options.operation, options.feature);
    return err(failure.error);
  }
}

export async function safeAsync<T>(task: () => Promise<T>, operation: string, feature?: string): Promise<Result<T>> {
  return runSafely(task, { operation, feature });
}
