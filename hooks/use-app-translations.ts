import { useEffect, useMemo, useState } from "react";
import { createAppTranslations, translate, type SupportedLocale } from "@/lib/locale";
import { loadPreferencesWithStatus } from "@/lib/preferences";

export function useAppTranslations() {
  const [locale, setLocale] = useState<SupportedLocale>("en");
  const copy = useMemo(() => createAppTranslations(), []);
  useEffect(() => {
    let active = true;
    void loadPreferencesWithStatus()
      .then((result) => {
        if (active) setLocale(result.preferences.locale);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return { locale, tr: (key: string, variables?: Record<string, string | number>) => translate(copy, locale, key, variables) };
}
