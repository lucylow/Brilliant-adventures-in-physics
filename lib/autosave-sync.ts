export type AutosaveSyncEvent = { saved: number; occurredAt: number };

type Listener = (event: AutosaveSyncEvent) => void;

const listeners = new Set<Listener>();

export function subscribeAutosaveSync(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishAutosaveSync(saved: number, occurredAt = Date.now()): void {
  if (!Number.isInteger(saved) || saved <= 0 || !Number.isFinite(occurredAt)) return;
  const event = { saved, occurredAt };
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // A notification subscriber must never interrupt persistence reconciliation.
    }
  }
}
