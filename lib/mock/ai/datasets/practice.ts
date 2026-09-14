import { stableId } from "../../utils/ids";
import { CATALOG } from "../ai-catalog";
import { DIFFICULTY_PROFILES } from "../ai-factories";
import { verifyTopicCalculation } from "../ai-verification";
import type {
  AnswerCheckKind,
  DifficultyBand,
  GeneratedPracticeItem,
  PracticeFeedbackResponse,
  PracticeQuestionType,
  ProblemSolutionResponse,
  VerificationStatus,
} from "../ai-types";

const QUESTION_TYPES: PracticeQuestionType[] = [
  "direct-substitution",
  "multi-step",
  "conceptual-comparison",
  "graph-interpretation",
  "unit-conversion",
  "estimation",
  "experimental-reasoning",
  "what-if",
  "error-analysis",
  "equation-selection",
];

const CHECK_KINDS: AnswerCheckKind[] = [
  "correct",
  "almostCorrect",
  "signError",
  "unitError",
  "formulaError",
  "arithmeticError",
  "conceptualError",
  "unsupportedAssumption",
];

let solutionCache: ProblemSolutionResponse[] | null = null;
let feedbackCache: PracticeFeedbackResponse[] | null = null;
let templateCache: Array<{ id: string; type: PracticeQuestionType; conceptId: string; stem: string }> | null = null;
let diagnosisCache: Array<{ id: string; student: string; expected: string; diagnosis: string; conceptId: string; kind: AnswerCheckKind }> | null = null;

export function getSolutions(): ProblemSolutionResponse[] {
  if (solutionCache) return solutionCache;
  solutionCache = CATALOG.flatMap((topic, topicIndex) =>
    DIFFICULTY_PROFILES.map((difficulty, diffIndex) => {
      const verified = verifyTopicCalculation(topic);
      const status: VerificationStatus = verified ? "verified" : "not-applicable";
      const extra = difficulty.scaffolding === "full" ? topic.beginner : difficulty.scaffolding === "partial" ? topic.standard : topic.advanced;
      return {
        problemId: stableId("sol", `${topic.id}-${difficulty.id}-${topicIndex}-${diffIndex}`),
        problem: `${difficulty.id} variant: ${topic.example.prompt}${difficulty.distractions ? ` Ignore the extra story detail that the room temperature was 20 °C unless thermal physics is required.` : ""}`,
        understanding: extra,
        knownValues: topic.example.known,
        unknown: topic.example.unknown,
        principle: topic.example.principle,
        equation: topic.equation,
        substitution: `Substitute into ${topic.equation} using ${topic.example.known.map((item) => `${item.name}=${item.value} ${item.unit}`).join(", ")}.`,
        calculation: verified
          ? `${verified.name} = ${verified.value} ${verified.unit} (deterministic physics engine).`
          : `This ${difficulty.id} item is conceptual; no invented number is presented as a live calculation.`,
        unitCheck: `The unknown ${topic.example.unknown} must carry a unit consistent with ${topic.equation}.`,
        finalAnswer: verified
          ? { value: verified.value, unit: verified.unit }
          : { value: topic.example.known[0]?.value ?? 0, unit: topic.example.known[0]?.unit ?? "1" },
        reasonablenessCheck: topic.flash,
        verificationStatus: status,
        assumptions: difficulty.id === "challenge" ? "Idealized model; neglected dissipation unless named." : undefined,
      };
    }),
  );
  return solutionCache;
}

