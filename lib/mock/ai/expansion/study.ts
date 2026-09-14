import { CATALOG } from "../ai-catalog";
import { isoDaysAgo } from "../../clock";
import { stableId } from "../../utils/ids";
import { allLearnerModels, getLearnerModel, weakConceptsOf } from "./learner-model";
import { decideIntervention } from "./adaptive";
import type {
  CoachingPlan,
  ConversationDigest,
  DialogueIntentId,
  ExamDebrief,
  GoalRecord,
  LanguageRegister,
  LearnerModelId,
  MonthlyReview,
  NextActionKind,
  RankedNextAction,
  ReviewPriority,
  StudyGuide,
  StudySessionState,
  WeeklyReview,
} from "./types";

const TRIGGERS: CoachingPlan["trigger"][] = ["repeated-mistake", "long-inactivity", "rapid-guessing", "high-hint-dependency", "streak-break", "mastery-plateau", "goal", "review", "curiosity"];
const ACTIONS: NextActionKind[] = ["review", "practice", "lesson", "simulation", "mission", "tutor"];

let coachingCache: CoachingPlan[] | null = null;

export function getCoachingPlans(): CoachingPlan[] {
  if (coachingCache) return coachingCache;
  const models = allLearnerModels();
  coachingCache = CATALOG.flatMap((topic, index) => {
    const model = models[index % models.length];
    const trigger = TRIGGERS[index % TRIGGERS.length];
    const action = ACTIONS[index % ACTIONS.length];
    return [
      {
        id: stableId("coach", `${topic.id}-${model.id}`),
        trigger,
        learnerState: model.id,
        recommendation: `Use ${topic.lessonId} or ${topic.simulationId} for ${topic.title}.`,
        message:
          trigger === "streak-break" ? "A short recap is a restart, not a penalty."
            : trigger === "curiosity" ? `${topic.title} connects to a nearby idea worth a five-minute look.`
              : `For ${topic.title}, ${topic.oneSentence}`,
        action,
        expectedOutcome: `Clearer use of ${topic.equation} without inflating certainty.`,
        conceptId: topic.conceptId,
      },
      {
        id: stableId("coach", `${topic.id}-${model.id}-b`),
        trigger: TRIGGERS[(index + 3) % TRIGGERS.length],
        learnerState: model.id,
        recommendation: `Practice ${topic.example.prompt}`,
        message: decideIntervention(model).message,
        action: decideIntervention(model).recommendedAction,
        expectedOutcome: `Fewer repeated slips on ${topic.misconception}.`,
        conceptId: topic.conceptId,
      },
      {
        id: stableId("coach", `${topic.id}-${model.id}-c`),
        trigger: "curiosity",
        learnerState: model.id,
        recommendation: `Explore a neighbour of ${topic.title} without treating it as remediation.`,
        message: `Curiosity, not a deficit: ${topic.title} sits next to ideas that share units but not slogans.`,
        action: "simulation",
        expectedOutcome: `A second representation of ${topic.equation}.`,
        conceptId: topic.conceptId,
      },
      {
        id: stableId("coach", `${topic.id}-${model.id}-d`),
        trigger: "review",
        learnerState: model.id,
        recommendation: `Spaced review of ${topic.lessonId}.`,
        message: `A short recap of ${topic.title} is enough. No catch-up guilt.`,
        action: "review",
        expectedOutcome: `Lower fatigue on ${topic.conceptId}.`,
        conceptId: topic.conceptId,
      },
    ];
  });
  return coachingCache;
}

export function getPlateauScenarios() {
  return CATALOG.map((topic, index) => {
    const model = allLearnerModels()[index % 9];
    const row = model.knowledge.find((item) => item.conceptId === topic.conceptId);
    return {
      id: stableId("plat", topic.id),
      conceptId: topic.conceptId,
      history: `Accuracy on ${topic.title} has stayed near ${(row?.mastery ?? 0.6).toFixed(2)} across recent mock attempts.`,
      diagnosis: row && row.hintCount > 3 ? "hint-dependence" : "representation-gap",
      aiRecommendation: `Switch representation: ${topic.simulationId} plus a unit-check on ${topic.equation}.`,
    };
  });
}

