import type { MockMissionStep } from "./types";

export function missionCompletionFromSteps(steps: readonly MockMissionStep[]): number {
  if (!steps.length) return 0;
  return steps.filter((step) => step.complete).length / steps.length;
}