export function getPracticeFeedback(): PracticeFeedbackResponse[] {
  if (feedbackCache) return feedbackCache;
  feedbackCache = CATALOG.flatMap((topic, topicIndex) =>
    CHECK_KINDS.map((kind, kindIndex) => {
      const copy: Record<AnswerCheckKind, { right: string; work: string; next: string }> = {
        correct: {
          right: `You identified ${topic.title} and kept the unit of ${topic.example.unknown} consistent with ${topic.equation}.`,
          work: "State the assumption you used so the next problem does not hide it.",
          next: `Try a what-if: ${topic.followUps[0]}`,
        },
        almostCorrect: {
          right: `The principle (${topic.example.principle}) is the right family.`,
          work: "A rounding or unit-prefix slip is still a physics communication error.",
          next: "Rewrite the last line with the SI prefix expanded.",
        },
        signError: {
          right: `You chose ${topic.equation}, which is the right relationship.`,
          work: "The sign/direction does not match the axis you declared.",
          next: "Redraw the positive direction, then recompute.",
        },
        unitError: {
          right: `The digits may match a consistent substitution into ${topic.equation}.`,
          work: `The quantity is ${topic.example.unknown}; its unit cannot be borrowed from a neighbour.`,
          next: "Name the unknown’s unit before arithmetic.",
        },
        formulaError: {
          right: `You listed knowns for ${topic.title}.`,
          work: `The formula used is not ${topic.equation}. Neighbouring symbols are not a license to swap models.`,
          next: `Write why ${topic.equation} matches the unknown.`,
        },
        arithmeticError: {
          right: `Setup for ${topic.title} was aligned with ${topic.example.principle}.`,
          work: "The substitution line and the arithmetic line disagree.",
          next: "Recompute with the same numbers still labeled.",
        },
        conceptualError: {
          right: "You engaged the story of the problem rather than guessing a random number.",
          work: `The concept in play is ${topic.title}, not the mix-up “${topic.misconception}”.`,
          next: topic.counterExample,
        },
        unsupportedAssumption: {
          right: `You reached for ${topic.title}, which can be relevant.`,
          work: "An assumption (no drag, ohmic, small angle, ideal gas, …) was used without stating it.",
          next: `Name the assumption in ${topic.examReview} before substituting.`,
        },
      };
      const row = copy[kind];
      return {
        id: stableId("fb", `${topic.id}-${kind}-${topicIndex}-${kindIndex}`),
        conceptId: topic.conceptId,
        whatWasRight: row.right,
        whatNeedsWork: row.work,
        concept: topic.title,
        nextStep: row.next,
        recommendedHint: `Hint: ${topic.flash}`,
        recommendedProblem: topic.example.prompt,
        checkKind: kind,
      };
    }),
  );
  return feedbackCache;
}

export function getPracticeTemplates(): Array<{ id: string; type: PracticeQuestionType; conceptId: string; stem: string }> {
  if (templateCache) return templateCache;
  templateCache = CATALOG.flatMap((topic) =>
    QUESTION_TYPES.map((type) => ({
      id: stableId("tmpl", `${topic.id}-${type}`),
      type,
      conceptId: topic.conceptId,
      stem: templateStem(topic.title, topic.equation, type, topic.example.prompt),
    })),
  );
  return templateCache;
}

function templateStem(title: string, equation: string, type: PracticeQuestionType, example: string): string {
  switch (type) {
    case "direct-substitution":
      return `Direct substitution for ${title} using ${equation}. ${example}`;
    case "multi-step":
      return `Multi-step ${title}: identify a hidden intermediate before using ${equation}.`;
    case "conceptual-comparison":
      return `Which statement about ${title} is consistent with ${equation}?`;
    case "graph-interpretation":
      return `A graph related to ${title}: what does the slope or intercept mean?`;
    case "unit-conversion":
      return `Repeat ${example} after a unit conversion (cm ↔ m, g ↔ kg, or min ↔ s).`;
    case "estimation":
      return `Order-of-magnitude estimate involving ${title} before the precise use of ${equation}.`;
    case "experimental-reasoning":
      return `A lab claims a result about ${title}. What control is missing?`;
    case "what-if":
      return `If one known in ${example} doubles, what happens according to ${equation}?`;
    case "error-analysis":
      return `A student used a neighbouring formula instead of ${equation} for ${title}. Diagnose it.`;
    case "equation-selection":
      return `From a short list, which equation actually governs ${title} here?`;
    default:
      return example;
  }
}

export function generatePracticeItem(input: {
  conceptId: string;
  difficulty: DifficultyBand;
  questionType: PracticeQuestionType;
  seed: string;
}): GeneratedPracticeItem {
  const topic = CATALOG.find((item) => item.conceptId === input.conceptId) ?? CATALOG[0];
  const verified = verifyTopicCalculation(topic);
  const template = getPracticeTemplates().find((item) => item.conceptId === topic.conceptId && item.type === input.questionType);
  return {
    id: stableId("gen", `${input.seed}-${topic.id}-${input.difficulty}-${input.questionType}`),
    conceptId: topic.conceptId,
    difficulty: input.difficulty,
    questionType: input.questionType,
    learnerLevel: input.difficulty === "intro" || input.difficulty === "easy" ? "middle-school" : input.difficulty === "challenge" ? "advanced" : "high-school",
    problem: `${template?.stem ?? topic.example.prompt} (seed ${input.seed})`,
    answer: verified ? { value: verified.value, unit: verified.unit } : { value: 0, unit: "1" },
    solution: verified
      ? `${verified.principle} gives ${verified.name} = ${verified.value} ${verified.unit}.`
      : topic.standard,
    hints: [topic.flash, `Use ${topic.equation}.`, topic.examReview],
    metadata: { seed: input.seed, templateId: template?.id ?? "none", isMock: true },
  };
}

