import { clone } from "../utils/clone";
import { paginate } from "../utils/pagination";
import { searchItems } from "../utils/search";
import { filterItems, sortItems } from "../utils/filter";
import { applyMockLatency } from "./latency";
import { shouldFailOperation } from "./failures";
import { getMockConfig } from "../config";
import { getMockDataset, replaceMockDataset } from "../registry";
import type { ListQuery, MockDataset, Paginated } from "../types";

async function gate(operation: string, signal?: AbortSignal): Promise<MockDataset> {
  const config = getMockConfig();
  const failure = shouldFailOperation(operation, config.failureRate, config.failOperations, config.network, `${config.scenario}:${config.learnerId}`);
  if (failure) throw failure;
  await applyMockLatency(config.latency, signal);
  return getMockDataset();
}

function searchable<T extends { id: string; title?: string; name?: string; prompt?: string; description?: string }>(items: readonly T[], query?: string): T[] {
  return query ? searchItems(items, query) : [...items];
}

export class MockLessonRepository {
  async list(query: ListQuery = {}, signal?: AbortSignal): Promise<Paginated<MockDataset["lessons"][number]>> {
    const dataset = await gate("lesson.list", signal);
    const filtered = sortItems(filterItems(searchable(dataset.lessons.map((lesson) => ({ ...lesson, name: lesson.title })), query.query), query), query.sort);
    return paginate(filtered, query.limit, query.offset, query.cursor);
  }
  async getById(id: string, signal?: AbortSignal) {
    const dataset = await gate("lesson.get", signal);
    const lesson = dataset.lessons.find((item) => item.id === id);
    return lesson ? clone(lesson) : null;
  }
}

export class MockPracticeRepository {
  async list(query: ListQuery = {}, signal?: AbortSignal): Promise<Paginated<MockDataset["problems"][number]>> {
    const dataset = await gate("practice.list", signal);
    const filtered = sortItems(filterItems(searchable(dataset.problems.map((problem) => ({ ...problem, title: problem.prompt })), query.query), query), query.sort);
    return paginate(filtered, query.limit, query.offset, query.cursor);
  }
  async getById(id: string, signal?: AbortSignal) {
    const dataset = await gate("practice.get", signal);
    const problem = dataset.problems.find((item) => item.id === id);
    return problem ? clone(problem) : null;
  }
  async recordAttempt(attempt: MockDataset["attempts"][number], signal?: AbortSignal) {
    await gate("practice.recordAttempt", signal);
    const dataset = clone(getMockDataset());
    dataset.attempts = [...dataset.attempts, clone(attempt)];
    replaceMockDataset(dataset);
    return clone(attempt);
  }
}

export class MockProgressRepository {
  async get(signal?: AbortSignal) {
    const dataset = await gate("progress.get", signal);
    return clone(dataset.learningState);
  }
}

export class MockSimulationRepository {
  async list(query: ListQuery = {}, signal?: AbortSignal) {
    const dataset = await gate("simulation.list", signal);
    const filtered = sortItems(filterItems(searchable(dataset.simulations, query.query), query), query.sort);
    return paginate(filtered, query.limit, query.offset, query.cursor);
  }
  async getById(id: string, signal?: AbortSignal) {
    const dataset = await gate("simulation.get", signal);
    return dataset.simulations.find((item) => item.id === id) ? clone(dataset.simulations.find((item) => item.id === id)!) : null;
  }
}

export class MockTutorRepository {
  async list(signal?: AbortSignal) {
    const dataset = await gate("tutor.list", signal);
    return clone(dataset.tutorSessions);
  }
  async getById(id: string, signal?: AbortSignal) {
    const dataset = await gate("tutor.get", signal);
    const session = dataset.tutorSessions.find((item) => item.id === id);
    return session ? clone(session) : null;
  }
}

export class MockNotebookRepository {
  async list(signal?: AbortSignal) {
    const dataset = await gate("notebook.list", signal);
    return clone(dataset.notebook);
  }
  async create(entry: MockDataset["notebook"][number], signal?: AbortSignal) {
    await gate("notebook.create", signal);
    const dataset = clone(getMockDataset());
    dataset.notebook = [clone(entry), ...dataset.notebook];
    replaceMockDataset(dataset);
    return clone(entry);
  }
  async delete(id: string, signal?: AbortSignal) {
    await gate("notebook.delete", signal);
    const dataset = clone(getMockDataset());
    dataset.notebook = dataset.notebook.filter((entry) => entry.id !== id);
    replaceMockDataset(dataset);
  }
}

export class MockAchievementRepository {
  async list(signal?: AbortSignal) {
    const dataset = await gate("achievement.list", signal);
    return clone(dataset.achievementStates);
  }
}

export class MockUserRepository {
  async list(signal?: AbortSignal) {
    const dataset = await gate("user.list", signal);
    return clone(dataset.users);
  }
  async getById(id: string, signal?: AbortSignal) {
    const dataset = await gate("user.get", signal);
    const user = dataset.users.find((item) => item.id === id);
    return user ? clone(user) : null;
  }
}

export const mockRepositories = {
  users: new MockUserRepository(),
  lessons: new MockLessonRepository(),
  practice: new MockPracticeRepository(),
  progress: new MockProgressRepository(),
  simulations: new MockSimulationRepository(),
  tutor: new MockTutorRepository(),
  notebook: new MockNotebookRepository(),
  achievements: new MockAchievementRepository(),
};
