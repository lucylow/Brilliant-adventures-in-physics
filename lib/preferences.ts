import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "physicaai.preferences.v1";
export type Preferences = { streakEnabled: boolean; reducedMotion: boolean };
const DEFAULTS: Preferences = { streakEnabled: true, reducedMotion: false };

export async function loadPreferences(): Promise<Preferences> {
  try { const raw = await AsyncStorage.getItem(KEY); return { ...DEFAULTS, ...(raw ? JSON.parse(raw) : {}) }; } catch { return DEFAULTS; }
}
export async function savePreferences(next: Preferences): Promise<Preferences> { await AsyncStorage.setItem(KEY, JSON.stringify(next)); return next; }
