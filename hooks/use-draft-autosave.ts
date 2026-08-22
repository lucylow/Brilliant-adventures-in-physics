import { useEffect, useState } from "react";
import { saveDraft } from "@/lib/progress-store";
import { enqueueRetry, markLastSave, type RetryItem } from "@/lib/retry-queue";

export type DraftSaveStatus = "idle" | "saving" | "saved" | "retrying" | "offline";

export function useDraftAutosave<T>(id: string, data: T, enabled = true): DraftSaveStatus {
  const [status, setStatus] = useState<DraftSaveStatus>("idle");
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const item: RetryItem = { id, payload: data, queuedAt: Date.now() };
    const timer = setTimeout(async () => {
      setStatus("saving");
      try {
        await saveDraft({ id, data, updatedAt: Date.now() });
        await markLastSave();
        if (!cancelled) setStatus("saved");
      } catch {
        if (cancelled) return;
        setStatus("retrying");
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          await saveDraft({ id, data, updatedAt: Date.now() });
          await markLastSave();
          if (!cancelled) setStatus("saved");
        } catch {
          await enqueueRetry(item);
          if (!cancelled) setStatus("offline");
        }
      }
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [id, data, enabled]);
  return status;
}
