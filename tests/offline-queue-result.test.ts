import { describe, expect, it, vi, beforeEach } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { canRetryQueuedError, enqueueValidatedRetry, normalizeQueuedOperation, MAX_PAYLOAD_BYTES } from "../lib/offline-queue";
import { ValidationError } from "../shared/errors";

vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() } }));

describe("offline retry queue results", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("[]");
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
  });

  it("normalizes a valid queued draft", () => {
    const result = normalizeQueuedOperation({ id: "tutor", payload: { question: "Why?" }, queuedAt: Date.now() });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.type).toBe("draft");
      expect(result.data.checksum).toHaveLength(8);
    }
  });

  it("rejects oversized payloads without enqueueing", async () => {
    const huge = { id: "tutor", payload: "x".repeat(MAX_PAYLOAD_BYTES + 10), queuedAt: Date.now() };
    const normalized = normalizeQueuedOperation(huge);
    expect(normalized.ok).toBe(false);
    const queued = await enqueueValidatedRetry(huge);
    expect(queued.ok).toBe(false);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it("does not retry permanent validation errors", () => {
    expect(canRetryQueuedError(new ValidationError({ message: "invalid payload" }))).toBe(false);
    expect(canRetryQueuedError(new Error("network unavailable"))).toBe(true);
  });
});
