const SECRET_KEY_PATTERN = /(api[_-]?key|secret|token|password|authorization|bearer|cookie|credential|prompt|jwt)/i;
const SECRET_VALUE_PATTERN = /(?:bearer\s+[a-z0-9._\-]+|sk-[a-z0-9]+|eyj[a-z0-9_\-]+\.[a-z0-9_\-]+)/i;

const MAX_STRING = 240;
const MAX_KEYS = 24;
const MAX_DEPTH = 4;

export type SafeMetadata = Record<string, unknown>;

function redactString(value: string): string {
  const trimmed = value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  return trimmed.replace(SECRET_VALUE_PATTERN, "[redacted]");
}

export function sanitizeMetadata(input: unknown, depth = 0): SafeMetadata {
  if (input == null || typeof input !== "object" || depth > MAX_DEPTH) return {};
  const source = input as Record<string, unknown>;
  const output: SafeMetadata = {};
  let count = 0;
  for (const [key, value] of Object.entries(source)) {
    if (count >= MAX_KEYS) break;
    if (SECRET_KEY_PATTERN.test(key)) {
      output[key] = "[redacted]";
      count += 1;
      continue;
    }
    if (typeof value === "string") {
      output[key] = redactString(value);
    } else if (typeof value === "number" || typeof value === "boolean" || value === null) {
      output[key] = value;
    } else if (Array.isArray(value)) {
      output[key] = value.slice(0, 8).map((item) => (typeof item === "object" ? sanitizeMetadata(item, depth + 1) : typeof item === "string" ? redactString(item) : item));
    } else if (value && typeof value === "object") {
      output[key] = sanitizeMetadata(value, depth + 1);
    }
    count += 1;
  }
  return output;
}

export function sanitizeUserFacingText(value: string): string {
  return redactString(value.replace(SECRET_VALUE_PATTERN, "[redacted]"));
}

export function containsSecretLikeValue(value: string): boolean {
  return SECRET_KEY_PATTERN.test(value) || SECRET_VALUE_PATTERN.test(value);
}
