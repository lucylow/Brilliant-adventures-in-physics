import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveLocale, type SupportedLocale } from "./locale";

const KEY = "physicaai.preferences.v1";
export type Preferences = { streakEnabled: boolean; reducedMotion: boolean; hapticsEnabled: boolean; locale: SupportedLocale };
export const DEFAULT_PREFERENCES: Preferences = { streakEnabled: true, reducedMotion: false, hapticsEnabled: true, locale: "en" };
const DEFAULTS = DEFAULT_PREFERENCES;

export function mergePreferences(input: unknown): Preferences {
  const stored = input && typeof input === "object" ? input as Partial<Preferences> : {};
  return {
    streakEnabled: typeof stored.streakEnabled === "boolean" ? stored.streakEnabled : DEFAULTS.streakEnabled,
    reducedMotion: typeof stored.reducedMotion === "boolean" ? stored.reducedMotion : DEFAULTS.reducedMotion,
    hapticsEnabled: typeof stored.hapticsEnabled === "boolean" ? stored.hapticsEnabled : DEFAULTS.hapticsEnabled,
    locale: resolveLocale(typeof stored.locale === "string" ? stored.locale : DEFAULTS.locale).code,
  };
}

export type PreferenceLoadResult = { preferences: Preferences; recovered: boolean; reason?: "malformed" | "unavailable" };

export async function loadPreferencesWithStatus(): Promise<PreferenceLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { preferences: DEFAULTS, recovered: false };
    let parsed: unknown;
    try { parsed = JSON.parse(raw) as unknown; } catch { return { preferences: DEFAULTS, recovered: true, reason: "malformed" }; }
    return { preferences: mergePreferences(parsed), recovered: false };
  } catch {
    return { preferences: DEFAULTS, recovered: true, reason: "unavailable" };
  }
}

export async function loadPreferences(): Promise<Preferences> {
  return (await loadPreferencesWithStatus()).preferences;
}

export async function savePreferences(next: Preferences): Promise<Preferences> { await AsyncStorage.setItem(KEY, JSON.stringify(next)); return next; }
