import { STORAGE_KEYS } from "@/lib/storage/storage-keys";
import { safeStorageGet, safeStorageJsonSet, safeStorageRemove, safeStorageSet } from "@/lib/storage/safe-storage";
import { assertMockOnly, getMockConfig, isMockModeEnabled } from "./config";
import { getMockDataset, invalidateMockDataset } from "./registry";
import { MOCK_DATA_VERSION, MOCK_STORAGE_KEYS } from "./version";
import { emptyAdventureState } from "@/lib/adventure";
import type { MockScenarioId } from "./types";

type MockMeta = {
  version: string;
  scenario: MockScenarioId;
  learnerId: string;
};

async function readMeta(): Promise<MockMeta | null> {
  const raw = await safeStorageGet(MOCK_STORAGE_KEYS.datasetVersion);
  if (!raw.ok || !raw.data) return null;
  try {
    const parsed = JSON.parse(raw.data) as MockMeta;
    if (!parsed.version || !parsed.scenario || !parsed.learnerId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function hydrateMockPersistence(force = false): Promise<{ hydrated: boolean; reason: string }> {
  if (!isMockModeEnabled()) return { hydrated: false, reason: "mock-disabled" };
  const config = getMockConfig();
  if (!config.persist) return { hydrated: false, reason: "persist-disabled" };
  const meta = await readMeta();
  const same = meta?.version === MOCK_DATA_VERSION && meta.scenario === config.scenario && meta.learnerId === config.learnerId;
  if (same && !force) return { hydrated: false, reason: "already-current" };

  const dataset = getMockDataset();
  const user = dataset.users.find((item) => item.id === config.learnerId) ?? dataset.users[0];
  await safeStorageJsonSet(STORAGE_KEYS.learning, dataset.learningState);
  await safeStorageJsonSet(STORAGE_KEYS.notebook, dataset.notebook.map(({ userId: _userId, favorite: _favorite, bookmark: _bookmark, conceptId: _conceptId, ...entry }) => entry));
  await safeStorageJsonSet(STORAGE_KEYS.experiments, dataset.experiments.map((experiment) => ({ id: experiment.id, title: experiment.title, points: experiment.points, summary: experiment.summary, createdAt: experiment.createdAt })));
  await safeStorageJsonSet(STORAGE_KEYS.adventure, {
    ...emptyAdventureState("orbit"),
    completedMissionIds: dataset.missions.filter((mission) => mission.completionPercent >= 1).map((mission) => mission.id),
  });
  await safeStorageJsonSet(STORAGE_KEYS.onboarding, {
    completed: dataset.auth !== "newUser",
    level: user.learnerLevel,
    goal: user.goal,
    step: 2,
  });
  if (dataset.offline.retryQueue.length) {
    await safeStorageJsonSet(STORAGE_KEYS.retryQueue, dataset.offline.retryQueue);
  }
  await safeStorageSet(MOCK_STORAGE_KEYS.datasetVersion, JSON.stringify({ version: MOCK_DATA_VERSION, scenario: config.scenario, learnerId: config.learnerId } satisfies MockMeta));
  return { hydrated: true, reason: force ? "forced" : "seeded" };
}

export async function resetMockData(): Promise<void> {
  assertMockOnly("resetMockData");
  invalidateMockDataset();
  await safeStorageRemove(MOCK_STORAGE_KEYS.datasetVersion);
  await hydrateMockPersistence(true);
}

export async function switchMockLearner(learnerId: string): Promise<void> {
  assertMockOnly("switchMockLearner");
  const { setMockLearner } = await import("./config");
  setMockLearner(learnerId);
  invalidateMockDataset();
  await hydrateMockPersistence(true);
}
