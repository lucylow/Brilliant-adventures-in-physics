export type RequestGeneration = {
  current: () => number;
  next: () => number;
  isCurrent: (generation: number) => boolean;
};

export function createRequestGeneration(): RequestGeneration {
  let generation = 0;
  return {
    current: () => generation,
    next: () => {
      generation += 1;
      return generation;
    },
    isCurrent: (value: number) => value === generation,
  };
}

export function createStaleResponseGuard<T>() {
  const generation = createRequestGeneration();
  return {
    begin(): number {
      return generation.next();
    },
    resolve(token: number, value: T): T | undefined {
      return generation.isCurrent(token) ? value : undefined;
    },
    isCurrent(token: number): boolean {
      return generation.isCurrent(token);
    },
  };
}
