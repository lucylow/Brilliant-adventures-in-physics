import { describe, expect, it } from "vitest";
import {
  ADVENTURE_WORLDS,
  adventureProgress,
  completeAdventureMission,
  missionEvidenceCount,
  mergeAdventureState,
  emptyAdventureState,
  generateAdventureMissions,
  isWorldUnlocked,
  missionIsComplete,
  worldForLevel,
} from "../lib/adventure";

describe("local adventure engine", () => {
  it("selects the highest unlocked world deterministically", () => {
    expect(worldForLevel(1).id).toBe("orbit");
    expect(worldForLevel(4).id).toBe("quantum");
    expect(worldForLevel(99).id).toBe("timelab");
    expect(isWorldUnlocked(ADVENTURE_WORLDS[1], 3)).toBe(false);
  });

  it("generates stable educational missions for a world", () => {
    const missions = generateAdventureMissions("orbit");
    expect(missions).toHaveLength(3);
    expect(missions[0].id).toBe("orbit-mission-1");
    expect(missions[0].topic).toBe("projectile-motion");
    expect(missions[0].goal).toBeGreaterThan(0);
  });

  it("recovers malformed local state without trusting arbitrary values", () => {
    const recovered = mergeAdventureState({ worldId: "unknown", completedMissionIds: ["ok", 4, null], choices: "bad", flags: { safe: true, unsafe: "yes" } });
    expect(recovered).toEqual({ worldId: "orbit", completedMissionIds: ["ok"], choices: [], flags: { safe: true } });
  });

  it("completes missions idempotently and reports progress", () => {
    const missions = generateAdventureMissions("orbit");
    const initial = emptyAdventureState("orbit");
    const completed = completeAdventureMission(initial, missions[0].id);
    const repeated = completeAdventureMission(completed, missions[0].id);
    expect(repeated.completedMissionIds).toEqual([missions[0].id]);
    expect(missionIsComplete(repeated, missions[0])).toBe(true);
    expect(adventureProgress(repeated, missions)).toBeCloseTo(1 / 3);
  });

  it("counts matching practice and completion evidence without trusting unrelated topics", () => {
    const mission = generateAdventureMissions("orbit")[0];
    expect(missionEvidenceCount(mission, { "Projectile motion": { attempts: 2 }, energy: { attempts: 10 } }, [{ topic: "projectile-motion" }])).toBe(1);
    expect(missionEvidenceCount(mission, {}, [{ topic: "energy" }])).toBe(0);
    expect(missionEvidenceCount({ ...mission, goal: 2 }, { "projectile-motion": { attempts: 1 } }, [{ topic: "projectile motion" }])).toBe(2);
  });
});
