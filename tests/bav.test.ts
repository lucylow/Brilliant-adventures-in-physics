import { describe, expect, it } from "vitest";
import { BAV_FALLBACK_EXPERIMENTS, BAV_FALLBACK_QUESTS, BAV_PILLARS, bavPillarRoute, bavQuestProgress, boundedBAVCatalog } from "../lib/bav";

describe("BAV discovery layer", () => {
  it("maps the three pillars to existing local-first flows", () => {
    expect(BAV_PILLARS).toHaveLength(3);
    expect(bavPillarRoute("build")).toBe("/lab");
    expect(bavPillarRoute("adventure")).toBe("/progress");
    expect(bavPillarRoute("visualize")).toBe("/astronomy");
  });

  it("computes bounded quest progress from topic-local evidence", () => {
    const quest = BAV_FALLBACK_QUESTS[1];
    expect(bavQuestProgress(quest, { attempts: 2, correct: 1, savedQuestions: [], topics: { kinematics: { attempts: 1, correct: 1, hints: 0, confidenceTotal: 3 } }, streak: 0, lessonsCompleted: 0, labsCompleted: 0 })).toBe(0.5);
    expect(bavQuestProgress(quest, { attempts: 5, correct: 5, savedQuestions: [], topics: { kinematics: { attempts: 5, correct: 5, hints: 0, confidenceTotal: 15 } }, streak: 0, lessonsCompleted: 0, labsCompleted: 0 })).toBe(1);
  });

  it("bounds local fallback catalogs and rejects invalid limits", () => {
    expect(boundedBAVCatalog(BAV_FALLBACK_EXPERIMENTS, 2)).toHaveLength(2);
    expect(() => boundedBAVCatalog(BAV_FALLBACK_EXPERIMENTS, 0)).toThrow("Catalog limit must be positive");
    expect(() => bavPillarRoute("invalid" as never)).toThrow("Unknown BAV pillar");
  });
});
