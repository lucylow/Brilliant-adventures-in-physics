export type EducationLevel = "middle-school" | "high-school" | "intro-college" | "advanced";
export type LearningMode = "lesson" | "practice" | "lab" | "review" | "exam";
export type MasteryState = "new" | "developing" | "practicing" | "strong" | "review";
export type HintLevel = "concept" | "representation" | "equation" | "substitution" | "completion";

export type CurriculumTopic = { id: string; title: string; level: EducationLevel; prerequisites: string[]; objectives: string[]; lessonIds: string[] };
export type LessonBlock = { type: "explain" | "equation" | "example" | "check" | "simulation" | "reflection"; data: Record<string, unknown> };
export type Lesson = { id: string; topicId: string; title: string; durationMin: number; objectiveIds: string[]; blocks: LessonBlock[] };

export const curriculum: CurriculumTopic[] = [
  { id: "kinematics", title: "Kinematics", level: "high-school", prerequisites: [], objectives: ["describe motion", "use motion equations"], lessonIds: ["kinematics-foundations"] },
  { id: "projectile-motion", title: "Projectile motion", level: "high-school", prerequisites: ["kinematics"], objectives: ["separate horizontal and vertical motion", "predict range"], lessonIds: ["projectile-foundations"] },
  { id: "newtons-laws", title: "Newton’s laws", level: "high-school", prerequisites: ["kinematics"], objectives: ["draw free-body diagrams", "relate force and acceleration"], lessonIds: ["newton-foundations"] },
];

export const projectileLesson: Lesson = {
  id: "projectile-foundations", topicId: "projectile-motion", title: "Read a projectile’s path", durationMin: 8, objectiveIds: ["separate horizontal and vertical motion"],
  blocks: [
    { type: "explain", data: { title: "Two motions at once", body: "A projectile keeps its horizontal speed while gravity changes its vertical speed." } },
    { type: "equation", data: { formula: "y = y₀ + vᵧt − ½gt²", caption: "Vertical position" } },
    { type: "simulation", data: { route: "/lab", label: "Open projectile simulation" } },
    { type: "reflection", data: { prompt: "What would change if the launch speed increased?" } },
  ],
};

export function unmetPrereqs(topicId: string, mastery: Record<string, number>, threshold = 0.7): string[] {
  const topic = curriculum.find((item) => item.id === topicId);
  return (topic?.prerequisites ?? []).filter((id) => (mastery[id] ?? 0) < threshold);
}

export function masteryState(score: number): MasteryState {
  if (score < 0.2) return "new";
  if (score < 0.5) return "developing";
  if (score < 0.8) return "practicing";
  return "strong";
}

export function updateMastery(previous: number, correct: boolean, hints: number, confidence: number): number {
  const delta = correct ? 0.08 : -0.05;
  const hintPenalty = correct ? Math.min(0.04, hints * 0.01) : 0;
  return Math.max(0, Math.min(1, previous + delta - hintPenalty + (confidence - 0.5) * 0.02));
}

export function hintFor(level: HintLevel): string {
  return {
    concept: "Identify the physics idea involved.",
    representation: "Sketch the situation and label the known values.",
    equation: "Choose the equation that connects the target to the known values.",
    substitution: "Substitute values carefully and keep the units visible.",
    completion: "Complete the final arithmetic, then check the result’s unit and size.",
  }[level];
}

export function nextHintLevel(current: HintLevel): HintLevel {
  const levels: HintLevel[] = ["concept", "representation", "equation", "substitution", "completion"];
  return levels[Math.min(levels.length - 1, levels.indexOf(current) + 1)];
}

export function reflectionPrompt(correct: boolean): string {
  return correct ? "What clue helped you choose the right principle?" : "Which step became uncertain, and what evidence would resolve it?";
}

export function percentError(observed: number, theoretical: number): number {
  return 100 * Math.abs(observed - theoretical) / (Math.abs(theoretical) + 1e-12);
}

export function gradeFeedback(score: number, missing: string[]): string {
  return score >= 0.85 ? "Strong reasoning. Add one explicit unit check." : `Review ${missing.join(", ") || "the explanation and units"}.`;
}
