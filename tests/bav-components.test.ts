import { describe, expect, it } from "vitest";
import { placeholderForTopic, SCIENTIFIC_DIAGRAM_KINDS, SEARCH_FILTERS } from "../lib/assets";
import { BAV_ICON_MAP } from "../lib/design-system/icons";
import { buildAdventureViewModel } from "../lib/view-models/adventure";
import { emptyAdventureState } from "../lib/adventure";
import { HOME_QUICK_ACTIONS } from "../lib/view-models/home";
import { confidenceFromScore, buildScanViewModel } from "../lib/view-models/practice";
import { isVerifiedTutorCard } from "../lib/view-models/tutor";

describe("Bav component contracts", () => {
  it("keeps a single icon family for required navigation concepts", () => {
    for (const name of ["home", "build", "play", "explore", "tutor", "camera", "lens", "simulation"] as const) {
      expect(BAV_ICON_MAP[name]).toBeTruthy();
    }
  });

  it("maps topics to scientific placeholders without stock art", () => {
    expect(placeholderForTopic("orbital mechanics")).toBe("orbit");
    expect(placeholderForTopic("wave motion")).toBe("wave");
    expect(placeholderForTopic("electric field")).toBe("field");
    expect(placeholderForTopic("ohms law circuit")).toBe("circuit");
    expect(SCIENTIFIC_DIAGRAM_KINDS).toContain("orbit");
  });

  it("builds an adventure journey from existing worlds", () => {
    const model = buildAdventureViewModel({ level: 1, adventure: emptyAdventureState("orbit") });
    expect(model.status).toBe("success");
    expect(model.chapters[0]?.unlocked).toBe(true);
    expect(model.chapters.find((chapter) => chapter.id === "timelab")?.unlocked).toBe(false);
    expect(model.activeMission?.route).toMatch(/^\/(lesson|practice|lab)$/);
  });

  it("never marks generic tutor prose as verified", () => {
    expect(isVerifiedTutorCard("assistant", false)).toBe(false);
    expect(isVerifiedTutorCard("verified", false)).toBe(false);
    expect(isVerifiedTutorCard("verified", true)).toBe(true);
  });

  it("keeps scan confidence bands educational, not decorative", () => {
    expect(confidenceFromScore(0.9)).toBe("high");
    expect(buildScanViewModel({ prompt: "Find range", speed: "", angle: "x", solved: false }).confidence).toBe("low");
    expect(buildScanViewModel({ prompt: "Find range", speed: "18", angle: "42", solved: true }).step).toBe("solve");
  });

  it("wires home CTAs and search filters to real routes/kinds", () => {
    expect(HOME_QUICK_ACTIONS.map((action) => action.route)).toEqual(["/tutor", "/scan", "/lens", "/play"]);
    expect(SEARCH_FILTERS).toEqual(["topic", "difficulty", "duration", "featured", "completed"]);
  });
});
