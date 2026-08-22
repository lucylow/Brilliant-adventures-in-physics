import AsyncStorage from "@react-native-async-storage/async-storage";
import { consume } from "@/lib/monetization";

const STORAGE_KEY = "physicaai.usage.v1";
export type UsageState = { date: string; tutorUsed: number; tutorLimit: number };

function today() { return new Date().toISOString().slice(0, 10); }

export async function loadUsage(): Promise<UsageState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) as Partial<UsageState> : {};
    if (saved.date !== today()) return { date: today(), tutorUsed: 0, tutorLimit: 5 };
    return { date: today(), tutorUsed: Number(saved.tutorUsed) || 0, tutorLimit: Number(saved.tutorLimit) || 5 };
  } catch {
    return { date: today(), tutorUsed: 0, tutorLimit: 5 };
  }
}

export async function consumeTutorUse(): Promise<UsageState> {
  const current = await loadUsage();
  const next = consume({ used: current.tutorUsed, limit: current.tutorLimit });
  const updated = { ...current, tutorUsed: next.used };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function remainingTutorUses(state: UsageState): number { return Math.max(0, state.tutorLimit - state.tutorUsed); }
