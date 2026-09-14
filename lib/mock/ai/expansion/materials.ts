import { CATALOG } from "../ai-catalog";
import { stableId } from "../../utils/ids";
import { allLearnerModels, getLearnerModel, weakConceptsOf } from "./learner-model";
import { getMisconceptionPatterns } from "./misconceptions";
import type { LearnerModelId } from "./types";

export const FLASHCARD_VARIANTS = [
  "definition",
  "fill-in-the-blank",
  "formula",
  "application",
  "diagram",
  "common-mistake",
  "compare",
  "prediction",
] as const;

export type FlashcardVariant = (typeof FLASHCARD_VARIANTS)[number];

export type GeneratedFlashcard = {
  id: string;
  conceptId: string;
  variant: FlashcardVariant;
  front: string;
  back: string;
  source: "lesson" | "conversation" | "mistake" | "experiment" | "formula";
  accessibilityLabel: string;
  messageKey: string;
};

export type QuizDistractor = {
  text: string;
  misconceptionFamily: string;
  explanation: string;
};

export type GeneratedQuizItem = {
  id: string;
  conceptId: string;
  prompt: string;
  correct: string;
  distractors: QuizDistractor[];
  learnerId: LearnerModelId;
  reason: string;
};

export type ConfidenceAccuracyCase = {
  id: string;
  learnerId: LearnerModelId;
  conceptId: string;
  confidence: number;
  correct: boolean;
  band: "high-wrong" | "low-correct" | "high-correct" | "low-wrong";
  tutorLine: string;
};

export type AnswerRevision = {
  id: string;
  trigger: "user-correction" | "missing-variable" | "unit-clarification" | "image-clarification";
  before: string;
  after: string;
  conceptId: string;
};

export type SessionAdaptation = {
  id: string;
  minutes: number;
  plannedConceptIds: string[];
  afterAccuracy: number;
  nextConceptIds: string[];
  reason: string;
};

function flashFront(variant: FlashcardVariant, title: string, equation: string): string {
  switch (variant) {
    case "definition":
      return `Define ${title} in one sentence.`;
    case "fill-in-the-blank":
      return `${equation.replace(/=.*/, "= ____")}`;
    case "formula":
      return `Write the local model for ${title}.`;
    case "application":
      return `When is ${title} the right tool, not a neighbouring quantity?`;
    case "diagram":
      return `What belongs on a diagram for ${title}?`;
    case "common-mistake":
      return `What is the usual slip on ${title}?`;
    case "compare":
      return `How is ${title} different from the quantity students mix with it?`;
    case "prediction":
      return `If one control doubles, what happens to the unknown in ${title}?`;
    default:
      return title;
  }
}

let flashCache: GeneratedFlashcard[] | null = null;

export function getGeneratedFlashcards(): GeneratedFlashcard[] {
  if (flashCache) return flashCache;
  const sources: GeneratedFlashcard["source"][] = ["lesson", "conversation", "mistake", "experiment", "formula"];
  flashCache = CATALOG.flatMap((topic) =>
    FLASHCARD_VARIANTS.map((variant, index) => {
      const source = sources[index % sources.length];
      const back =
        variant === "formula" ? topic.equation
          : variant === "common-mistake" ? topic.commonMistake
            : variant === "diagram" ? `Show the variables in ${topic.equation} with units.`
              : variant === "prediction" ? topic.followUps[0] ?? topic.oneSentence
                : topic.oneSentence;
      return {
        id: stableId("fc3", `${topic.id}-${variant}`),
        conceptId: topic.conceptId,
        variant,
        front: flashFront(variant, topic.title, topic.equation),
        back,
        source,
        accessibilityLabel: `Flashcard, ${variant}, ${topic.title}`,
        messageKey: `ai.flashcard.${variant}`,
      };
    }),
  );
  return flashCache;
}

let quizCache: GeneratedQuizItem[] | null = null;

