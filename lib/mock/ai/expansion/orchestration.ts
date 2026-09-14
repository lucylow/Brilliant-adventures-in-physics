import { CATALOG } from "../ai-catalog";
import { isoDaysAgo } from "../../clock";
import { stableId } from "../../utils/ids";
import type { AIDemoShowcaseId, DemoTimelineEvent, EndToEndFlow, LearnerEvent, LearnerModelId, TestUserState } from "./types";
import { resetSessions } from "../ai-session";
import { getLearnerModel } from "./learner-model";

export const SHOWCASES: Array<{ id: AIDemoShowcaseId; title: string; seed: string }> = [
  { id: "tutor", title: "Tutor Demo", seed: "showcase-tutor" },
  { id: "scan", title: "Scan Demo", seed: "showcase-scan" },
  { id: "experiment", title: "Experiment Demo", seed: "showcase-experiment" },
  { id: "exam", title: "Exam Demo", seed: "showcase-exam" },
  { id: "simulation", title: "Simulation Demo", seed: "showcase-sim" },
  { id: "personalization", title: "Personalization Demo", seed: "showcase-pers" },
  { id: "recovery", title: "Recovery Demo", seed: "showcase-rec" },
  { id: "streaming", title: "Streaming Demo", seed: "showcase-str" },
  { id: "verification", title: "Verification Demo", seed: "showcase-ver" },
  { id: "multimodal", title: "Multimodal Demo", seed: "showcase-mm" },
];

let showcase: AIDemoShowcaseId = "tutor";
let testUser: TestUserState = "active";

export function setAIDemoShowcase(id: AIDemoShowcaseId): AIDemoShowcaseId {
  showcase = id;
  return showcase;
}

export function getAIDemoShowcase(): AIDemoShowcaseId {
  return showcase;
}

export function setAITestUserState(state: TestUserState): TestUserState {
  testUser = state;
  return testUser;
}

export function getAITestUserState(): TestUserState {
  return testUser;
}

export function learnerIdForTestUser(state: TestUserState = testUser): LearnerModelId {
  if (state === "fresh") return "beginner";
  if (state === "struggling" || state === "error") return "struggling";
  if (state === "mastery") return "high-performer";
  if (state === "exam") return "exam";
  if (state === "returning" || state === "offline") return "returning";
  return "intermediate";
}

export function getEndToEndFlows(): EndToEndFlow[] {
  const specs: Array<{ id: string; title: string; showcase: AIDemoShowcaseId; learnerId: LearnerModelId; steps: EndToEndFlow["steps"] }> = [
    { id: "flow-tutor-practice", title: "Tutor → practice → feedback → mastery", showcase: "tutor", learnerId: "intermediate", steps: [
      { feature: "tutor", action: "ask about projectile motion", expected: "Demo AI explanation with verified range if numbers exist" },
      { feature: "practice", action: "attempt a related item", expected: "error-aware feedback" },
      { feature: "progress", action: "read narrative", expected: "weak-topic language from the learner model" },
    ] },
    { id: "flow-scan-solve", title: "Scan → parse → verify → solve", showcase: "scan", learnerId: "visual", steps: [
      { feature: "scan", action: "open textbook problem image", expected: "mock OCR + clarification if low confidence" },
      { feature: "tutor", action: "confirm the angle", expected: "structured knowns" },
      { feature: "verification", action: "run deterministic calc", expected: "verified or mismatch" },
    ] },
    { id: "flow-experiment", title: "Experiment → measure → analyze → report", showcase: "experiment", learnerId: "simulation", steps: [
      { feature: "experiment", action: "setup", expected: "objective from catalog" },
      { feature: "analysis", action: "trend + uncertainty", expected: "observed vs inferred vs expected" },
      { feature: "notebook", action: "lab-report assist", expected: "assistance labeled, not fabricated data" },
    ] },
    { id: "flow-sim-predict", title: "Simulation → ask why → modify → predict → observe", showcase: "simulation", learnerId: "simulation", steps: [
      { feature: "simulation", action: "predict range if g halves", expected: "what-if with deterministic projectile" },
      { feature: "copilot", action: "what should I change?", expected: "one-control advice" },
    ] },
    { id: "flow-exam", title: "Exam → debrief → study plan → review", showcase: "exam", learnerId: "exam", steps: [
      { feature: "exam", action: "open debrief", expected: "trap + equations" },
      { feature: "plan", action: "20-minute block", expected: "weak-topic sequence" },
    ] },
  ];
  const generated = CATALOG.slice(0, 25).map((topic, index) => ({
    id: stableId("flow", topic.id),
    title: `${topic.title} journey`,
    showcase: SHOWCASES[index % SHOWCASES.length].id,
    learnerId: (["beginner", "intermediate", "advanced", "exam", "visual"] as const)[index % 5],
    steps: [
      { feature: "tutor", action: `ask ${topic.starters[0] ?? topic.title}`, expected: topic.oneSentence },
      { feature: "practice", action: topic.example.prompt, expected: topic.equation },
      { feature: "simulation", action: `open ${topic.simulationId}`, expected: topic.intuitionFirst },
    ],
  }));
  return [...specs, ...generated];
}

