import { AppError } from "@shared/errors/app-error";
import { ERROR_CODES } from "@shared/errors/error-codes";
import { createSeededRandom } from "../utils/rng";
import type { MockNetworkState } from "../types";

export function shouldFailOperation(operation: string, failureRate: number, failOperations: readonly string[], network: MockNetworkState, seed: string): AppError | null {
  if (network === "offline" && (operation.startsWith("tutor") || operation.startsWith("save"))) {
    return new AppError({ code: ERROR_CODES.NETWORK, message: "Mock network is offline for this operation.", retryable: true, operation, feature: "mock" });
  }
  if (failOperations.includes(operation)) {
    if (operation.includes("tutor")) return new AppError({ code: ERROR_CODES.TUTOR_SERVICE, message: "Mock tutor request timed out.", retryable: true, operation, feature: "mock-tutor" });
    if (operation.includes("save") || operation.includes("experiment")) return new AppError({ code: ERROR_CODES.NETWORK, message: "Mock save failed.", retryable: true, operation, feature: "mock-save" });
    return new AppError({ code: ERROR_CODES.NETWORK, message: `Mock failure injected for ${operation}.`, retryable: true, operation, feature: "mock" });
  }
  if (failureRate <= 0) return null;
  const rng = createSeededRandom(`${seed}:${operation}`);
  if (rng.next() < failureRate) {
    return new AppError({ code: ERROR_CODES.NETWORK, message: "Seeded mock failure.", retryable: true, operation, feature: "mock" });
  }
  return null;
}