export function getGeneratedQuizzes(): GeneratedQuizItem[] {
  if (quizCache) return quizCache;
  const models = allLearnerModels();
  const patterns = getMisconceptionPatterns();
  quizCache = models.flatMap((model) =>
    weakConceptsOf(model, 4).map((conceptId) => {
      const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
      const families = patterns.filter((item) => item.conceptId === conceptId).slice(0, 4);
      const distractors: QuizDistractor[] = families.map((item) => ({
        text:
          item.family === "sign" ? `−${topic.example.known[0]?.value ?? 1} with a silent sign flip`
            : item.family === "unit" ? `${topic.example.unknown} reported in the wrong unit`
              : item.family === "formula" ? "A neighbouring slogan in place of the governing equation"
                : item.family === "concept" ? "A different quantity that shares a word"
                  : `${item.family} slip on ${topic.title}`,
        misconceptionFamily: item.family,
        explanation: item.diagnostic,
      }));
      while (distractors.length < 4) {
        distractors.push({
          text: "An arithmetic rearrangement that drops a factor of 2",
          misconceptionFamily: "rounding",
          explanation: "A calculation error, not a new physical law.",
        });
      }
      return {
        id: stableId("qz3", `${model.id}-${conceptId}`),
        conceptId,
        prompt: `Choose the method that actually uses ${topic.equation} for ${topic.title}.`,
        correct: topic.example.principle,
        distractors: distractors.slice(0, 4),
        learnerId: model.id,
        reason: `Built from ${model.displayLabel} weakness on ${conceptId}, not a popularity list.`,
      };
    }),
  );
  return quizCache;
}

export function getConfidenceAccuracyCases(): ConfidenceAccuracyCase[] {
  const bands: ConfidenceAccuracyCase["band"][] = ["high-wrong", "low-correct", "high-correct", "low-wrong"];
  return allLearnerModels().flatMap((model) =>
    weakConceptsOf(model, 2).flatMap((conceptId) =>
      bands.map((band) => {
        const confidence = band.startsWith("high") ? 0.88 : 0.28;
        const correct = band.endsWith("correct");
        const tutorLine =
          band === "high-wrong" ? "High confidence with an incorrect result: name the skipped assumption."
            : band === "low-correct" ? "The working held. Low confidence here is calibration, not a content gap."
              : band === "high-correct" ? "Confidence matched a verified step. Keep the unit check anyway."
                : "Low confidence and an incorrect result: return to knowns and the governing equation.";
        return {
          id: stableId("cal", `${model.id}-${conceptId}-${band}`),
          learnerId: model.id,
          conceptId,
          confidence,
          correct,
          band,
          tutorLine,
        };
      }),
    ),
  );
}

export function getAnswerRevisions(): AnswerRevision[] {
  const triggers: AnswerRevision["trigger"][] = ["user-correction", "missing-variable", "unit-clarification", "image-clarification"];
  return CATALOG.flatMap((topic) =>
    triggers.map((trigger) => ({
      id: stableId("rev", `${topic.id}-${trigger}`),
      trigger,
      conceptId: topic.conceptId,
      before:
        trigger === "missing-variable" ? `Incomplete: unknown ${topic.example.unknown} with no ${topic.example.known[0]?.name ?? "known"}.`
          : `Draft using ${topic.equation} with an unstated unit.`,
      after:
        trigger === "user-correction" ? `Updated knowns from the learner: ${topic.example.known.map((item) => `${item.name}=${item.value}${item.unit}`).join(", ")}.`
          : trigger === "unit-clarification" ? `Converted into SI before substituting into ${topic.equation}.`
            : trigger === "image-clarification" ? `Used mock-detected labels from the diagram, not invented values.`
              : `Added the missing ${topic.example.known[0]?.name ?? "variable"} from the prompt.`,
    })),
  );
}

export function adaptSessionAfterPerformance(learnerId: LearnerModelId, minutes: 15 | 30 | 45, accuracy: number): SessionAdaptation {
  const model = getLearnerModel(learnerId);
  const planned = weakConceptsOf(model, 3);
  const next = accuracy < 0.45 ? planned.slice(0, 1) : accuracy > 0.85 ? planned : planned.slice(0, 2);
  return {
    id: stableId("sad", `${learnerId}-${minutes}-${Math.round(accuracy * 100)}`),
    minutes,
    plannedConceptIds: planned,
    afterAccuracy: accuracy,
    nextConceptIds: next,
    reason: accuracy < 0.45
      ? "Stay on the weakest concept; do not add a new domain."
      : accuracy > 0.85
        ? "Keep the planned mix; add one challenge item from the same concept."
        : "Trim the later items so the remaining minutes stay on the current bottleneck.",
  };
}

