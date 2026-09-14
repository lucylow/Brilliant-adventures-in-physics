import { isoDateDaysAgo } from "../../clock";
import { stableId } from "../../utils/ids";
import { CATALOG } from "../ai-catalog";
import { PERSONAS } from "../ai-personas";
import type {
  ConversationSummary,
  DailyCoachMessage,
  ExamAnalysisResponse,
  FlashcardRecord,
  LearningPlanResponse,
  ProgressNarrative,
  QuizSet,
  RankedRecommendation,
} from "../ai-types";
import { conversationTitleFor, getTutorConversations } from "./conversations";

let planCache: LearningPlanResponse[] | null = null;
let coachCache: DailyCoachMessage[] | null = null;
let flashCache: FlashcardRecord[] | null = null;
let quizCache: QuizSet[] | null = null;
let recReasonCache: string[] | null = null;
let summaryCache: ConversationSummary[] | null = null;

export function getLearningPlans(): LearningPlanResponse[] {
  if (planCache) return planCache;
  const goals = [
    "Build a secure kinematics-to-energy path",
    "Exam week: mechanics papers",
    "Weekend waves and sound",
    "30-day electricity mastery",
    "Catch up fluids and thermal",
    "Modern physics without folklore",
    "Lab-first measurement habits",
    "Unit-check discipline",
  ];
  planCache = goals.flatMap((goal, goalIndex) =>
    CATALOG.slice(0, 13).map((topic, sliceIndex) => {
      const sequence = CATALOG.slice((goalIndex + sliceIndex) % CATALOG.length, ((goalIndex + sliceIndex) % CATALOG.length) + 5).map((item) => item.title);
      const padded = sequence.length < 5 ? sequence.concat(CATALOG.slice(0, 5 - sequence.length).map((item) => item.title)) : sequence;
      return {
        id: stableId("plan", `${goalIndex}-${topic.id}`),
        goal: `${goal}: ${topic.title}`,
        currentLevel: goalIndex % 2 === 0 ? "high-school" : "intro-college",
        recommendedSequence: padded,
        estimatedDuration: ["30-minute session", "1-hour session", "weekend study", "exam week", "7-day catch-up", "30-day mastery"][(goalIndex + sliceIndex) % 6],
        priorityConcepts: [topic.conceptId, CATALOG[(goalIndex + 3) % CATALOG.length].conceptId],
        reviewSchedule: ["Day 1: worked example", "Day 2: mixed units", "Day 4: transfer problem", "Day 7: exam-style"],
        milestones: [`Explain ${topic.oneSentence}`, `Complete ${topic.experiment.name}`, `Pass a unit check on ${topic.equation}`],
      };
    }),
  );
  return planCache;
}

export function getDailyCoachMessages(): DailyCoachMessage[] {
  if (coachCache) return coachCache;
  const kinds: DailyCoachMessage["kind"][] = ["streak", "review", "concept", "experiment", "reflection", "challenge"];
  coachCache = Array.from({ length: 96 }, (_, day) => {
    const topic = CATALOG[day % CATALOG.length];
    const kind = kinds[day % kinds.length];
    const bodies: Record<DailyCoachMessage["kind"], string> = {
      streak: `You studied yesterday. A short ${topic.title} recap keeps the model warm — no guilt if today is lighter.`,
      review: `A weak spot worth a five-minute review: ${topic.commonMistake}`,
      concept: `Today’s concept suggestion: ${topic.oneSentence}`,
      experiment: `If you have ten minutes: ${topic.experiment.name}. Objective: ${topic.experiment.objective}`,
      reflection: `Reflection: which assumption in ${topic.title} did you actually use last time?`,
      challenge: `Optional challenge (not a demand): ${topic.example.prompt}`,
    };
    return {
      day: day + 1,
      kind,
      title: `${kind} · ${topic.title}`,
      body: bodies[kind],
    };
  });
  return coachCache;
}

export function getFlashcards(): FlashcardRecord[] {
  if (flashCache) return flashCache;
  const types: FlashcardRecord["type"][] = ["definition", "equation", "application", "misconception", "unit", "visual", "compare-contrast"];
  flashCache = CATALOG.flatMap((topic) =>
    types.map((type) => ({
      id: stableId("card", `${topic.id}-${type}`),
      conceptId: topic.conceptId,
      type,
      front: frontFor(type, topic.title, topic.equation),
      back: backFor(type, topic),
      lessonId: topic.lessonId,
    })),
  );
  const extras = CATALOG.flatMap((topic) =>
    topic.followUps.slice(0, 3).map((prompt, index) => ({
      id: stableId("card", `${topic.id}-follow-${index}`),
      conceptId: topic.conceptId,
      type: "application" as const,
      front: prompt,
      back: `${topic.beginner} ${topic.flash}`,
      lessonId: topic.lessonId,
    })),
  );
  flashCache = [...flashCache, ...extras];
  return flashCache;
}

