import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./storage-keys";

export type QuarantineRecord = {
  key: string;
  reason: string;
  storedAt: number;
  preview: string;
};

const MAX_QUARANTINE = 20;
const PREVIEW_LENGTH = 180;

export async function quarantineRecord(key: string, raw: string, reason: string): Promise<void> {
  try {
    const existingRaw = await AsyncStorage.getItem(STORAGE_KEYS.quarantine);
    const existing: QuarantineRecord[] = existingRaw ? (JSON.parse(existingRaw) as QuarantineRecord[]) : [];
    const next: QuarantineRecord[] = [
      {
        key,
        reason,
        storedAt: Date.now(),
        preview: raw.slice(0, PREVIEW_LENGTH),
      },
      ...(Array.isArray(existing) ? existing : []),
    ].slice(0, MAX_QUARANTINE);
    await AsyncStorage.setItem(STORAGE_KEYS.quarantine, JSON.stringify(next));
  } catch {
    // Quarantine is best-effort and must never crash recovery.
  }
}

export async function loadQuarantineRecords(): Promise<QuarantineRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.quarantine);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isQuarantineRecord).slice(0, MAX_QUARANTINE) : [];
  } catch {
    return [];
  }
}

function isQuarantineRecord(value: unknown): value is QuarantineRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<QuarantineRecord>;
  return typeof record.key === "string" && typeof record.reason === "string" && typeof record.storedAt === "number" && Number.isFinite(record.storedAt) && typeof record.preview === "string";
}
