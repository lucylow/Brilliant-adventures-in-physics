export const Platform = {
  OS: "web" as const,
  select<T>(spec: { ios?: T; android?: T; web?: T; native?: T; default?: T }): T | undefined {
    return spec.web ?? spec.default ?? spec.ios;
  },
};

const passThrough = <T,>(value: T): T => value;

export const Easing = {
  linear: passThrough,
  ease: passThrough,
  quad: passThrough,
  cubic: passThrough,
  sin: passThrough,
  out: passThrough,
  in: passThrough,
  inOut: passThrough,
};

export type EasingFunction = (value: number) => number;
export type ViewStyle = Record<string, unknown>;
export type TextStyle = Record<string, unknown>;
