/**
 * Deterministic seeded PRNG for mock data.
 * Same seed always yields the same sequence. Never use Math.random() in mock fixtures.
 */

export type SeededRandom = {
  seed: number;
  next(): number;
  randomInt(min: number, max: number): number;
  randomFloat(min: number, max: number, decimals?: number): number;
  randomBoolean(probabilityTrue?: number): boolean;
  randomChoice<T>(items: readonly T[]): T;
  weightedChoice<T>(items: readonly { item: T; weight: number }[]): T;
  shuffle<T>(items: readonly T[]): T[];
  randomDateBetween(startMs: number, endMs: number): Date;
};

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seedFrom(value: string | number): number {
  return typeof value === "number" && Number.isFinite(value) ? value >>> 0 : hashString(String(value));
}

export function createSeededRandom(seed: string | number): SeededRandom {
  const numericSeed = seedFrom(seed);
  const next = mulberry32(numericSeed);
  const rng: SeededRandom = {
    seed: numericSeed,
    next,
    randomInt(min: number, max: number): number {
      const lo = Math.ceil(Math.min(min, max));
      const hi = Math.floor(Math.max(min, max));
      if (hi <= lo) return lo;
      return lo + Math.floor(next() * (hi - lo + 1));
    },
    randomFloat(min: number, max: number, decimals = 2): number {
      const value = min + next() * (max - min);
      const factor = 10 ** decimals;
      return Math.round(value * factor) / factor;
    },
    randomBoolean(probabilityTrue = 0.5): boolean {
      return next() < probabilityTrue;
    },
    randomChoice<T>(items: readonly T[]): T {
      if (!items.length) throw new Error("randomChoice requires at least one item");
      return items[Math.floor(next() * items.length)];
    },
    weightedChoice<T>(items: readonly { item: T; weight: number }[]): T {
      const total = items.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
      if (total <= 0) throw new Error("weightedChoice requires positive weights");
      let cursor = next() * total;
      for (const entry of items) {
        cursor -= Math.max(0, entry.weight);
        if (cursor <= 0) return entry.item;
      }
      return items[items.length - 1].item;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const copy = [...items];
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(next() * (index + 1));
        [copy[index], copy[swap]] = [copy[swap], copy[index]];
      }
      return copy;
    },
    randomDateBetween(startMs: number, endMs: number): Date {
      const lo = Math.min(startMs, endMs);
      const hi = Math.max(startMs, endMs);
      return new Date(lo + next() * (hi - lo));
    },
  };
  return rng;
}

export function randomInt(rng: SeededRandom, min: number, max: number): number {
  return rng.randomInt(min, max);
}

export function randomFloat(rng: SeededRandom, min: number, max: number, decimals = 2): number {
  return rng.randomFloat(min, max, decimals);
}

export function randomChoice<T>(rng: SeededRandom, items: readonly T[]): T {
  return rng.randomChoice(items);
}

export function shuffleSeeded<T>(rng: SeededRandom, items: readonly T[]): T[] {
  return rng.shuffle(items);
}

export function weightedChoice<T>(rng: SeededRandom, items: readonly { item: T; weight: number }[]): T {
  return rng.weightedChoice(items);
}

export function randomDateBetween(rng: SeededRandom, start: Date | number, end: Date | number): Date {
  return rng.randomDateBetween(typeof start === "number" ? start : start.getTime(), typeof end === "number" ? end : end.getTime());
}

export function randomBoolean(rng: SeededRandom, probabilityTrue = 0.5): boolean {
  return rng.randomBoolean(probabilityTrue);
}
