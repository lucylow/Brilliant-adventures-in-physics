import type { MockAILatencyProfile } from "./ai-types";
import { getMockAIConfig, isDevelopmentRuntime, isProductionRuntime } from "./config";

const LATENCY_MS: Record<MockAILatencyProfile, number> = {
  instant: 0,
  fast: 90,
  realistic: 420,
  slow: 1600,
  verySlow: 4000,
};

export function latencyMsFor(profile?: MockAILatencyProfile): number {
  if (isProductionRuntime()) return 0;
  const resolved = profile ?? getMockAIConfig().latency;
  return LATENCY_MS[resolved];
}

export async function waitMockAILatency(signal?: AbortSignal, profile?: MockAILatencyProfile): Promise<void> {
  const ms = latencyMsFor(profile);
  if (ms <= 0) {
    if (signal?.aborted) throw abortError();
    return;
  }
  if (!isDevelopmentRuntime() && process.env.NODE_ENV === "test" && (profile ?? getMockAIConfig().latency) !== "verySlow" && (profile ?? getMockAIConfig().latency) !== "slow") {
    if (signal?.aborted) throw abortError();
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    if (signal?.aborted) {
      clearTimeout(timer);
      reject(abortError());
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function abortError(): Error {
  const error = new Error("The Demo AI request was cancelled.");
  error.name = "AbortError";
  return error;
}

export { isDevelopmentRuntime };
