import { useEffect } from "react";
import { saveDraft } from "@/lib/progress-store";

export function useDraftAutosave<T>(id: string, data: T, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => { void saveDraft({ id, data, updatedAt: Date.now() }); }, 350);
    return () => clearTimeout(timer);
  }, [id, data, enabled]);
}
