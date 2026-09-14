import { ADVENTURE_WORLDS, generateAdventureMissions, isWorldUnlocked } from "@/lib/adventure";
import type { AdventureMission, AdventureState, AdventureWorld } from "@/lib/adventure";
import type { ScreenStatus } from "@/lib/screen-recovery";
import { isMockModeEnabled } from "@/lib/mock/config";
import { getActiveMissions } from "@/lib/mock/adapters/catalog";

export type AdventureChapterCard = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  color: string;
  missions: AdventureMissionCard[];
};

export type AdventureMissionCard = {
  id: string;
  title: string;
  story: string;
  objective: string;
  concepts: string[];
  rewardXp: number;
  progress: number;
  locked: boolean;
  route: "/lesson" | "/practice" | "/lab";
};

export type AdventureViewModel = {
  status: ScreenStatus;
  worldTitle: string;
  chapters: AdventureChapterCard[];
  activeMission: AdventureMissionCard | null;
};

function routeForMission(mission: AdventureMission): AdventureMissionCard["route"] {
  if (mission.topic.includes("wave")) return "/lab";
  if (mission.topic.includes("energy")) return "/practice";
  return "/lesson";
}

function toMissionCard(mission: AdventureMission, completedIds: string[], level: number): AdventureMissionCard {
  const complete = completedIds.includes(mission.id);
  return {
    id: mission.id,
    title: mission.title,
    story: mission.story,
    objective: mission.objective,
    concepts: [mission.topic.replace(/-/g, " ")],
    rewardXp: mission.rewardXp,
    progress: complete ? 1 : 0,
    locked: level < mission.requiredLevel,
    route: routeForMission(mission),
  };
}

export function buildAdventureViewModel(input: {
  level: number;
  adventure: AdventureState;
  status?: ScreenStatus;
}): AdventureViewModel {
  if (input.status && input.status !== "success") {
    return { status: input.status, worldTitle: "Adventure", chapters: [], activeMission: null };
  }
  const chapters: AdventureChapterCard[] = ADVENTURE_WORLDS.map((world: AdventureWorld) => {
    const source = isMockModeEnabled() ? getActiveMissions(world.id) : generateAdventureMissions(world.id);
    const missions = source.map((mission) => toMissionCard(mission, input.adventure.completedMissionIds, input.level));
    return {
      id: world.id,
      title: world.title,
      description: world.description,
      unlocked: isWorldUnlocked(world, input.level),
      color: world.color,
      missions,
    };
  });
  const active = chapters.find((chapter) => chapter.unlocked)?.missions.find((mission) => !mission.locked && mission.progress < 1) ?? null;
  return {
    status: chapters.every((chapter) => !chapter.unlocked) ? "empty" : "success",
    worldTitle: chapters.find((chapter) => chapter.unlocked)?.title ?? "Adventure",
    chapters,
    activeMission: active,
  };
}
