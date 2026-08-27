import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCALES, resolveLocale, type SupportedLocale } from "./locale";

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

function isCompletePreferencesRecord(value: unknown): value is Preferences {
  if (!value || typeof value !== "object") return false;
  const stored = value as Partial<Preferences>;
  return typeof stored.streakEnabled === "boolean" && typeof stored.reducedMotion === "boolean" && typeof stored.hapticsEnabled === "boolean" && typeof stored.locale === "string" && LOCALES.some((locale) => locale.code === stored.locale);
}

export async function loadPreferencesWithStatus(): Promise<PreferenceLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { preferences: DEFAULTS, recovered: false };
    let parsed: unknown;
    try { parsed = JSON.parse(raw) as unknown; } catch { return { preferences: DEFAULTS, recovered: true, reason: "malformed" }; }
    if (!isCompletePreferencesRecord(parsed)) return { preferences: DEFAULTS, recovered: true, reason: "malformed" };
    return { preferences: mergePreferences(parsed), recovered: false };
  } catch {
    return { preferences: DEFAULTS, recovered: true, reason: "unavailable" };
  }
}

export async function loadPreferences(): Promise<Preferences> {
  return (await loadPreferencesWithStatus()).preferences;
}

export async function savePreferences(next: Preferences): Promise<Preferences> {
  const current = await loadPreferencesWithStatus();
  if (current.recovered) throw new Error("Preferences storage is unreadable; refusing to overwrite it");
  const normalized = mergePreferences(next);
  await AsyncStorage.setItem(KEY, JSON.stringify(normalized));
  return normalized;
}