export function getMicroCoachEvents() {
  const when = ["before-problem", "after-mistake", "after-success", "after-streak", "after-experiment"] as const;
  return CATALOG.flatMap((topic) =>
    when.map((moment) => ({
      id: stableId("micro", `${topic.id}-${moment}`),
      conceptId: topic.conceptId,
      moment,
      line:
        moment === "before-problem" ? `Write knowns for ${topic.title} before choosing ${topic.equation}.`
          : moment === "after-mistake" ? `The slip matches “${topic.commonMistake}”. Check the unit of ${topic.example.unknown}.`
            : moment === "after-success" ? `The method held. Keep the unit line; do not skip it next time.`
              : moment === "after-streak" ? "A streak is a count, not a grade. Choose the next item because it is useful."
                : `Record ${topic.experiment.observation} separately from the ${topic.equation} interpretation.`,
    })),
  );
}

let narrativeCache: Array<{ id: string; learnerId: LearnerModelId; conceptId: string; narrative: string }> | null = null;

export function getProgressNarrativesV3() {
  if (narrativeCache) return narrativeCache;
  narrativeCache = allLearnerModels().flatMap((model) => {
    const weak = weakConceptsOf(model, 3);
    const strong = [...model.knowledge].sort((a, b) => b.mastery - a.mastery)[0];
    return model.knowledge.map((row) => {
      const topic = CATALOG.find((item) => item.conceptId === row.conceptId) ?? CATALOG[0];
      return {
        id: stableId("pn3", `${model.id}-${row.conceptId}`),
        learnerId: model.id,
        conceptId: row.conceptId,
        narrative: `${model.displayLabel} on ${topic.title}: mastery ${row.mastery.toFixed(2)}, confidence ${row.confidence.toFixed(2)}, ${row.mistakeCount} mock mistakes. ${row.confidence - row.mastery > 0.1 ? "Confidence is ahead of mastery." : "Calibration is closer."} Strongest nearby idea is ${strong.conceptId}. Demo AI interpretation only.`,
      };
    });
  });
  const extra = CATALOG.map((topic) => ({
    id: stableId("pn3", `catalog-${topic.id}`),
    learnerId: "intermediate" as const,
    conceptId: topic.conceptId,
    narrative: `Intermediate profile: ${topic.title} is in play. ${topic.examReview}`,
  }));
  narrativeCache = [...narrativeCache, ...extra];
  return narrativeCache;
}

export function getWeeklyReviews(): WeeklyReview[] {
  const models = allLearnerModels();
  return Array.from({ length: 52 }, (_, week) => {
    const model = models[week % models.length];
    const weak = weakConceptsOf(model, 2);
    const strong = [...model.knowledge].sort((a, b) => b.mastery - a.mastery)[0];
    return {
      id: stableId("wk", String(week + 1)),
      week: week + 1,
      wins: `Secure work on ${strong.conceptId}.`,
      weaknesses: `Still noisy on ${weak.join(" and ")}.`,
      mostPracticed: strong.conceptId,
      leastPracticed: weak[0] ?? "kinematics",
      newConcepts: weak.slice(0, 1),
      recommendations: [`Review ${weak[0]}`, `Simulation check on ${strong.conceptId}`],
      isDemoAnalytics: true,
    };
  });
}

export function getMonthlyReviews(): MonthlyReview[] {
  return Array.from({ length: 12 }, (_, month) => {
    const model = allLearnerModels()[month % 9];
    const weak = weakConceptsOf(model, 2);
    return {
      id: stableId("mo", String(month + 1)),
      month: month + 1,
      summary: `${model.displayLabel}: velocity ${model.learningVelocity.toFixed(2)}, hint dependence ${model.hintDependence.toFixed(2)}. Demo aggregate, not production analytics.`,
      wins: `Streak behavior ${model.streakBehavior}.`,
      weaknesses: weak.join(", "),
      recommendations: weak.map((id) => `Plan a 20-minute block on ${id}`),
      isDemoAnalytics: true,
    };
  });
}