function frontFor(type: FlashcardRecord["type"], title: string, equation: string): string {
  switch (type) {
    case "definition":
      return `Define ${title} in one careful sentence.`;
    case "equation":
      return `Write the governing equation for ${title}.`;
    case "application":
      return `When is ${title} the right model?`;
    case "misconception":
      return `Name a common mix-up about ${title}.`;
    case "unit":
      return `What unit belongs with the unknown in ${equation}?`;
    case "visual":
      return `What should a sketch of ${title} include?`;
    case "compare-contrast":
      return `What is ${title} easily confused with?`;
    default:
      return title;
  }
}

function backFor(type: FlashcardRecord["type"], topic: (typeof CATALOG)[number]): string {
  switch (type) {
    case "definition":
      return topic.oneSentence;
    case "equation":
      return topic.equation;
    case "application":
      return topic.example.principle;
    case "misconception":
      return `${topic.misconception} Counterexample: ${topic.counterExample}`;
    case "unit":
      return `Keep the unit of ${topic.example.unknown} consistent with ${topic.equation}.`;
    case "visual":
      return `Label the variables in ${topic.equation}. Simulation: ${topic.simulationId}.`;
    case "compare-contrast":
      return topic.examReview;
    default:
      return topic.flash;
  }
}

export function getQuizSets(): QuizSet[] {
  if (quizCache) return quizCache;
  quizCache = CATALOG.map((topic, index) => {
    const questions = [
      { prompt: topic.starters[0] ?? `What is ${topic.title}?`, answer: topic.oneSentence, explanation: topic.beginner },
      { prompt: `Which equation governs ${topic.title}?`, choices: [topic.equation, "F = mv", "P = mv", "Q = IT"], answer: topic.equation, explanation: `The model is ${topic.equation}.` },
      { prompt: `Name a mistake in ${topic.title}.`, answer: topic.commonMistake, explanation: topic.counterExample },
      { prompt: topic.example.prompt, answer: topic.example.unknown, explanation: topic.example.principle },
    ];
    return {
      id: stableId("quiz", topic.id),
      title: `${topic.title} check (${index % 2 === 0 ? "core" : "transfer"})`,
      conceptId: topic.conceptId,
      difficulty: index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard",
      estimatedTime: "8 min",
      questions,
      answerKey: questions.map((item) => item.answer),
    };
  });
  const extra = CATALOG.map((topic, index) => {
    const partner = CATALOG[(index + 5) % CATALOG.length];
    const questions = [
      { prompt: `Contrast ${topic.title} with ${partner.title}.`, answer: `${topic.oneSentence} versus ${partner.oneSentence}`, explanation: topic.examReview },
      { prompt: `Which experiment helps ${topic.title}?`, answer: topic.experiment.name, explanation: topic.experiment.objective },
      { prompt: `What limitation belongs to the analogy for ${topic.title}?`, answer: topic.analogy.limitation, explanation: topic.analogy.mapping },
    ];
    return {
      id: stableId("quiz", `${topic.id}-mix`),
      title: `Mixed: ${topic.title}`,
      conceptId: topic.conceptId,
      difficulty: "medium" as const,
      estimatedTime: "10 min",
      questions,
      answerKey: questions.map((item) => item.answer),
    };
  });
  const examish = CATALOG.slice(0, 40).map((topic) => {
    const questions = [
      { prompt: `Exam trap for ${topic.title}?`, answer: topic.commonMistake, explanation: topic.examReview },
      { prompt: `First line of working?`, answer: "Knowns with units, then principle.", explanation: topic.flash },
      { prompt: topic.example.prompt, answer: topic.equation, explanation: topic.example.principle },
    ];
    return {
      id: stableId("quiz", `${topic.id}-exam`),
      title: `Exam prep: ${topic.title}`,
      conceptId: topic.conceptId,
      difficulty: "hard" as const,
      estimatedTime: "12 min",
      questions,
      answerKey: questions.map((item) => item.answer),
    };
  });
  const visual = CATALOG.map((topic) => {
    const questions = [
      { prompt: `What should a sketch of ${topic.title} include?`, answer: `Variables from ${topic.equation} and a declared positive direction.`, explanation: topic.intuitionFirst },
      { prompt: `Which simulation?`, answer: topic.simulationId, explanation: topic.experiment.name },
    ];
    return {
      id: stableId("quiz", `${topic.id}-visual`),
      title: `Visual: ${topic.title}`,
      conceptId: topic.conceptId,
      difficulty: "easy" as const,
      estimatedTime: "6 min",
      questions,
      answerKey: questions.map((item) => item.answer),
    };
  });
  quizCache = [...quizCache, ...extra, ...examish, ...visual];
  return quizCache;
}

export function getRecommendationReasons(): string[] {
  if (recReasonCache) return recReasonCache;
  recReasonCache = CATALOG.flatMap((topic) => [
    `Your recent attempts on ${topic.title} show unit slips, so a targeted review of ${topic.equation} is next.`,
    `Mastery on ${topic.title} is strong enough to try the related simulation ${topic.simulationId}.`,
    `You have not yet completed ${topic.lessonId}, which is the local lesson for ${topic.title}.`,
    `A recurring mistake matches “${topic.misconception}”, so a misconception-correction Tutor turn is ranked higher than a random popular item.`,
    `Your stated goal needs ${topic.title} as a prerequisite before the next concept in the orbit.`,
    `Streak-friendly: a 6-minute flash explanation of ${topic.oneSentence} without adding guilt if you skip.`,
    `Exam preference: ${topic.examReview}`,
  ]);
  return recReasonCache;
}