export function getDemoTimeline(): DemoTimelineEvent[] {
  const topic = CATALOG.find((item) => item.id === "projectile-split") ?? CATALOG[0];
  return [
    { id: "t0900", at: "09:00", kind: "lesson-completion", label: "Lesson", conceptId: topic.conceptId },
    { id: "t0912", at: "09:12", kind: "practice", label: "Practice attempt", conceptId: topic.conceptId },
    { id: "t0920", at: "09:20", kind: "problem-failure", label: "Unit slip", conceptId: topic.conceptId },
    { id: "t0922", at: "09:22", kind: "tutor-request", label: "Tutor", conceptId: topic.conceptId },
    { id: "t0930", at: "09:30", kind: "simulation-completion", label: "Simulation", conceptId: topic.conceptId },
    { id: "t0940", at: "09:40", kind: "review-completion", label: "Review", conceptId: topic.conceptId },
  ];
}

export function timelineToEvents(userId: string): LearnerEvent[] {
  return getDemoTimeline().map((item) => ({
    id: item.id,
    kind: item.kind === "practice" || item.kind === "scan" ? "problem-success" : item.kind,
    userId,
    conceptId: item.conceptId,
    at: isoDaysAgo(0, Number(item.at.replace(":", "."))),
    payload: { label: item.label },
  }));
}

export {
  generateTutorJourney,
  generateStudyJourney,
  generateExamJourney,
  generateSimulationJourney,
  generateExperimentJourney,
  generateRecoveryJourney,
} from "./journeys";

export function resetAIConversation(): void {
  resetSessions();
}

export function exportShowcaseConfig() {
  return {
    version: "3.0.0",
    showcase: getAIDemoShowcase(),
    testUser: getAITestUserState(),
    learnerId: learnerIdForTestUser(),
    isMock: true as const,
  };
}

export function importShowcaseConfig(raw: { showcase?: AIDemoShowcaseId; testUser?: TestUserState }) {
  if (raw.showcase) setAIDemoShowcase(raw.showcase);
  if (raw.testUser) setAITestUserState(raw.testUser);
  return exportShowcaseConfig();
}

export function resetAIScenarios(): void {
  showcase = "tutor";
  testUser = "active";
}

export function resetAIRecommendations(): void {
  resetAIScenarios();
}

export function getStoryline() {
  const model = getLearnerModel(learnerIdForTestUser());
  return {
    name: model.displayLabel,
    level: model.id,
    strengths: [...model.knowledge].sort((a, b) => b.mastery - a.mastery).slice(0, 2).map((row) => row.conceptId),
    weaknesses: [...model.knowledge].sort((a, b) => a.mastery - b.mastery).slice(0, 2).map((row) => row.conceptId),
    style: model.preference.explanationStyle,
    chapters: getDemoTimeline().map((item) => item.label),
  };
}

export function getDeepLinks() {
  return [
    { id: "dl-tutor", path: "/tutor", reason: "open Tutor conversation" },
    { id: "dl-lesson", path: "/lesson", reason: "open recommended lesson" },
    { id: "dl-sim", path: "/lab", reason: "open simulation from Tutor" },
    { id: "dl-practice", path: "/practice", reason: "open practice from feedback" },
  ];
}

export function getMigrationFixtures() {
  return [
    { version: "1.0.0", payload: { summary: "legacy tutor card", concept: "Velocity as directed change" } },
    { version: "3.0.0", payload: { summary: "expansion-aware card", concept: "Velocity as directed change", strategy: "analogy" } },
  ];
}

export function migrateLegacyPayload(payload: { summary: string; concept: string; strategy?: string }) {
  return { ...payload, strategy: payload.strategy ?? "direct-explanation", version: "3.0.0" };
}

export function getStreamBlockFixtures() {
  const topic = CATALOG[0];
  return {
    blocks: [
      { kind: "start", text: "Demo AI" },
      { kind: "paragraph", text: topic.oneSentence },
      { kind: "equation", text: topic.equation },
      { kind: "complete", text: topic.flash },
    ],
    cancelBeforeFirst: { cancelAt: "before-first" as const },
    cancelMid: { cancelAt: "mid" as const },
    cancelBeforeFinal: { cancelAt: "before-final" as const },
    cancelAfterFinal: { cancelAt: "after-final" as const },
  };
}

export function getDemoAnalytics() {
  return {
    label: "DEMO DATA — not production analytics",
    demo: true as const,
    tutorResponseTypes: { explanation: 40, hint: 22, clarification: 11 },
    hintUsage: 0.31,
    misconceptionFamilies: { unit: 12, sign: 7, formula: 9 },
    recommendationAcceptance: 0.44,
    simulationInteraction: 18,
  };
}
