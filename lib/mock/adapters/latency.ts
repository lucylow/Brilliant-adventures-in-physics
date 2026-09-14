import { AppError } from "@shared/errors/app-error";
import { ERROR_CODES } from "@shared/errors/error-codes";
import type { MockLatencyProfile } from "../types";

const LATENCY_MS: Record<MockLatencyProfile, number> = {
  instant: 0,
  fast: 40,
  realistic: 180,
  slow: 450,
};

export async function applyMockLatency(profile: MockLatencyProfile, signal?: AbortSignal): Promise<void> {
  const ms = LATENCY_MS[profile];
  if (ms <= 0) {
    if (signal?.aborted) throw new AppError({ code: ERROR_CODES.TIMEOUT, message: "The mock request was cancelled.", retryable: true, operation: "mock-latency" });
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new AppError({ code: ERROR_CODES.TIMEOUT, message: "The mock request was cancelled.", retryable: true, operation: "mock-latency" }));
    };
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

export { LATENCY_MS };
