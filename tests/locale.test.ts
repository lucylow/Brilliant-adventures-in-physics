import { describe, expect, it } from "vitest";
import { LOCALES, TranslationStore, directionalStyle, formatPercent, localeChain, physicsTerm, resolveLocale, translate, unitLabel } from "../lib/locale";

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

  it("formats percentages with a safe locale-aware formatter", () => {
    expect(formatPercent(0.5, "en")).toContain("50");
  });
});
