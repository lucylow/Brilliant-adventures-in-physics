import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "physicaai.preferences.v1";
export type Preferences = { streakEnabled: boolean; reducedMotion: boolean; hapticsEnabled: boolean };
const DEFAULTS: Preferences = { streakEnabled: true, reducedMotion: false, hapticsEnabled: true };

export function mergePreferences(input: unknown): Preferences {
  const stored = input && typeof input === "object" ? input as Partial<Preferences> : {};
  return {
    streakEnabled: typeof stored.streakEnabled === "boolean" ? stored.streakEnabled : DEFAULTS.streakEnabled,
    reducedMotion: typeof stored.reducedMotion === "boolean" ? stored.reducedMotion : DEFAULTS.reducedMotion,
    hapticsEnabled: typeof stored.hapticsEnabled === "boolean" ? stored.hapticsEnabled : DEFAULTS.hapticsEnabled,
  };
}

export type PreferenceLoadResult = { preferences: Preferences; recovered: boolean };

export async function loadPreferencesWithStatus(): Promise<PreferenceLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return { preferences: mergePreferences(raw ? JSON.parse(raw) : {}), recovered: false };
  } catch {
    return { preferences: DEFAULTS, recovered: true };
  }
}

export async function loadPreferences(): Promise<Preferences> {
  return (await loadPreferencesWithStatus()).preferences;
}

export async function savePreferences(next: Preferences): Promise<Preferences> { await AsyncStorage.setItem(KEY, JSON.stringify(next)); return next; }
