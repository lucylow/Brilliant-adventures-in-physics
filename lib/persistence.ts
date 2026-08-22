import { normalizeServiceError, type ServiceResult } from "./service-result";

export async function persistSafely<T>(operation: Promise<T>): Promise<ServiceResult<T>> {
  try {
    return { ok: true, data: await operation };
  } catch (error) {
    return { ok: false, error: normalizeServiceError(error) };
  }
}

export function persistenceRecoveryMessage(result: ServiceResult<unknown>): string | null {
  if (result.ok) return null;
  return result.error.code === "OFFLINE" ? "Saved locally when storage is available. Please try again." : "We could not save this change. Please try again.";
}
