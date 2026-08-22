import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "physicaai.preferences.v1";
export type Preferences = { streakEnabled: boolean; reducedMotion: boolean; hapticsEnabled: boolean };
const DEFAULTS: Preferences = { streakEnabled: true, reducedMotion: false, hapticsEnabled: true };

export function mergePreferences(input: unknown): Preferences {
  const stored = input && typeof input === "object" ? input as Partial<Preferences> : {};
  return { ...DEFAULTS, ...stored, hapticsEnabled: stored.hapticsEnabled !== false };
}

export async function loadPreferences(): Promise<Preferences> {
  try { const raw = await AsyncStorage.getItem(KEY); return mergePreferences(raw ? JSON.parse(raw) : {}); } catch { return DEFAULTS; }
}
export async function savePreferences(next: Preferences): Promise<Preferences> { await AsyncStorage.setItem(KEY, JSON.stringify(next)); return next; }
