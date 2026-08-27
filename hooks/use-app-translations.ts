import { useCallback, useEffect, useMemo, useState } from "react";
import { createAppTranslations, createLocalizedAnnouncement, translate, type AnnouncementPriority, type SupportedLocale, type TranslationVariables } from "@/lib/locale";
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
  const tr = useCallback((key: string, variables?: TranslationVariables) => translate(copy, locale, key, variables), [copy, locale]);
  const announce = useCallback((key: string, priority: AnnouncementPriority = "polite", variables?: TranslationVariables) => createLocalizedAnnouncement(copy, locale, key, priority, variables), [copy, locale]);
  return { locale, tr, announce };
}