export function rankRecommendations(input: {
  mastery: Record<string, number>;
  recentMistakes: string[];
  completedLessons: string[];
  timeAvailableMin: number;
  goal: string;
  difficultyPreference: string;
  recentTopics: string[];
}): { items: RankedRecommendation[]; learnerSummary: string } {
  const items = CATALOG.map((topic) => {
    const mastery = input.mastery[topic.conceptId] ?? 0;
    const mistakeHit = input.recentMistakes.some((item) => item.includes(topic.conceptId) || item.includes(topic.title)) ? 0.25 : 0;
    const unseen = input.completedLessons.includes(topic.lessonId) ? 0 : 0.15;
    const recent = input.recentTopics.includes(topic.conceptId) ? -0.08 : 0.05;
    const score = Math.max(0, Math.min(1, (1 - mastery) * 0.5 + mistakeHit + unseen + recent));
    const reason = mistakeHit
      ? `Recent mistakes point at ${topic.title}, not at popularity.`
      : mastery < 0.4
        ? `Low local mastery on ${topic.conceptId} makes ${topic.lessonId} the next secure step.`
        : `You have room to transfer ${topic.title} into ${topic.simulationId}.`;
    const kind: RankedRecommendation["kind"] = mistakeHit ? "review" : mastery < 0.35 ? "lesson" : unseen ? "practice" : "simulation";
    return {
      targetId: kind === "lesson" ? topic.lessonId : kind === "simulation" ? topic.simulationId : topic.id,
      kind,
      title: topic.title,
      reason,
      score,
      conceptId: topic.conceptId,
    };
  }).sort((a, b) => b.score - a.score || a.conceptId.localeCompare(b.conceptId));
  return {
    items: items.slice(0, 8),
    learnerSummary: `Goal “${input.goal}” with ${input.timeAvailableMin} minutes and ${input.difficultyPreference} preference. Rankings use mastery, mistakes, and incomplete lessons — not popularity.`,
  };
}

export function getConversationSummaries(): ConversationSummary[] {
  if (summaryCache) return summaryCache;
  summaryCache = getTutorConversations().slice(0, 120).map((conversation, index) => ({
    id: stableId("sum", conversation.id),
    sessionId: conversation.id,
    title: conversation.title || conversationTitleFor(conversation.topic, index),
    summary: `The learner (${conversation.personaId}) worked through ${conversation.topic}. Outcome: ${conversation.outcome}. Key model: keep units visible.`,
    concepts: [conversation.conceptId],
    unresolvedQuestions: conversation.outcome === "resolved" ? [] : [`Still shaky on a unit or sign in ${conversation.topic}.`],
    recommendedNextStep: conversation.outcome === "needs-practice" ? "Open a verified practice item." : `Try ${conversation.topic} in a simulation.`,
    confidence: conversation.outcome === "clarification" ? 0.62 : 0.84,
  }));
  return summaryCache;
}

export function getExamAnalyses(): ExamAnalysisResponse[] {
  return PERSONAS.map((persona, index) => {
    const weak = CATALOG[index % CATALOG.length];
    const strong = CATALOG[(index + 8) % CATALOG.length];
    return {
      id: stableId("exam", persona.id),
      overallAssessment: `${persona.label}: explanations are more secure than timed numerical work.`,
      strengths: [strong.title, "Unit labeling when prompted"],
      weaknesses: [weak.title, weak.commonMistake],
      timeManagement: index % 2 === 0 ? "Too long on first questions, rushing the last third." : "Even pacing, but skipping sense-checks.",
      conceptGaps: [weak.conceptId, CATALOG[(index + 2) % CATALOG.length].conceptId],
      recommendedReview: [weak.lessonId, weak.examReview],
      recommendedProblems: [weak.example.prompt],
    };
  });
}

export function getProgressNarratives(): ProgressNarrative[] {
  return PERSONAS.map((persona, index) => {
    const strong = CATALOG[(index + 1) % CATALOG.length];
    const weak = CATALOG[(index + 6) % CATALOG.length];
    return {
      userId: `demo-${persona.id}`,
      narrative: `You are consistently stronger on ${strong.title}, but recent ${weak.title} attempts show the pattern: ${weak.commonMistake}`,
      strongConcepts: [strong.conceptId],
      weakConcepts: [weak.conceptId],
      nextFocus: weak.title,
    };
  });
}

export function getMasteryExplanations() {
  return CATALOG.map((topic) => ({
    conceptId: topic.conceptId,
    whyChanged: `Mastery moved because recent verified attempts on ${topic.title} used ${topic.equation} with labeled units.`,
    improvement: `Fewer mix-ups of the form “${topic.misconception}”.`,
    remainsWeak: topic.commonMistake,
    studyNext: topic.followUps[0],
  }));
}

export function coachDate(day: number): string {
  return isoDateDaysAgo(96 - day);
}
