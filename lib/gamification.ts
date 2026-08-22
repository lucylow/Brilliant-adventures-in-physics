export type RewardAction = "lesson" | "practice" | "lab" | "review" | "mastery" | "streak" | "challenge";
export type RewardEvent = { id: string; action: RewardAction; topicId?: string; xp: number; createdAt: number };
export type PlayerProgress = { xp: number; level: number; streak: number; longestStreak: number; earnedRewardIds: string[] };
export type Mission = { id: string; title: string; goal: number; progress: number; rewardXp: number; expiresAt: number; kind: RewardAction };

export const XP: Record<RewardAction, number> = { lesson: 20, practice: 10, lab: 30, review: 8, mastery: 60, streak: 15, challenge: 40 };
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

export function xpFor(action: RewardAction): number { return XP[action]; }
export function xpForLevel(level: number): number { return Math.round(100 * Math.pow(Math.max(1, level), 1.35)); }
export function levelFromXp(xp: number): number { let level = 1; while (xp >= xpForLevel(level + 1)) level += 1; return level; }
export function levelProgress(xp: number) { const level = levelFromXp(xp); const start = xpForLevel(level); const next = xpForLevel(level + 1); return { level, progress: Math.max(0, Math.min(1, (xp - start) / (next - start))) }; }
export function capDailyXp(xp: number, cap = 500): number { return Math.min(cap, Math.max(0, xp)); }
export function missionProgress(goal: number, value: number): number { return Math.max(0, Math.min(1, value / Math.max(1, goal))); }
export function missionComplete(mission: Mission): boolean { return mission.progress >= mission.goal; }
export function generateMission(seed: number): Mission { const pool: Array<[string, number, number, RewardAction]> = [["Complete 3 practice questions", 3, 30, "practice"], ["Run one Physics Lab", 1, 35, "lab"], ["Review 2 topics", 2, 20, "review"]]; const item = pool[Math.abs(seed) % pool.length]; return { id: `daily-${seed}`, title: item[0], goal: item[1], progress: 0, rewardXp: item[2], expiresAt: Date.now() + 86400000, kind: item[3] }; }
export function updateStreak(lastDate: string | null, today: string, current: number): number { if (!lastDate) return 1; const days = (Date.parse(today) - Date.parse(lastDate)) / 86400000; return days === 0 ? current : days === 1 ? current + 1 : 1; }
export function isStreakMilestone(days: number): boolean { return STREAK_MILESTONES.includes(days); }
export function streakMessage(days: number): string { return days < 3 ? "Nice start. Keep it manageable." : days < 7 ? "You’re building consistency." : "Great consistency. Focus on understanding, not the number."; }
export function makeReward(action: RewardAction, topicId?: string): RewardEvent { return { id: `${action}-${topicId ?? "general"}-${Date.now()}`, action, topicId, xp: xpFor(action), createdAt: Date.now() }; }
export class RewardDeduper { private readonly seen = new Set<string>(); claim(id: string): boolean { if (this.seen.has(id)) return false; this.seen.add(id); return true; } }
export function badgeTier(score: number): "bronze" | "silver" | "gold" | "platinum" { return score >= 0.95 ? "platinum" : score >= 0.8 ? "gold" : score >= 0.6 ? "silver" : "bronze"; }
export function masteryReward(before: number, after: number): number { return after >= 0.8 && before < 0.8 ? 100 : Math.max(0, Math.round((after - before) * 150)); }
export function reflectionReward(text: string): number { return text.trim().length >= 50 ? 10 : 0; }
