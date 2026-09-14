import { practiceQuestions } from "@/lib/practice";
import type { PracticeQuestion } from "@/lib/practice";
import { getPhysicsHints } from "@/lib/puzzles";
import type { ScreenStatus } from "@/lib/screen-recovery";
import { getActivePracticeQuestions } from "@/lib/mock/adapters/catalog";

export type PracticeFeedbackKind = "idle" | "correct" | "incorrect";

export type PracticeViewModel = {
  status: ScreenStatus;
  index: number;
  total: number;
  difficulty: string;
  prompt: string;
  unit: string;
  concept: string;
  hints: string[];
  feedback: PracticeFeedbackKind;
  explanation: string;
  expected?: string;
  xp: number;
};

export function buildPracticeViewModel(input: {
  index: number;
  feedback: PracticeFeedbackKind;
  expected?: number;
}): PracticeViewModel {
  const catalog = getActivePracticeQuestions();
  const questions = catalog.length ? catalog : practiceQuestions;
  const question = questions[Math.abs(input.index) % questions.length];
  const hints = getPhysicsHints(question.concept).map((hint) => hint.text);
  return {
    status: "success",
    index: Math.abs(input.index) % questions.length,
    total: questions.length,
    difficulty: difficultyFor(question),
    prompt: question.prompt,
    unit: question.unit,
    concept: question.concept,
    hints: hints.length ? hints : ["Name the principle.", "Write the equation with units.", "Substitute and inspect the result."],
    feedback: input.feedback,
    explanation: explanationFor(question, input.feedback, input.expected),
    expected: typeof input.expected === "number" ? `${input.expected.toFixed(2)} ${question.unit}` : undefined,
    xp: 10,
  };
}

function difficultyFor(question: PracticeQuestion): string {
  if (question.conceptId.includes("quantum") || question.conceptId.includes("modern")) return "Advanced";
  if (question.prompt.length > 90) return "Intermediate";
  return "Beginner";
}

function explanationFor(question: PracticeQuestion, feedback: PracticeFeedbackKind, expected?: number): string {
  if (feedback === "correct") {
    return `The verified value is ${typeof expected === "number" ? expected.toFixed(2) : "the engine result"} ${question.unit}. Keep the unit beside the number.`;
  }
  if (feedback === "incorrect") {
    return `Compare your substitution with the ${question.concept.toLowerCase()} model. A common miss is mixing units before the last arithmetic step.`;
  }
  return "";
}

export type ScanConfidence = "high" | "medium" | "low";

export type ScanViewModel = {
  status: ScreenStatus;
  step: "capture" | "review" | "solve";
  prompt: string;
  values: Array<{ name: string; value: string; unit: string }>;
  confidence: ScanConfidence;
  concept: string;
};

export function confidenceFromScore(score: number): ScanConfidence {
  if (score >= 0.85) return "high";
  if (score >= 0.55) return "medium";
  return "low";
}

export function buildScanViewModel(input: {
  prompt: string;
  speed: string;
  angle: string;
  solved: boolean;
}): ScanViewModel {
  const speed = Number(input.speed);
  const angle = Number(input.angle);
  const valid = Number.isFinite(speed) && speed > 0 && Number.isFinite(angle) && angle > 0 && angle < 90;
  return {
    status: "success",
    step: input.solved ? "solve" : "review",
    prompt: input.prompt,
    values: [
      { name: "v₀", value: input.speed, unit: "m/s" },
      { name: "θ", value: input.angle, unit: "°" },
    ],
    confidence: valid ? "medium" : "low",
    concept: "Kinematics / Projectile motion",
  };
}
