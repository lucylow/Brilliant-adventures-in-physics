import AsyncStorage from "@react-native-async-storage/async-storage";
import { consume } from "./monetization";

const STORAGE_KEY = "physicaai.usage.v1";
export type UsageState = { date: string; tutorUsed: number; tutorLimit: number };

function today() { return new Date().toISOString().slice(0, 10); }

export type UsageLoadResult = { usage: UsageState; recovered: boolean };

function defaults(): UsageState { return { date: today(), tutorUsed: 0, tutorLimit: 5 }; }

export async function loadUsageWithStatus(): Promise<UsageLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) as Partial<UsageState> : {};
    if (saved.date !== today()) return { usage: defaults(), recovered: false };
    const tutorUsed = Number(saved.tutorUsed);
    const tutorLimit = Number(saved.tutorLimit);
    if (!Number.isFinite(tutorUsed) || !Number.isFinite(tutorLimit) || tutorUsed < 0 || tutorLimit <= 0) return { usage: defaults(), recovered: true };
    return { usage: { date: today(), tutorUsed: Math.min(tutorUsed, tutorLimit), tutorLimit }, recovered: false };
  } catch {
    return { usage: defaults(), recovered: true };
  }
}

export async function loadUsage(): Promise<UsageState> {
  return (await loadUsageWithStatus()).usage;
}

export async function consumeTutorUse(): Promise<UsageState> {
  const current = await loadUsage();
  const next = consume({ used: current.tutorUsed, limit: current.tutorLimit });
  const updated = { ...current, tutorUsed: next.used };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function remainingTutorUses(state: UsageState): number { return Math.max(0, state.tutorLimit - state.tutorUsed); }
