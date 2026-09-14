import { PersistenceError, ValidationError, err, normalizeError, ok, shouldRetryError, type Result } from "../shared/errors";
import { checksumFor } from "./storage/safe-json";
import { parseWithSchema, retryQueueItemSchema, type RetryQueueItemRecord } from "./storage/schemas";
import {
  clearRetryQueue,
  enqueueRetry,
  getLastSave,
  getRetryCount,
  loadRetryQueueWithStatus,
  parseRetryQueue,
  removeRetryItem,
  retryOneItem,
  retryQueue,
  type RetryItem,
} from "./retry-queue";

export const MAX_QUEUE_SIZE = 10;
export const MAX_PAYLOAD_BYTES = 32_768;
export const MAX_QUEUE_ATTEMPTS = 5;
export const QUEUE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type QueuedOperation = RetryQueueItemRecord & {
  type: string;
  createdAt: number;
  updatedAt: number;
  attempts: number;
  nextAttemptAt: number;
};

export type RetryQueueStatus = {
  pending: number;
  items: QueuedOperation[];
  lastSave: string | null;
  recovered: boolean;
  reason?: "malformed" | "unavailable";
};

function payloadSize(payload: unknown): number {
  try {
    return JSON.stringify(payload)?.length ?? Number.POSITIVE_INFINITY;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function normalizeQueuedOperation(item: RetryItem | RetryQueueItemRecord, now = Date.now()): Result<QueuedOperation> {
  const parsed = parseWithSchema(retryQueueItemSchema, item, "retry-queue");
  if (!parsed.ok) return parsed;
  const size = payloadSize(parsed.data.payload);
  if (size > MAX_PAYLOAD_BYTES) {
    return err(new ValidationError({
      message: "Queued autosave payload is too large",
      operation: "normalizeQueuedOperation",
      safeMetadata: { bytes: size },
    }));
  }
  const createdAt = parsed.data.createdAt ?? parsed.data.queuedAt;
  if (now - createdAt > QUEUE_TTL_MS) {
    return err(new ValidationError({
      message: "Queued autosave expired",
      operation: "normalizeQueuedOperation",
      retryable: false,
    }));
  }
  return ok({
    ...parsed.data,
    type: parsed.data.type ?? "draft",
    createdAt,
    updatedAt: parsed.data.updatedAt ?? parsed.data.queuedAt,
    attempts: parsed.data.attempts ?? 0,
    nextAttemptAt: parsed.data.nextAttemptAt ?? parsed.data.queuedAt,
    checksum: parsed.data.checksum ?? checksumFor(parsed.data.payload),
    version: parsed.data.version ?? 1,
  });
}

export async function getRetryQueueStatus(): Promise<Result<RetryQueueStatus>> {
  try {
    const [queue, lastSave] = await Promise.all([loadRetryQueueWithStatus(), getLastSave()]);
    const items: QueuedOperation[] = [];
    for (const item of queue.items) {
      const normalized = normalizeQueuedOperation(item);
      if (normalized.ok) items.push(normalized.data);
    }
    return ok({
      pending: items.length,
      items,
      lastSave,
      recovered: queue.recovered,
      reason: queue.reason,
    });
  } catch (error) {
    return err(normalizeError(error, { operation: "getRetryQueueStatus", feature: "settings" }));
  }
}

export async function getPendingRetryCount(): Promise<Result<number>> {
  try {
    return ok(await getRetryCount());
  } catch (error) {
    return err(normalizeError(error, { operation: "getPendingRetryCount", feature: "settings" }));
  }
}

export async function enqueueValidatedRetry(item: RetryItem): Promise<Result<number>> {
  const normalized = normalizeQueuedOperation(item);
  if (!normalized.ok) return normalized;
  try {
    const count = await enqueueRetry({
      id: normalized.data.id,
      payload: normalized.data.payload,
      queuedAt: normalized.data.queuedAt,
    });
    return ok(count);
  } catch (error) {
    return err(new PersistenceError({
      message: "Could not queue the autosave",
      operation: "enqueueValidatedRetry",
      cause: error,
    }));
  }
}

export async function drainRetryQueue(save: (item: RetryItem) => Promise<void>): Promise<Result<{ saved: number; remaining: number }>> {
  try {
    const result = await retryQueue(async (item) => {
      const normalized = normalizeQueuedOperation(item);
      if (!normalized.ok) throw normalized.error;
      if ((normalized.data.attempts ?? 0) >= MAX_QUEUE_ATTEMPTS) throw new ValidationError({ message: "retry exhausted", operation: "drainRetryQueue" });
      await save(item);
    });
    return ok(result);
  } catch (error) {
    return err(normalizeError(error, { operation: "drainRetryQueue", feature: "settings" }));
  }
}

export async function retrySingleItem(id: string, save: (item: RetryItem) => Promise<void>): Promise<Result<{ saved: boolean; remaining: number }>> {
  try {
    return ok(await retryOneItem(id, save));
  } catch (error) {
    return err(normalizeError(error, { operation: "retrySingleItem", feature: "settings" }));
  }
}

export async function discardSingleItem(id: string): Promise<Result<number>> {
  try {
    return ok(await removeRetryItem(id));
  } catch (error) {
    return err(normalizeError(error, { operation: "discardSingleItem", feature: "settings" }));
  }
}

export async function clearRetryQueueSafe(): Promise<Result<void>> {
  try {
    await clearRetryQueue();
    return ok(undefined);
  } catch (error) {
    return err(normalizeError(error, { operation: "clearRetryQueue", feature: "settings" }));
  }
}

export function canRetryQueuedError(error: unknown): boolean {
  return shouldRetryError(error);
}

export { parseRetryQueue, MAX_QUEUE_SIZE as queueCapacity };
