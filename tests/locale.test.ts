import { describe, expect, it } from "vitest";
import { LOCALES, TranslationStore, createAppTranslations, directionalStyle, formatDateTime, formatPercent, localeChain, physicsTerm, resolveLocale, translate, unitLabel } from "../lib/locale";

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
    expect(translate(copy, "es", "tutor.localFallback")).toContain("respaldo local");
    expect(translate(copy, "fr", "notebook.saved")).toBe("Réflexion enregistrée dans votre Notebook local.");
    expect(translate(copy, "es", "notebook.closePreview")).toBe("Cerrar vista previa");
    expect(translate(copy, "de", "notebook.previewUnavailable")).toContain("preview");
    expect(translate(copy, "fr", "notebook.retryPreview")).toBe("Réessayer l’aperçu");
    expect(translate(copy, "fr", "achievement.title")).toBe("Détails du succès");
    expect(translate(copy, "es", "achievement.earned")).toContain("aprendizaje");
    expect(translate(copy, "de", "achievement.back")).toBe("Back to progress");
    expect(translate(copy, "fr", "progress.title")).toBe("Progression");
    expect(translate(copy, "es", "progress.earned")).toBe("Obtenidos");
    expect(translate(copy, "de", "progress.retry")).toBe("Retry loading progress");
    expect(translate(copy, "fr", "home.greeting")).toBe("Bonjour, physicien");
    expect(translate(copy, "es", "home.startPractice")).toBe("Empezar práctica");
    expect(translate(copy, "de", "home.changePath")).toBe("Change learning path");
    expect(translate(copy, "fr", "onboarding.title")).toBe("Bienvenue dans PhysicaAI");
    expect(translate(copy, "es", "onboarding.goalExperiment")).toBe("Hacer experimentos");
    expect(translate(copy, "de", "onboarding.skip")).toBe("Skip setup");
    expect(translate(copy, "fr", "lab.title")).toBe("Laboratoire de physique");
    expect(translate(copy, "es", "lab.totalInternalReflection")).toBe("Reflexión interna total");
    expect(translate(copy, "de", "lab.reset")).toBe("Reset");
    expect(translate(copy, "fr", "lab.waveDescription")).toContain("v = fλ");
    expect(translate(copy, "es", "lab.thermalDescription")).toContain("4186");
    expect(translate(copy, "de", "lab.mechanicsDescription")).toBe("Use one 2 kg object to connect speed, energy, momentum, and impulse.");
    expect(translate(copy, "fr", "lab.circularHeading")).toBe("MOUVEMENT CIRCULAIRE · VÉRIFIÉ");
    expect(translate(copy, "es", "lab.circuitsHeading")).toBe("CIRCUITOS · LEY DE OHM");
    expect(translate(copy, "de", "lab.gravityHeading")).toBe("GRAVITATIONAL ENERGY · mgh");
    expect(translate(copy, "fr", "lab.kineticEnergy")).toBe("énergie cinétique");
    expect(translate(copy, "es", "lab.current")).toBe("corriente");
    expect(translate(copy, "de", "lab.power")).toBe("power");
    expect(translate(copy, "fr", "lab.learnAbout", { label: "optique" })).toBe("En savoir plus sur optique");
    expect(translate(copy, "es", "lab.learnAbout", { label: "óptica" })).toBe("Más información sobre óptica");
    expect(translate(copy, "de", "lab.learnAbout", { label: "wave motion" })).toBe("Learn about wave motion");
    expect(translate(copy, "fr", "network.offline")).toBe("Hors ligne");
    expect(translate(copy, "es", "network.checkingMessage")).toBe("Comprobando la conexión. Tu trabajo local permanece seguro.");
    expect(translate(copy, "de", "network.offlineMessage")).toBe("Offline mode: your work stays on this device and will retry when connected.");
  });

  it("formats stored timestamps with locale-aware output and safe fallback", () => {
    expect(formatDateTime("2026-08-25T03:00:00.000Z", "fr")).toMatch(/2026|25/);
    expect(formatDateTime("not-a-date", "en")).toBe("Unknown date");
  });

  it("formats percentages with a safe locale-aware formatter", () => {
    expect(formatPercent(0.5, "en")).toContain("50");
  });
});
