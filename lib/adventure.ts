export type WorldId = "orbit" | "quantum" | "mars" | "ocean" | "timelab";

export type AdventureWorld = {
  id: WorldId;
  title: string;
  description: string;
  unlockLevel: number;
  color: string;
};

export type AdventureMission = {
  id: string;
  worldId: WorldId;
  title: string;
  story: string;
  objective: string;
  topic: string;
  goal: number;
  rewardXp: number;
  requiredLevel: number;
};

import AsyncStorage from "@react-native-async-storage/async-storage";

export type AdventureState = {
  worldId: WorldId;
  completedMissionIds: string[];
  choices: string[];
  flags: Record<string, boolean>;
};

export const ADVENTURE_WORLDS: readonly AdventureWorld[] = [
  { id: "orbit", title: "Orbit Academy", description: "Use motion and forces to guide a scientific flight.", unlockLevel: 1, color: "#2563EB" },
  { id: "quantum", title: "Quantum City", description: "Explore energy scales and probability with careful models.", unlockLevel: 4, color: "#7C3AED" },
  { id: "mars", title: "Mars Expedition", description: "Use mechanics and energy to prepare a safe landing.", unlockLevel: 7, color: "#EA580C" },
  { id: "ocean", title: "Ocean Physics", description: "Investigate waves, pressure, and buoyancy.", unlockLevel: 10, color: "#0891B2" },
  { id: "timelab", title: "Time Laboratory", description: "Compare classical intuition with relativistic models.", unlockLevel: 15, color: "#9333EA" },
];

const MISSION_TEMPLATES: readonly Omit<AdventureMission, "id" | "worldId" | "requiredLevel">[] = [
  { title: "The First Trajectory", story: "A training probe needs a predictable path before launch.", objective: "Complete a projectile-motion lesson or practice question.", topic: "projectile-motion", goal: 1, rewardXp: 20 },
  { title: "The Wave Beacon", story: "A distant beacon is sending a repeating signal across the ocean.", objective: "Verify the relationship between wave speed, frequency, and wavelength.", topic: "wave-motion", goal: 1, rewardXp: 30 },
  { title: "The Energy Ledger", story: "A rover’s battery report does not balance until every unit is checked.", objective: "Solve one energy problem and keep the units visible.", topic: "energy", goal: 1, rewardXp: 30 },
];

export function worldForLevel(level: number): AdventureWorld {
  const safeLevel = Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
  return [...ADVENTURE_WORLDS].reverse().find((world) => safeLevel >= world.unlockLevel) ?? ADVENTURE_WORLDS[0];
}

export function isWorldUnlocked(world: AdventureWorld, level: number): boolean {
  return Number.isFinite(level) && level >= world.unlockLevel;
}

export function availableWorlds(level: number): AdventureWorld[] {
  return ADVENTURE_WORLDS.filter((world) => isWorldUnlocked(world, level));
}

export function generateAdventureMissions(worldId: WorldId): AdventureMission[] {
  const world = ADVENTURE_WORLDS.find((item) => item.id === worldId) ?? ADVENTURE_WORLDS[0];
  return MISSION_TEMPLATES.map((template, index) => ({
    ...template,
    id: `${world.id}-mission-${index + 1}`,
    worldId: world.id,
    requiredLevel: world.unlockLevel,
  }));
}

export function emptyAdventureState(worldId: WorldId = "orbit"): AdventureState {
  return { worldId, completedMissionIds: [], choices: [], flags: {} };
}

export function completeAdventureMission(state: AdventureState, missionId: string): AdventureState {
  if (!missionId.trim() || state.completedMissionIds.includes(missionId)) return state;
  return { ...state, completedMissionIds: [...state.completedMissionIds, missionId] };
}

export function chooseAdventurePath(state: AdventureState, choiceId: string): AdventureState {
  if (!choiceId.trim() || state.choices.includes(choiceId)) return state;
  return { ...state, choices: [...state.choices, choiceId] };
}

export function setAdventureFlag(state: AdventureState, key: string, value = true): AdventureState {
  if (!key.trim() || state.flags[key] === value) return state;
  return { ...state, flags: { ...state.flags, [key]: value } };
}

const ADVENTURE_STORAGE_KEY = "physicaai.adventure.v1";

function isWorldId(value: unknown): value is WorldId {
  return ADVENTURE_WORLDS.some((world) => world.id === value);
}

export function mergeAdventureState(input: unknown): AdventureState {
  const stored = input && typeof input === "object" ? input as Partial<AdventureState> : {};
  const flags = stored.flags && typeof stored.flags === "object" ? Object.fromEntries(Object.entries(stored.flags).filter(([, value]) => typeof value === "boolean")) : {};
  return {
    worldId: isWorldId(stored.worldId) ? stored.worldId : "orbit",
    completedMissionIds: Array.isArray(stored.completedMissionIds) ? stored.completedMissionIds.filter((value): value is string => typeof value === "string").slice(0, 100) : [],
    choices: Array.isArray(stored.choices) ? stored.choices.filter((value): value is string => typeof value === "string").slice(0, 100) : [],
    flags,
  };
}

export type AdventureLoadResult = { state: AdventureState; recovered: boolean };

export async function loadAdventureState(): Promise<AdventureLoadResult> {
  try {
    const raw = await AsyncStorage.getItem(ADVENTURE_STORAGE_KEY);
    if (!raw) return { state: emptyAdventureState(), recovered: false };
    const parsed: unknown = JSON.parse(raw);
    const state = mergeAdventureState(parsed);
    const recovered = !parsed || typeof parsed !== "object" || !isWorldId((parsed as Partial<AdventureState>).worldId);
    return { state, recovered };
  } catch {
    return { state: emptyAdventureState(), recovered: true };
  }
}

export async function saveAdventureState(state: AdventureState): Promise<AdventureState> {
  const safeState = mergeAdventureState(state);
  await AsyncStorage.setItem(ADVENTURE_STORAGE_KEY, JSON.stringify(safeState));
  return safeState;
}

export function missionIsComplete(state: AdventureState, mission: AdventureMission): boolean {
  return state.completedMissionIds.includes(mission.id);
}

function normalizedMissionTopic(topic: string): string {
  return topic.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function missionEvidenceCount(
  mission: AdventureMission,
  topicAttempts: Readonly<Record<string, { attempts: number }>>,
  completionEvents: readonly { topic: string }[] = [],
): number {
  const target = normalizedMissionTopic(mission.topic);
  if (!target) return 0;
  const practiceEvidence = Object.entries(topicAttempts).reduce((total, [topic, mastery]) => {
    if (normalizedMissionTopic(topic) !== target || !Number.isFinite(mastery.attempts) || mastery.attempts < 0) return total;
    return total + Math.floor(mastery.attempts);
  }, 0);
  const completionEvidence = completionEvents.filter((event) => normalizedMissionTopic(event.topic) === target).length;
  return Math.min(Math.max(0, Math.floor(mission.goal)), practiceEvidence + completionEvidence);
}

export function adventureProgress(state: AdventureState, missions: readonly AdventureMission[]): number {
  if (!missions.length) return 0;
  const completed = missions.filter((mission) => missionIsComplete(state, mission)).length;
  return completed / missions.length;
}
