import { xpFor, type RewardAction } from "@/lib/gamification";

export function mockXpFor(action: RewardAction, perfect = false): number {
  const base = xpFor(action);
  const bonus = perfect && action === "practice" ? 5 : 0;
  return Math.max(0, base + bonus);
}