export function getGoals(): GoalRecord[] {
  const specs = [
    { goal: "master mechanics", ids: ["kinematics", "forces", "energy"] },
    { goal: "prepare for exam", ids: ["kinematics", "circuits", "wave-motion"] },
    { goal: "learn electricity", ids: ["charge", "field", "circuits"] },
    { goal: "complete simulation track", ids: ["kinematics", "oscillation"] },
    { goal: "build astronomy foundation", ids: ["gravitational-energy", "relativistic-energy"] },
  ] as const;
  return specs.map((spec, index) => ({
    id: stableId("goal", spec.goal),
    goal: spec.goal,
    baseline: "mock baseline from learner models",
    target: "secure mastery ≥ 0.8 on listed concepts",
    progress: 0.2 + index * 0.12,
    deadline: isoDaysAgo(-30 - index * 7, 9),
    nextAction: `Practice ${spec.ids[0]} with a unit check.`,
    conceptIds: [...spec.ids],
  }));
}

export function getGoalAdjustments() {
  return [
    { id: "adj-missed", trigger: "missed-days", change: "Shorten the next block to 15 minutes; keep the same concept." },
    { id: "adj-fast", trigger: "faster-than-expected", change: "Add a challenge item, not a new domain." },
    { id: "adj-slow", trigger: "slower-progress", change: "Insert a prerequisite review before the next exam-style question." },
    { id: "adj-goal", trigger: "goal-change", change: "Rebuild the sequence from the new target concepts; keep completed lessons." },
  ];
}

export function nextReviewAt(mastery: number, lastReviewedDaysAgo: number, mistakeCount: number, confidence: number): { nextReviewAt: string; priority: ReviewPriority } {
  const overdue = lastReviewedDaysAgo > 14 || mistakeCount > 3;
  const priority: ReviewPriority = overdue || mastery < 0.35 ? "urgent" : mastery < 0.55 ? "high" : confidence > 0.85 && mastery < 0.7 ? "high" : mastery < 0.8 ? "normal" : "low";
  const days = priority === "urgent" ? 1 : priority === "high" ? 3 : priority === "normal" ? 7 : 14;
  return { nextReviewAt: isoDaysAgo(-days, 10), priority };
}

export function rankWhatNext(learnerId: LearnerModelId): RankedNextAction[] {
  const model = getLearnerModel(learnerId);
  const weak = weakConceptsOf(model, 4);
  const kinds: NextActionKind[] = model.preference.modality === "simulation" ? ["simulation", "tutor", "practice", "lesson", "review", "mission"] : ["review", "practice", "lesson", "simulation", "tutor", "mission"];
  return weak.slice(0, 6).map((conceptId, index) => {
    const topic = CATALOG.find((item) => item.conceptId === conceptId) ?? CATALOG[0];
    const kind = kinds[index % kinds.length];
    return {
      kind,
      title: topic.title,
      reason: `Ranked from ${model.displayLabel} weakness on ${conceptId}, not from a global trending list.`,
      score: 1 - (model.knowledge.find((row) => row.conceptId === conceptId)?.mastery ?? 0) - index * 0.02,
      targetId: kind === "simulation" ? topic.simulationId : kind === "lesson" ? topic.lessonId : topic.id,
      conceptId,
    };
  }).sort((a, b) => b.score - a.score || a.conceptId.localeCompare(b.conceptId));
}

const REGISTERS: LanguageRegister[] = ["student-friendly", "formal", "technical", "exam-ready", "flashcard-ready", "lab-report-ready"];

export function getStudyGuides(): StudyGuide[] {
  return CATALOG.flatMap((topic) =>
    REGISTERS.slice(0, 4).map((audience) => ({
      id: stableId("sg", `${topic.id}-${audience}`),
      conceptId: topic.conceptId,
      audience,
      keyIdea: audience === "technical" ? topic.mathematical : topic.oneSentence,
      equation: topic.equation,
      example: topic.example.prompt,
      mistake: topic.commonMistake,
      visual: topic.simulationId,
      reviewQuestion: topic.starters[0] ?? `State ${topic.title} in one sentence.`,
    })),
  );
}

