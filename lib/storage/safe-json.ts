import { SerializationError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/errors";

export function safeJsonParse(raw: string, operation = "parse-json"): Result<unknown, SerializationError> {
  try {
    return ok(JSON.parse(raw) as unknown);
  } catch (cause) {
    return err(new SerializationError({
      message: "Stored data is not valid JSON",
      operation,
      cause,
    }));
  }
}

export function safeJsonStringify(value: unknown, operation = "serialize-json"): Result<string, SerializationError> {
  try {
    const serialized = JSON.stringify(value);
    if (typeof serialized !== "string") {
      return err(new SerializationError({ message: "Value could not be serialized", operation }));
    }
    return ok(serialized);
  } catch (cause) {
    return err(new SerializationError({
      message: "Value could not be serialized",
      operation,
      cause,
    }));
  }
}

export function checksumFor(value: unknown): string {
  const serialized = JSON.stringify(value) ?? "";
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
