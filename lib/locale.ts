export type SupportedLocale = "en" | "fr" | "es" | "de" | "pt" | "ja" | "ko" | "zh-Hans" | "ar" | "hi";
export type LocaleDirection = "ltr" | "rtl";

export type LocaleInfo = { code: SupportedLocale; label: string; nativeLabel: string; direction: LocaleDirection; fallback: SupportedLocale };

export const LOCALES: LocaleInfo[] = [
  { code: "en", label: "English", nativeLabel: "English", direction: "ltr", fallback: "en" },
  { code: "fr", label: "French", nativeLabel: "Français", direction: "ltr", fallback: "en" },
  { code: "es", label: "Spanish", nativeLabel: "Español", direction: "ltr", fallback: "en" },
  { code: "de", label: "German", nativeLabel: "Deutsch", direction: "ltr", fallback: "en" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português", direction: "ltr", fallback: "en" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", direction: "ltr", fallback: "en" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", direction: "ltr", fallback: "en" },
  { code: "zh-Hans", label: "Chinese", nativeLabel: "简体中文", direction: "ltr", fallback: "en" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", direction: "rtl", fallback: "en" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", direction: "ltr", fallback: "en" },
];

export function resolveLocale(value?: string): LocaleInfo {
  const normalized = (value ?? "en").replace("_", "-").toLowerCase();
  return LOCALES.find((locale) => locale.code.toLowerCase() === normalized)
    ?? LOCALES.find((locale) => locale.code.split("-")[0].toLowerCase() === normalized.split("-")[0])
    ?? LOCALES[0];
}

export function localeChain(value: SupportedLocale | string | undefined): SupportedLocale[] {
  const locale = resolveLocale(value);
  return [...new Set([locale.code, locale.fallback, "en" as SupportedLocale])];
}

export function interpolate(text: string, variables: Record<string, string | number> = {}): string {
  return text.replace(/\{\{(.*?)\}\}/g, (_, key: string) => String(variables[key.trim()] ?? ""));
}

export class TranslationStore {
  private readonly values = new Map<string, string>();
  set(locale: SupportedLocale, key: string, value: string): void { this.values.set(`${locale}:${key}`, value); }
  get(locale: SupportedLocale, key: string): string | undefined { return this.values.get(`${locale}:${key}`); }
}

export function translate(store: TranslationStore, locale: SupportedLocale, key: string, variables: Record<string, string | number> = {}): string {
  const value = localeChain(locale).map((candidate) => store.get(candidate, key)).find(Boolean) ?? key;
  return interpolate(value, variables);
}

export type PhysicsTerm = { id: string; english: string; translations: Partial<Record<SupportedLocale, string>> };
export const PHYSICS_TERMS: PhysicsTerm[] = [
  { id: "velocity", english: "velocity", translations: { fr: "vitesse", es: "velocidad", de: "Geschwindigkeit", ja: "速度", ar: "السرعة المتجهة", hi: "वेग" } },
  { id: "acceleration", english: "acceleration", translations: { fr: "accélération", es: "aceleración", de: "Beschleunigung", ja: "加速度", ar: "التسارع", hi: "त्वरण" } },
  { id: "force", english: "force", translations: { fr: "force", es: "fuerza", de: "Kraft", ja: "力", ar: "القوة", hi: "बल" } },
];

export function physicsTerm(id: string, locale: SupportedLocale): string {
  const term = PHYSICS_TERMS.find((candidate) => candidate.id === id);
  return term?.translations[resolveLocale(locale).code] ?? term?.english ?? id;
}

export const UNIT_LABELS: Record<string, Partial<Record<SupportedLocale, string>>> = {
  m: { ar: "متر", ja: "メートル", hi: "मीटर" },
  s: { ar: "ثانية", ja: "秒", hi: "सेकंड" },
  N: { ar: "نيوتن", ja: "ニュートン", hi: "न्यूटन" },
  J: { ar: "جول", ja: "ジュール", hi: "जूल" },
};

export function unitLabel(unit: string, locale: SupportedLocale): string { return UNIT_LABELS[unit]?.[resolveLocale(locale).code] ?? unit; }
export function isRTL(locale: SupportedLocale): boolean { return resolveLocale(locale).direction === "rtl"; }
export function directionalStyle(locale: SupportedLocale): { direction: LocaleDirection } { return { direction: isRTL(locale) ? "rtl" : "ltr" }; }
export function languageInstruction(locale: SupportedLocale): string { return `Respond in ${resolveLocale(locale).nativeLabel}. Preserve equations, units, symbols, and variable names.`; }

function safeIntl<T>(fallback: string, format: () => string): string { try { return format(); } catch { return fallback; } }
export function formatNumber(value: number, locale: SupportedLocale): string { return safeIntl(String(value), () => new Intl.NumberFormat(resolveLocale(locale).code, { maximumFractionDigits: 3 }).format(value)); }
export function formatPercent(value: number, locale: SupportedLocale): string { return safeIntl(`${Math.round(value * 100)}%`, () => new Intl.NumberFormat(resolveLocale(locale).code, { style: "percent", maximumFractionDigits: 1 }).format(value)); }
export function formatScientific(value: number, locale: SupportedLocale): string { return safeIntl(String(value), () => new Intl.NumberFormat(resolveLocale(locale).code, { notation: "scientific", maximumSignificantDigits: 4 }).format(value)); }
export function formatDate(date: Date, locale: SupportedLocale): string { return safeIntl(date.toISOString().slice(0, 10), () => new Intl.DateTimeFormat(resolveLocale(locale).code, { dateStyle: "medium" }).format(date)); }