export function getErrorDiagnoses() {
  if (diagnosisCache) return diagnosisCache;
  diagnosisCache = CATALOG.flatMap((topic, index) => {
    const verified = verifyTopicCalculation(topic);
    const expected = verified ? `${verified.value} ${verified.unit}` : `a ${topic.example.unknown} with the unit implied by ${topic.equation}`;
    return [
      {
        id: stableId("diag", `${topic.id}-unit-${index}`),
        student: verified ? `${verified.value} m/s` : "12.5 m/s",
        expected,
        diagnosis: verified
          ? `Your numerical value is consistent with the ${topic.title} calculation, but the quantity is ${verified.name}, so the unit must be ${verified.unit} rather than a borrowed neighbour unit.`
          : `The number may be plausible, but ${topic.example.unknown} is not a speed unless ${topic.equation} says so.`,
        conceptId: topic.conceptId,
        kind: "unitError" as const,
      },
      {
        id: stableId("diag", `${topic.id}-sign-${index}`),
        student: verified ? `${-Math.abs(verified.value)} ${verified.unit}` : "-12.5",
        expected,
        diagnosis: `The magnitude may match ${topic.title}, but the sign disagrees with the axis declared in the problem.`,
        conceptId: topic.conceptId,
        kind: "signError" as const,
      },
      {
        id: stableId("diag", `${topic.id}-concept-${index}`),
        student: "The object needs a force of motion to keep moving.",
        expected: topic.counterExample,
        diagnosis: `That is the misconception “${topic.misconception}”. ${topic.counterExample}`,
        conceptId: topic.conceptId,
        kind: "conceptualError" as const,
      },
      {
        id: stableId("diag", `${topic.id}-arith-${index}`),
        student: verified ? `${(verified.value * 2).toFixed(3)} ${verified.unit}` : "twice the expected value",
        expected,
        diagnosis: `Setup for ${topic.equation} looks right; the arithmetic doubled a term. Recompute without changing the model.`,
        conceptId: topic.conceptId,
        kind: "arithmeticError" as const,
      },
      {
        id: stableId("diag", `${topic.id}-formula-${index}`),
        student: "I used a neighbouring formula that shared a letter.",
        expected: topic.equation,
        diagnosis: `Sharing a symbol with ${topic.equation} is not permission to swap models for ${topic.title}.`,
        conceptId: topic.conceptId,
        kind: "formulaError" as const,
      },
    ];
  });
  return diagnosisCache;
}

export function getUnitCheckScenarios() {
  return CATALOG.flatMap((topic) => [
    { id: stableId("unit", `${topic.id}-ok`), kind: "correct" as const, conceptId: topic.conceptId, prompt: `Report ${topic.example.unknown} with the unit implied by ${topic.equation}.`, issue: "none" },
    { id: stableId("unit", `${topic.id}-missing`), kind: "missing" as const, conceptId: topic.conceptId, prompt: `A student wrote only a number for ${topic.example.unknown}.`, issue: "missing units" },
    { id: stableId("unit", `${topic.id}-mixed`), kind: "mixed" as const, conceptId: topic.conceptId, prompt: `Mass in grams mixed into ${topic.equation} with SI terms.`, issue: "mixed units" },
    { id: stableId("unit", `${topic.id}-wrong`), kind: "wrong" as const, conceptId: topic.conceptId, prompt: `Joules reported where ${topic.example.unknown} cannot be energy.`, issue: "wrong units" },
    { id: stableId("unit", `${topic.id}-convert`), kind: "conversion" as const, conceptId: topic.conceptId, prompt: `cm or minutes left unconverted before ${topic.equation}.`, issue: "unit conversion" },
    { id: stableId("unit", `${topic.id}-dim`), kind: "mismatch" as const, conceptId: topic.conceptId, prompt: `Left and right sides of a rearrangement of ${topic.equation} do not match dimensions.`, issue: "dimensional mismatch" },
  ]);
}