export function getFormulaSheets() {
  return CATALOG.map((topic) => ({
    id: stableId("fs", topic.id),
    conceptId: topic.conceptId,
    title: `${topic.title} formula sheet`,
    equations: [topic.equation],
    notes: `Educational sheet for ${topic.title}. Not a cheat sheet for assessed work.`,
    guardrail: "Use this to reconstruct a method, not to submit as someone else's working.",
  }));
}

export function getExamDebriefs(): ExamDebrief[] {
  const models = allLearnerModels();
  return CATALOG.flatMap((topic, index) => {
    const model = models[index % models.length];
    return [{
      id: stableId("exd", `${topic.id}-${model.id}`),
      conceptId: topic.conceptId,
      topic: topic.title,
      difficulty: model.preference.problemDifficulty,
      requiredEquations: [topic.equation],
      likelyTrap: topic.commonMistake,
      recommendedApproach: topic.examReview,
      timeManagement: model.id === "exam" ? "Spend 90 seconds on knowns before algebra." : "Do not rush the unit line.",
      overall: `${model.displayLabel}: treat ${topic.title} as ${topic.oneSentence}`,
    }, {
      id: stableId("exd", `${topic.id}-${model.id}-alt`),
      conceptId: topic.conceptId,
      topic: topic.title,
      difficulty: "medium",
      requiredEquations: [topic.equation],
      likelyTrap: topic.misconception,
      recommendedApproach: `Start from ${topic.example.principle}.`,
      timeManagement: "Leave 1 minute for a reasonableness check.",
      overall: `Debrief (Demo AI) for ${topic.title}.`,
    }, {
      id: stableId("exd", `${topic.id}-${model.id}-time`),
      conceptId: topic.conceptId,
      topic: topic.title,
      difficulty: model.preference.problemDifficulty,
      requiredEquations: [topic.equation],
      likelyTrap: "Spending the whole minute on algebra before naming the unknown.",
      recommendedApproach: "15s knowns, 30s model, 15s unit check.",
      timeManagement: "Leave the last 20 seconds for reasonableness.",
      overall: `Timed debrief (Demo AI) for ${topic.title}.`,
    }, {
      id: stableId("exd", `${topic.id}-${model.id}-trap`),
      conceptId: topic.conceptId,
      topic: topic.title,
      difficulty: "hard",
      requiredEquations: [topic.equation],
      likelyTrap: topic.commonMistake,
      recommendedApproach: `Name ${topic.example.unknown} before rearranging ${topic.equation}.`,
      timeManagement: "If stuck after 40 seconds, write knowns again rather than guessing.",
      overall: `Trap-focused debrief (Demo AI) for ${topic.title}.`,
    }];
  });
}

export function getConversationDigests(): ConversationDigest[] {
  const intents: DialogueIntentId[] = ["askDefinition", "askWhy", "askHow", "askCalculation", "askSimulation", "askHint", "askComparison", "askReview"];
  return CATALOG.flatMap((topic) =>
    intents.map((intent, index) => ({
      id: stableId("dig", `${topic.id}-${intent}`),
      title: index % 2 === 0 ? `Understanding ${topic.title}` : `Why ${topic.title} changes`,
      tags: { topic: topic.title, difficulty: index === 3 ? "hard" : "medium", intent, outcome: index === 4 ? "unresolved" : "resolved" },
      summary: `Demo digest: the learner asked about ${topic.title} with intent ${intent}. Method: ${topic.equation}.`,
      conceptId: topic.conceptId,
      unresolved: index === 4 ? [`Unit of ${topic.example.unknown}`] : [],
    })),
  );
}

