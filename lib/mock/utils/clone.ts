export function clone<T>(value: T): T {
  return structuredClone(value);
}

export function freezeCopy<T>(value: T): T {
  return Object.freeze(clone(value)) as T;
}

export function mapCopy<T>(items: readonly T[]): T[] {
  return items.map((item) => clone(item));
}
