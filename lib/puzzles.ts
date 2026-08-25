export type PuzzleDifficulty = 1 | 2 | 3 | 4 | 5;

export type PhysicsPuzzle = {
  id: string;
  title: string;
  question: string;
  topic: string;
  difficulty: PuzzleDifficulty;
  choices: readonly string[];
  correctChoice: string;
  explanation: string;
  xp: number;
};

export type PhysicsHint = {
  id: "concept" | "variables" | "units";
  text: string;
  costXp: number;
};

export type PuzzleOutcome = "correct" | "assisted-correct" | "incorrect";

const PRINCIPLES = ["Newton’s laws", "Conservation laws", "Wave behavior", "Thermodynamics"] as const;

function safeDifficulty(value: number): PuzzleDifficulty {
  return Math.min(5, Math.max(1, Math.round(Number.isFinite(value) ? value : 1))) as PuzzleDifficulty;
}

function principleForTopic(topic: string): string {
  const normalized = topic.trim().toLowerCase();
  if (normalized.includes("wave") || normalized.includes("optics")) return "Wave behavior";
  if (normalized.includes("thermal") || normalized.includes("heat")) return "Thermodynamics";
  if (normalized.includes("energy") || normalized.includes("momentum")) return "Conservation laws";
  return "Newton’s laws";
}

export function createPhysicsPuzzle(topic: string, difficulty: number, seed = 0): PhysicsPuzzle {
  const cleanTopic = topic.trim() || "motion";
  const level = safeDifficulty(difficulty);
  const correctChoice = principleForTopic(cleanTopic);
  const offset = Math.abs(Math.trunc(seed)) % PRINCIPLES.length;
  const choices = [...PRINCIPLES].sort((a, b) => (PRINCIPLES.indexOf(a) + offset) - (PRINCIPLES.indexOf(b) + offset));
  return {
    id: `puzzle-${cleanTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${level}-${Math.abs(Math.trunc(seed))}`,
    title: `${cleanTopic} challenge`,
    question: `A physics mystery involving ${cleanTopic} has appeared. Which principle should guide your first model?`,
    topic: cleanTopic,
    difficulty: level,
    choices,
    correctChoice,
    explanation: "Identify the physical system first, then choose the governing principle before calculating.",
    xp: 15 + level * 5,
  };
}

export function getPhysicsHints(topic: string): PhysicsHint[] {
  const cleanTopic = topic.trim() || "this topic";
  return [
    { id: "concept", text: `Think about the main principle behind ${cleanTopic}.`, costXp: 0 },
    { id: "variables", text: "Which variables are known, and what quantity is the target?", costXp: 0 },
    { id: "units", text: "Check the units before substituting values.", costXp: 0 },
  ];
}

export function scorePuzzleAnswer(puzzle: PhysicsPuzzle, choice: string, hintsUsed = 0): PuzzleOutcome {
  if (choice !== puzzle.correctChoice) return "incorrect";
  return hintsUsed > 0 ? "assisted-correct" : "correct";
}

export function puzzleRewardXp(puzzle: PhysicsPuzzle, outcome: PuzzleOutcome): number {
  if (outcome === "incorrect") return 0;
  if (outcome === "assisted-correct") return Math.max(5, puzzle.xp - 5);
  return puzzle.xp;
}
