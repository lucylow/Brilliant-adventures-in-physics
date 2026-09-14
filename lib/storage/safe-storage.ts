import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistenceError, SerializationError, err, ok, type Result } from "../../shared/errors";
import { recordFailure } from "../diagnostics";
import { safeJsonParse, safeJsonStringify } from "./safe-json";
import { quarantineRecord } from "./quarantine";

export async function safeStorageGet(key: string): Promise<Result<string | null, PersistenceError>> {
  try {
    return ok(await AsyncStorage.getItem(key));
  } catch (error) {
    const failure = recordFailure(error, "safeStorageGet");
    return err(new PersistenceError({
      message: `Could not read ${key}`,
      operation: "safeStorageGet",
      cause: failure.error,
      safeMetadata: { key },
    }));
  }
}

export async function safeStorageSet(key: string, value: string): Promise<Result<void, PersistenceError>> {
  try {
    await AsyncStorage.setItem(key, value);
    return ok(undefined);
  } catch (error) {
    const failure = recordFailure(error, "safeStorageSet");
    return err(new PersistenceError({
      message: `Could not write ${key}`,
      operation: "safeStorageSet",
      cause: failure.error,
      safeMetadata: { key },
    }));
  }
}

export async function safeStorageRemove(key: string): Promise<Result<void, PersistenceError>> {
  try {
    await AsyncStorage.removeItem(key);
    return ok(undefined);
  } catch (error) {
    const failure = recordFailure(error, "safeStorageRemove");
    return err(new PersistenceError({
      message: `Could not remove ${key}`,
      operation: "safeStorageRemove",
      cause: failure.error,
      safeMetadata: { key },
    }));
  }
}

export async function safeStorageJsonGet<T>(
  key: string,
  parse: (value: unknown) => Result<T, SerializationError | PersistenceError>,
): Promise<Result<T | null, PersistenceError | SerializationError>> {
  const raw = await safeStorageGet(key);
  if (!raw.ok) return raw;
  if (raw.data == null) return ok(null);
  const parsed = safeJsonParse(raw.data, `read:${key}`);
  if (!parsed.ok) {
    await quarantineRecord(key, raw.data, "malformed-json");
    return parsed;
  }
  const validated = parse(parsed.data);
  if (!validated.ok) {
    await quarantineRecord(key, raw.data, "schema-mismatch");
  }
  return validated;
}

export async function safeStorageJsonSet(key: string, value: unknown): Promise<Result<void, PersistenceError | SerializationError>> {
  const serialized = safeJsonStringify(value, `write:${key}`);
  if (!serialized.ok) return serialized;
  return safeStorageSet(key, serialized.data);
}
