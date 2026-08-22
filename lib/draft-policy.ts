export type CompletionState = "editing" | "completed" | "discarded";
export type PersistenceState = "saved" | "saving" | "retrying" | "offline";

export function shouldClearDraft(state: CompletionState): boolean { return state === "completed" || state === "discarded"; }
export function persistenceMessage(state: PersistenceState): string { return state === "saved" ? "Draft saved on this device." : state === "saving" ? "Saving draft…" : state === "retrying" ? "Connection interrupted. Retrying…" : "Offline: draft not saved yet. Try again when connected."; }
export function accessibleCompletionLabel(kind: "practice" | "lesson" | "lab", completed: boolean): string { return completed ? `${kind} completed` : `Mark ${kind} complete`; }
