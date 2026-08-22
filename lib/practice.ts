import { projectile } from "./physics";

export type PracticeQuestion = { id: string; prompt: string; unit: string; solve: () => number; concept: string; conceptId: string };

export const practiceQuestions: PracticeQuestion[] = [
  { id: "projectile-range", prompt: "A ball is launched at 18 m/s at 42° from level ground. What is its horizontal range?", unit: "m", solve: () => projectile({ speed: 18, angleDeg: 42, height: 0 }).range, concept: "Projectile motion", conceptId: "kinematics" },
  { id: "final-velocity", prompt: "A car starts at 4 m/s and accelerates at 2 m/s² for 5 s. What is its final velocity?", unit: "m/s", solve: () => 4 + 2 * 5, concept: "Kinematics", conceptId: "kinematics" },
];

export function practiceQuestionIndexForConcept(conceptId: string): number | null {
  const normalized = conceptId.trim().toLowerCase();
  const index = practiceQuestions.findIndex((question) => question.conceptId === normalized);
  return index >= 0 ? index : null;
}

export function hasPracticeQuestion(conceptId: string): boolean {
  return practiceQuestionIndexForConcept(conceptId) !== null;
}
