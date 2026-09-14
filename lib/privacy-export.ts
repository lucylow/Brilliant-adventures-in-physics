import { sanitizeMetadata } from "../shared/errors";
import type { LocalDataSummary } from "./privacy";

const BLOCKED_EXPORT_KEYS = /password|token|api[_-]?key|secret|authorization|bearer|cookie|credential|prompt/i;

export type PrivacyExport = {
  generatedAt: string;
  summary: LocalDataSummary;
  notes: string[];
};

export function buildPrivacyExport(summary: LocalDataSummary, extra: Record<string, unknown> = {}): PrivacyExport {
  const sanitized = sanitizeMetadata(extra);
  const blocked = Object.keys(extra).filter((key) => BLOCKED_EXPORT_KEYS.test(key));
  return {
    generatedAt: new Date(0).toISOString(),
    summary,
    notes: [
      "This export contains counts only.",
      "Passwords, tokens, API keys, and raw Tutor prompts are excluded.",
      ...blocked.map((key) => `Omitted sensitive field: ${key}`),
      ...Object.keys(sanitized).map((key) => `Included metadata key: ${key}`),
    ].slice(0, 20),
  };
}

export function privacyExportIsSafe(payload: string): boolean {
  return !/sk-[a-z0-9]+/i.test(payload) && !/bearer\s+[a-z0-9._\-]+/i.test(payload) && !/eyj[a-z0-9_\-]+\.[a-z0-9_\-]+/i.test(payload);
}