export const AI_MESSAGE_KEYS = {
  "ai.tutor.demoLabel": "Demo AI — development mock responses, not a live provider.",
  "ai.tutor.clarification.needUnknown": "Name the unknown and one known with its unit.",
  "ai.guardrail.unsupported": "Demo AI only answers physics-learning questions in this app.",
  "ai.guardrail.fakeCitation": "Demo AI will not invent papers or instruments.",
  "ai.formula.notCheatSheet": "Use this to reconstruct a method, not to submit as someone else's working.",
  "ai.progress.demoOnly": "Demo AI interpretation only.",
  "ai.flashcard.definition": "Definition flashcard",
  "ai.motivation.struggle": "A short, specific next step beats a longer session.",
  "ai.motivation.success": "The method held. Keep the unit line.",
  "ai.motivation.plateau": "A different representation is the next lever, not more of the same item.",
  "ai.motivation.return": "A six-minute recap is a restart, not a penalty.",
  "ai.motivation.streak": "A streak is a count, not a grade.",
} as const;

export function getMotivationByState() {
  return [
    { id: "mot-struggle", state: "struggle" as const, messageKey: "ai.motivation.struggle", message: AI_MESSAGE_KEYS["ai.motivation.struggle"] },
    { id: "mot-success", state: "success" as const, messageKey: "ai.motivation.success", message: AI_MESSAGE_KEYS["ai.motivation.success"] },
    { id: "mot-plateau", state: "plateau" as const, messageKey: "ai.motivation.plateau", message: AI_MESSAGE_KEYS["ai.motivation.plateau"] },
    { id: "mot-return", state: "return-after-absence" as const, messageKey: "ai.motivation.return", message: AI_MESSAGE_KEYS["ai.motivation.return"] },
    { id: "mot-streak", state: "streak-recovery" as const, messageKey: "ai.motivation.streak", message: AI_MESSAGE_KEYS["ai.motivation.streak"] },
  ];
}

export function getAccessibilityProfiles() {
  return [
    { id: "a11y-long", kind: "long-response", accessibilityLabel: "Long Demo AI explanation", accessibilityHint: "Scroll to read equations and the unit check." },
    { id: "a11y-eq", kind: "equation-card", accessibilityLabel: "Equation card", accessibilityHint: "Contains a governing equation with SI units." },
    { id: "a11y-badge", kind: "status-badge", accessibilityLabel: "Verification status", accessibilityHint: "Verified, mismatch, or explanation only." },
    { id: "a11y-stream", kind: "streaming", accessibilityLabel: "Streaming Demo AI response", accessibilityHint: "Text is still arriving." },
    { id: "a11y-error", kind: "error-state", accessibilityLabel: "Demo AI error", accessibilityHint: "Retry or use the local fallback." },
  ];
}

export function getDuplicateResponseFixtures() {
  const topic = CATALOG[0];
  return [
    { requestId: "dup-1", text: topic.oneSentence, duplicateOf: null },
    { requestId: "dup-1-repeat", text: topic.oneSentence, duplicateOf: "dup-1" },
    { requestId: "dup-2", text: topic.flash, duplicateOf: null },
  ];
}

export function getRetryWithContextFixtures() {
  return [
    { id: "retry-preserve", preserveContext: true, duplicateMessage: false, note: "Retry keeps the current knowns and does not append a second assistant turn." },
    { id: "retry-stale", preserveContext: false, duplicateMessage: true, note: "A stale retry would duplicate; the session layer must ignore it." },
  ];
}

export function getVerificationStatusFixtures() {
  return [
    { id: "ver-ok", status: "verified" as const, note: "Deterministic engine matched." },
    { id: "ver-round", status: "verified-after-rounding" as const, note: "Difference is rounding only." },
    { id: "ver-unit", status: "unit-mismatch" as const, note: "Number may match; unit does not." },
    { id: "ver-sign", status: "sign-mismatch" as const, note: "Magnitude may match; sign does not." },
    { id: "ver-mag", status: "magnitude-mismatch" as const, note: "Order of magnitude disagrees." },
    { id: "ver-phys", status: "physics-mismatch" as const, note: "The claimed principle is the wrong model." },
    { id: "ver-data", status: "insufficient-data" as const, note: "A required known is missing." },
  ];
}

export function getExamCoachNotes() {
  return CATALOG.map((topic) => ({
    id: stableId("exc", topic.id),
    conceptId: topic.conceptId,
    timeManagement: "Knowns first, then the model, then a unit check. Do not start algebra on an unnamed unknown.",
    topicPriority: topic.title,
    practiceStrategy: `Two items on ${topic.title} that share ${topic.equation} but not the same numbers.`,
    mistakePatterns: [topic.commonMistake, topic.misconception],
    guardrail: "This is coaching for learning, not a live exam leak.",
  }));
}
