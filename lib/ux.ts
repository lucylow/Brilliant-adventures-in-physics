export type UXState = "idle" | "loading" | "ready" | "success" | "error" | "offline";
export type Priority = "primary" | "secondary" | "tertiary";
export type SessionDraft<T> = { id: string; data: T; updatedAt: number };
export type QueuedAction = { id: string; label: string; status: "queued" | "syncing" | "done" | "failed" };

export const actionOrder: Priority[] = ["primary", "secondary", "tertiary"];
export const uxCopy = { retry: "Try again", save: "Save", continue: "Continue", done: "Done", resume: "Resume", learn: "Learn next" } as const;
export const MIN_TOUCH = 44;
export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export function canInteract(state: UXState): boolean { return state !== "loading"; }
export function shouldRestore<T>(draft: SessionDraft<T>, maxAge = 86400000): boolean { return Date.now() - draft.updatedAt < maxAge; }
export function friendlyError(code: string): string { return ({ NETWORK: "Connection lost. Your work is safe.", TIMEOUT: "That took longer than expected.", PERMISSION: "Permission is needed for this step." } as Record<string, string>)[code] ?? "Something went wrong."; }
export function retryLabel(attempt: number): string { return attempt === 0 ? uxCopy.retry : `Retry (${attempt})`; }
export function pendingCount(actions: QueuedAction[]): number { return actions.filter((action) => action.status !== "done").length; }
export function emptyState(kind: string): { title: string; cta: string } { return { title: `No ${kind} yet`, cta: kind === "history" ? "Ask your first question" : "Start now" }; }
export function visibleControls(level: "simple" | "standard" | "advanced"): number { return level === "simple" ? 3 : level === "standard" ? 6 : 10; }
export function goalReminder(done: number, target: number): string { return done >= target ? "Goal complete" : "One more focused step"; }
export function missedDayCopy(): string { return "Welcome back. Your progress is still here."; }
export function nextAction<T extends { score: number }>(actions: T[]): T | undefined { return [...actions].sort((a, b) => b.score - a.score)[0]; }
export function fieldState(value: string, valid: boolean, focused: boolean): "empty" | "valid" | "invalid" | "focused" { return focused ? "focused" : !value ? "empty" : valid ? "valid" : "invalid"; }
export const validation = { required: "Enter a value", number: "Use a number", unit: "Check the unit" } as const;
export function restoreInput(saved?: string): string { return saved ?? ""; }
export function recognitionWarning(confidence: number): string | undefined { return confidence < 0.75 ? "Please review the highlighted symbols before solving." : undefined; }
export function streakCopy(days: number): string { return days <= 1 ? "Start a new habit" : "Keep building your learning streak"; }
export function reflection(kind: "correct" | "incorrect"): string { return kind === "correct" ? "What clue helped you?" : "Which step would you redo?"; }
