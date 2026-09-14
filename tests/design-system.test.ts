import { describe, expect, it } from "vitest";
import { BAV_BRAND, bottomNavClearance, clampUnit, duration, layout, quickActionTints, screenGutter, spacing, touchTarget, withAlpha } from "../lib/design-system";
import { greetingForHour, formatHomeDate, firstName, initialsFrom, masteryFromLearning, xpFromLearning, buildHomeViewModel, HOME_QUICK_ACTIONS } from "../lib/view-models/home";
import { buildLabViewModel, LAB_CATEGORIES } from "../lib/view-models/lab";
import { buildProgressViewModel } from "../lib/view-models/progress";
import { buildPracticeViewModel, confidenceFromScore, buildScanViewModel } from "../lib/view-models/practice";
import { buildTutorViewModel, isVerifiedTutorCard } from "../lib/view-models/tutor";
import { materialIconName } from "../lib/design-system/icons";
import { FIGMA_HOME_FIXTURE } from "../lib/mock/catalog";
import { resetMockConfig, setMockConfig } from "../lib/mock/config";
import { uiTokens } from "../lib/ui-system";

describe("B.A.V. design tokens", () => {
  it("keeps premium blue identity and accessible touch targets", () => {
    expect(BAV_BRAND.tutorName).toBe("Bavi");
    expect(touchTarget.minimum).toBeGreaterThanOrEqual(44);
    expect(uiTokens.touch.minimum).toBeGreaterThanOrEqual(44);
    expect(layout.screenPadding).toBe(20);
    expect(spacing.md).toBe(16);
    expect(duration.press).toBeLessThan(duration.progress);
  });

  it("computes gutters and bottom-nav clearance without hardcoded widths", () => {
    expect(screenGutter(320)).toBe(16);
    expect(screenGutter(390)).toBe(20);
    expect(screenGutter(768)).toBe(28);
    expect(bottomNavClearance(34)).toBeGreaterThan(layout.bottomNavHeight);
  });

  it("keeps quick-action tints in one family", () => {
    expect(quickActionTints.tutor.accent).toMatch(/^#/);
    expect(quickActionTints.scan.accent).toBe("#2563EB");
    expect(withAlpha("#2563EB", 0.5)).toHaveLength(9);
  });

  it("maps a single icon family", () => {
    expect(materialIconName("home")).toBe("home");
    expect(materialIconName("tutor")).toBe("chat-bubble");
    expect(materialIconName("lens")).toBe("biotech");
  });
});

describe("Home view model", () => {
  it("greets by hour without hardcoding a learner name", () => {
    expect(greetingForHour(8)).toBe("Good morning");
    expect(greetingForHour(15)).toBe("Good afternoon");
    expect(greetingForHour(21)).toBe("Good evening");
    expect(firstName("Maya Chen")).toBe("Maya");
    expect(initialsFrom("Maya Chen")).toBe("MC");
    expect(formatHomeDate(new Date("2026-09-14T12:00:00Z"), "en")).toContain("September");
  });

  it("derives XP and mastery from learning state", () => {
    const learning = { attempts: 10, correct: 8, savedQuestions: [], topics: { kinematics: { attempts: 4, correct: 3, hints: 0, confidenceTotal: 0 } }, streak: 3, lessonsCompleted: 2, labsCompleted: 1 };
    expect(masteryFromLearning(learning)).toBeCloseTo(0.8);
    expect(xpFromLearning(learning)).toBe(8 * 10 + 40 + 30);
  });

  it("wires four Figma quick actions to real routes", () => {
    expect(HOME_QUICK_ACTIONS.map((action) => action.route)).toEqual(["/tutor", "/scan", "/lens", "/play"]);
  });

  it("can build a visual fixture without treating it as production identity", () => {
    const model = buildHomeViewModel({
      learning: { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 },
      onboarding: { completed: true, level: "school", goal: "practice", step: 2 },
      streakEnabled: true,
      now: new Date("2026-09-14T09:00:00"),
      useVisualFixture: true,
    });
    expect(model.displayName).toBe("Maya");
    expect(model.xp).toBe(FIGMA_HOME_FIXTURE.xp);
    expect(model.continueAdventure?.title).toBe("Orbital Mechanics");
    expect(model.dailyChallenge?.route).toBe("/practice");
  });

  it("keeps empty and error statuses explicit", () => {
    const error = buildHomeViewModel({
      learning: { attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 },
      onboarding: { completed: false, level: "new", goal: "understand", step: 0 },
      streakEnabled: true,
      status: "error",
    });
    expect(error.status).toBe("error");
    expect(error.continueAdventure).toBeNull();
  });
});

describe("Lab, progress, practice, scan, tutor view models", () => {
  it("filters the Build catalog by category", () => {
    expect(LAB_CATEGORIES).toContain("Quantum");
    const mechanics = buildLabViewModel("Mechanics");
    expect(mechanics.items.every((item) => item.concept.startsWith("Mechanics"))).toBe(true);
    expect(buildLabViewModel("All").items.length).toBeGreaterThan(mechanics.items.length);
  });

  it("builds progress insights without inventing backend numbers", () => {
    resetMockConfig();
    setMockConfig({ mode: "disabled" });
    const empty = buildProgressViewModel({ attempts: 0, correct: 0, savedQuestions: [], topics: {}, streak: 0, lessonsCompleted: 0, labsCompleted: 0 });
    expect(empty.status).toBe("empty");
    expect(empty.weekly).toHaveLength(7);
    resetMockConfig();
  });

  it("scores practice and scan confidence", () => {
    const practice = buildPracticeViewModel({ index: 0, feedback: "correct", expected: 12.3 });
    expect(practice.prompt.length).toBeGreaterThan(10);
    expect(practice.unit).toBeTruthy();
    expect(confidenceFromScore(0.9)).toBe("high");
    expect(confidenceFromScore(0.6)).toBe("medium");
    expect(confidenceFromScore(0.2)).toBe("low");
    const scan = buildScanViewModel({ prompt: "A ball is launched", speed: "18", angle: "42", solved: false });
    expect(scan.confidence).toBe("medium");
    expect(scan.values).toHaveLength(2);
  });

  it("never labels generic tutor prose as verified", () => {
    expect(isVerifiedTutorCard("assistant", false)).toBe(false);
    expect(isVerifiedTutorCard("verified", true)).toBe(true);
    const tutor = buildTutorViewModel({ remaining: 4, limit: 5, draft: "Why?", submitting: false, messages: [{ role: "user", text: "Why?" }] });
    expect(tutor.inputState).toBe("typing");
    expect(tutor.title).toBe("Bavi");
  });
});

describe("Progress ring math", () => {
  it("clamps non-finite percentages", () => {
    expect(clampUnit(1.4)).toBe(1);
    expect(clampUnit(-2)).toBe(0);
    expect(clampUnit(Number.NaN)).toBe(0);
  });
});
