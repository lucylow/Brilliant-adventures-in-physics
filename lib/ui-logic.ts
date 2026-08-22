export function clampStepValue(value: number, delta: number, min: number, max: number): number {
  if (![value, delta, min, max].every(Number.isFinite)) throw new Error("slider values must be finite");
  if (min > max) throw new Error("slider min must not exceed max");
  return Math.max(min, Math.min(max, Number((value + delta).toFixed(2))));
}

export function sliderBoundaryState(value: number, min: number, max: number): { atMin: boolean; atMax: boolean } {
  if (![value, min, max].every(Number.isFinite)) throw new Error("slider values must be finite");
  if (min > max) throw new Error("slider min must not exceed max");
  return { atMin: value <= min, atMax: value >= max };
}

export function sliderAccessibilityValue(value: number, min: number, max: number) {
  return { min, max, now: Math.max(min, Math.min(max, value)) };
}

export function sliderValueLabel(label: string, value: number): string {
  return `${label}: ${value}`;
}

export function sliderStepHint(direction: "increase" | "decrease", label: string, step: number): string {
  return `${direction === "increase" ? "Increases" : "Decreases"} ${label} by ${step}`;
}

export function isSliderAtMin(value: number, min: number): boolean { return value <= min; }
export function isSliderAtMax(value: number, max: number): boolean { return value >= max; }

export function sliderProgressPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}
