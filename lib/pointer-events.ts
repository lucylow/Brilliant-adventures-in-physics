export const POINTER_EVENTS_POLICY = {
  application: "Use style.pointerEvents, never the deprecated View pointerEvents prop.",
  dependency: "Third-party pointerEvents warnings are documented in docs/KNOWN_WARNINGS.md and are not globally suppressed.",
} as const;

export function nonInteractiveLayerStyle<T extends Record<string, unknown>>(style?: T): T & { pointerEvents: "none" } {
  return { ...(style ?? ({} as T)), pointerEvents: "none" };
}

export function isStylePointerEvents(value: unknown): value is "none" | "auto" | "box-none" | "box-only" {
  return value === "none" || value === "auto" || value === "box-none" || value === "box-only";
}
