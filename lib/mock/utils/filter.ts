import type { MockDifficulty } from "../types";

export type Filterable = {
  topicId?: string;
  difficulty?: MockDifficulty;
  featured?: boolean;
  category?: string;
  favorite?: boolean;
  estimatedMinutes?: number;
  duration?: number;
  completionPercent?: number;
};

export type FilterOptions = {
  topicId?: string;
  difficulty?: MockDifficulty;
  featured?: boolean;
  favorite?: boolean;
  category?: string;
  minMinutes?: number;
  maxMinutes?: number;
  completed?: boolean;
};

export function filterItems<T extends Filterable>(items: readonly T[], options: FilterOptions = {}): T[] {
  return items.filter((item) => {
    if (options.topicId && item.topicId !== options.topicId) return false;
    if (options.difficulty && item.difficulty !== options.difficulty) return false;
    if (options.featured !== undefined && item.featured !== options.featured) return false;
    if (options.favorite !== undefined && item.favorite !== options.favorite) return false;
    if (options.category && item.category !== options.category) return false;
    const minutes = item.estimatedMinutes ?? item.duration;
    if (options.minMinutes !== undefined && (minutes ?? 0) < options.minMinutes) return false;
    if (options.maxMinutes !== undefined && (minutes ?? Infinity) > options.maxMinutes) return false;
    if (options.completed === true && (item.completionPercent ?? 0) < 1) return false;
    if (options.completed === false && (item.completionPercent ?? 0) >= 1) return false;
    return true;
  });
}

const DIFFICULTY_ORDER: Record<MockDifficulty, number> = { easy: 0, medium: 1, hard: 2, challenge: 3 };

export function sortItems<T extends { id: string; difficulty?: MockDifficulty; featured?: boolean }>(
  items: readonly T[],
  sort: "recent" | "popular" | "difficulty" | "mastery" | "recommended" = "recommended",
  mastery?: Record<string, number>,
): T[] {
  const copy = [...items];
  copy.sort((a, b) => {
    if (sort === "difficulty") return (DIFFICULTY_ORDER[a.difficulty ?? "easy"] - DIFFICULTY_ORDER[b.difficulty ?? "easy"]) || a.id.localeCompare(b.id);
    if (sort === "mastery") return ((mastery?.[b.id] ?? 0) - (mastery?.[a.id] ?? 0)) || a.id.localeCompare(b.id);
    if (sort === "popular" || sort === "recommended") return Number(b.featured) - Number(a.featured) || a.id.localeCompare(b.id);
    return a.id.localeCompare(b.id);
  });
  return copy;
}
