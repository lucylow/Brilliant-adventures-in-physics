import { normalizeServiceError, type ServiceResult } from "./service-result";

export async function persistSafely<T>(operation: Promise<T>): Promise<ServiceResult<T>> {
  try {
    return { ok: true, data: await operation };
  } catch (error) {
    return { ok: false, error: normalizeServiceError(error) };
  }
}

export function persistenceRecoveryMessageKey(result: ServiceResult<unknown>): "persistence.offlineSave" | "persistence.saveFailed" | null {
  if (result.ok) return null;
  return result.error.code === "OFFLINE" ? "persistence.offlineSave" : "persistence.saveFailed";
}

export function persistenceRecoveryMessage(result: ServiceResult<unknown>): string | null {
  const key = persistenceRecoveryMessageKey(result);
  if (key === "persistence.offlineSave") return "Saved locally when storage is available. Please try again.";
  if (key === "persistence.saveFailed") return "We could not save this change. Please try again.";
  return null;
}

export function loadRecoveryMessage(scope: "profile" | "progress" | "draft"): string {
  if (scope === "profile") return "We could not load your learning path. Please try again.";
  if (scope === "progress") return "We could not load progress. Please try again.";
  return "We could not load this saved session. You can continue without restoring it.";
}