export function getDocumentSummaries() {
  const kinds = ["worksheet", "lab-report", "study-notes", "formula-sheet"] as const;
  return CATALOG.flatMap((topic) =>
    kinds.map((kind) => ({
      id: stableId("doc", `${topic.id}-${kind}`),
      kind,
      conceptId: topic.conceptId,
      summary: `${kind} on ${topic.title}: keep ${topic.equation} and the mistake “${topic.commonMistake}” visible.`,
      concepts: [topic.conceptId],
      equations: [topic.equation],
      questions: topic.starters,
      uncertainties: topic.followUps.slice(0, 1),
      actionItems: [`Check ${topic.example.unknown} units`],
    })),
  );
}

export function transformLanguage(text: string, register: LanguageRegister): string {
  if (register === "flashcard-ready") return text.split(". ")[0] ?? text;
  if (register === "exam-ready") return `Method first. ${text}`;
  if (register === "lab-report-ready") return `Observed vs inferred: ${text}`;
  if (register === "technical") return text;
  if (register === "formal") return text.replace(/\bcan't\b/gi, "cannot");
  return text;
}

export function getStudySessionStates(): StudySessionState[] {
  return ["planned", "started", "inProgress", "paused", "completed", "abandoned"];
}

export function planPracticeSession(minutes: 5 | 10 | 15 | 30 | 45 | 60, learnerId: LearnerModelId) {
  const model = getLearnerModel(learnerId);
  const weak = weakConceptsOf(model, minutes >= 30 ? 4 : 2);
  return {
    minutes,
    state: "planned" as StudySessionState,
    items: weak.map((conceptId, index) => ({ conceptId, minutes: Math.floor(minutes / weak.length), order: index + 1 })),
    goal: model.id === "exam" ? "exam" : "understand",
  };
}

export function getNotifications() {
  return CATALOG.slice(0, 12).flatMap((topic, index) => [
    { id: stableId("nt", `${topic.id}-rev`), kind: "review-due" as const, body: `Review ${topic.title} is due in this Demo AI timeline.`, deepLink: `/tutor?concept=${topic.conceptId}` },
    { id: stableId("nt", `${topic.id}-sim`), kind: "experiment-suggestion" as const, body: topic.experiment.name, deepLink: `/lab` },
    ...(index % 4 === 0 ? [{ id: stableId("nt", `${topic.id}-str`), kind: "streak" as const, body: "A short session is enough. No guilt framing.", deepLink: "/progress" }] : []),
  ]);
}

export function getCuriosityLinks() {
  return CATALOG.map((topic, index) => {
    const other = CATALOG[(index + 7) % CATALOG.length];
    return {
      id: stableId("cur", `${topic.id}-${other.id}`),
      from: topic.conceptId,
      to: other.conceptId,
      hook: `A surprising neighbour of ${topic.title} is ${other.title}: both care about units even when the stories differ.`,
    };
  });
}

export function getSelfExplanationPrompts() {
  return CATALOG.map((topic) => ({
    id: stableId("self", topic.id),
    conceptId: topic.conceptId,
    prompt: `Explain, without the number, why ${topic.equation} is the right model for ${topic.title}.`,
    analyses: {
      correctPrinciple: topic.example.principle,
      missingStep: "Unit check of the unknown.",
      misconception: topic.misconception,
      unsupportedAssumption: "Assuming the idealization still holds without stating it.",
    },
  }));
}

export function getReflectionPrompts() {
  const moments = ["wrong-answer", "correct-answer", "simulation", "experiment", "mission"] as const;
  return CATALOG.flatMap((topic) =>
    moments.map((moment) => ({
      id: stableId("ref", `${topic.id}-${moment}`),
      conceptId: topic.conceptId,
      moment,
      prompt:
        moment === "wrong-answer" ? `Which assumption in ${topic.title} did you use without checking?`
          : moment === "correct-answer" ? `Which unit check would have caught an error on ${topic.example.unknown}?`
            : moment === "simulation" ? `What changed on screen when you altered a control in ${topic.simulationId}?`
              : moment === "experiment" ? topic.experiment.analysis
                : `Which step of ${topic.title} was hardest to justify out loud?`,
    })),
  );
}
