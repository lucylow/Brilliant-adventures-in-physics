import { describe, expect, it } from "vitest";
import { LOCALES, TranslationStore, createAppTranslations, directionalStyle, formatPercent, localeChain, physicsTerm, resolveLocale, translate, unitLabel } from "../lib/locale";

describe("localization contracts", () => {
  it("resolves regional and unsupported locales safely", () => {
    expect(resolveLocale("fr-FR").code).toBe("fr");
    expect(resolveLocale("xx").code).toBe("en");
    expect(localeChain("ar")).toEqual(["ar", "en"]);
    expect(LOCALES.length).toBe(10);
  });

  it("keeps translated terminology and units separate from equations", () => {
    expect(physicsTerm("velocity", "fr")).toBe("vitesse");
    expect(unitLabel("m", "ar")).toBe("متر");
    expect(physicsTerm("unknown", "ja")).toBe("unknown");
  });

  it("supports fallback interpolation and RTL direction", () => {
    const store = new TranslationStore();
    store.set("en", "greeting", "Hello {{name}}");
    expect(translate(store, "fr", "greeting", { name: "Ada" })).toBe("Hello Ada");
    expect(directionalStyle("ar")).toEqual({ direction: "rtl" });
  });

  it("localizes feature-screen copy with a deterministic English fallback", () => {
    const copy = createAppTranslations();
    expect(translate(copy, "fr", "media.title")).toBe("Médias de physique");
    expect(translate(copy, "fr", "lens.media.capture")).toBe("Capturer une image d’observation locale");
    expect(translate(copy, "de", "media.title")).toBe("Physics media");
    expect(translate(copy, "de", "lens.media.permission")).toBe("Permission was not granted. You can enable it in device settings.");
  });

  it("formats percentages with a safe locale-aware formatter", () => {
    expect(formatPercent(0.5, "en")).toContain("50");
  });
});
