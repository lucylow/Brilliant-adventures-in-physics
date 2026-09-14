import { CATALOG } from "./ai-catalog";
import { PERSONAS } from "./ai-personas";
import { createMockAIRequest, createMockAIResponse, createMockAITurn } from "./ai-factories";
import { getTutorConversations } from "./datasets/conversations";
import { generatePracticeItem } from "./datasets/practice";
import { getExamAnalyses, getLearningPlans, getProgressNarratives } from "./datasets/study";
import { getScanAnalyses, getSimulationRecommendations } from "./datasets/scans-graphs";
import type { MockAIDemoUser, TutorConversation } from "./ai-types";
import { defaultMemory } from "./ai-memory";

export const AI_DEMO_SCENARIOS = [
  { id: "first-tutor-question", title: "First Tutor Question", prompt: "What is the difference between speed and velocity?" },
  { id: "follow-up-question", title: "Follow-Up Question", prompt: "Why?" },
  { id: "misconception-correction", title: "Misconception Correction", prompt: "If something is moving, it must be accelerating." },
  { id: "multi-step-problem", title: "Multi-Step Problem", prompt: "A ball is launched at 18 m/s at 42° from level ground. Find its range." },
  { id: "unit-error", title: "Unit Error", prompt: "I got 12.5 m/s for acceleration." },
  { id: "hint-ladder", title: "Hint Ladder", prompt: "Don't give the answer. Hint me on projectile motion." },
  { id: "simulation-recommendation", title: "Simulation Recommendation", prompt: "Can I see a simulation of projectile motion?" },
  { id: "physics-lens-scan", title: "Physics Lens Scan", prompt: "Scan this textbook problem.", imageReference: "mock-image://projectile-split/textbook-problem" },
  { id: "low-ocr-confidence", title: "Low OCR Confidence", prompt: "Read this handwriting.", imageReference: "mock-image://ocr/0o" },
  { id: "ai-verification-mismatch", title: "AI Verification Mismatch", prompt: "Is kinetic energy 99 J for 2 kg at 3 m/s?" },
  { id: "offline-tutor", title: "Offline Tutor", prompt: "Explain force.", mode: "mock-offline" },
  { id: "ai-timeout", title: "AI Timeout", prompt: "Explain force.", failure: "timeout" },
  { id: "rate-limit", title: "Rate Limit", prompt: "Explain force.", failure: "rateLimit" },
  { id: "streaming-response", title: "Streaming Response", prompt: "Explain projectile motion.", mode: "mock-streaming" },
  { id: "cancelled-stream", title: "Cancelled Stream", prompt: "Explain projectile motion." },
  { id: "learning-plan", title: "Learning Plan", prompt: "Make a 7-day catch-up plan for mechanics." },
  { id: "exam-analysis", title: "Exam Analysis", prompt: "How did I do on mechanics?" },
  { id: "weak-topic-recommendation", title: "Weak-Topic Recommendation", prompt: "What should I review?" },
  { id: "strong-topic-challenge", title: "Strong-Topic Challenge", prompt: "Challenge me on kinematics." },
  { id: "notebook-summarization", title: "Notebook Summarization", prompt: "Summarize my kinematics note." },
  { id: "flashcard-generation", title: "Flashcard Generation", prompt: "Turn the projectile lesson into flashcards." },
  { id: "graph-interpretation", title: "Graph Interpretation", prompt: "What does the slope of this v–t graph mean?" },
  { id: "experiment-analysis", title: "Experiment Analysis", prompt: "My range measurements don’t match the vacuum model." },
  { id: "concept-comparison", title: "Concept Comparison", prompt: "Velocity vs acceleration." },
  { id: "explain-simpler", title: "Explain Simpler", prompt: "Explain projectile motion like I’m in middle school." },
] as const;

export type AIDemoScenarioId = (typeof AI_DEMO_SCENARIOS)[number]["id"];

export function getAIDemoScenario(id: AIDemoScenarioId) {
  const scenario = AI_DEMO_SCENARIOS.find((item) => item.id === id);
  if (!scenario) throw new Error(`Unknown Demo AI scenario ${id}`);
  return scenario;
}

export function createAIDemoUser(personaId: (typeof PERSONAS)[number]["id"] = "curious-beginner"): MockAIDemoUser {
  const persona = PERSONAS.find((item) => item.id === personaId) ?? PERSONAS[0];
  return {
    id: `demo-${persona.id}`,
    displayName: persona.label,
    personaId: persona.id,
    learnerLevel: persona.id === "advanced-learner" ? "exam" : persona.id.includes("beginner") ? "new" : "school",
    goal: persona.id === "simulation-first" ? "experiment" : persona.id === "exam-crammer" ? "practice" : "understand",
    memory: defaultMemory(`demo-${persona.id}`, persona.id),
    learning: { attempts: 8, correct: 5, streak: 3, topics: { kinematics: { attempts: 4, correct: 3, hints: 1, confidenceTotal: 10 } } },
    conversationIds: getTutorConversations().filter((item) => item.personaId === persona.id).map((item) => item.id).slice(0, 6),
  };
}

export function createAIStudyJourney(userId = "demo-curious-beginner") {
  return {
    userId,
    plan: getLearningPlans()[0],
    narrative: getProgressNarratives()[0],
    exam: getExamAnalyses()[0],
  };
}

export function createAITutorJourney(conceptId = "kinematics"): TutorConversation {
  return getTutorConversations().find((item) => item.conceptId === conceptId) ?? getTutorConversations()[0];
}

export function createAIPracticeJourney(conceptId = "kinematics") {
  return {
    item: generatePracticeItem({ conceptId, difficulty: "medium", questionType: "direct-substitution", seed: "journey" }),
    conversation: createAITutorJourney(conceptId),
  };
}

export function createAISimulationJourney(conceptId = "kinematics") {
  return getSimulationRecommendations().find((item) => item.conceptId === conceptId) ?? getSimulationRecommendations()[0];
}

export function createAIExamJourney() {
  return getExamAnalyses()[3] ?? getExamAnalyses()[0];
}

export function projectileShowcaseTurns() {
  const topic = CATALOG.find((item) => item.id === "projectile-split") ?? CATALOG[2];
  return [
    createMockAITurn({ role: "user", text: "Tell me about projectile motion." }),
    createMockAITurn({ role: "assistant", text: `Concept: ${topic.title}. I still need the launch speed, angle, and landing height.` }),
    createMockAITurn({ role: "user", text: "18 m/s at 42° from level ground." }),
    createMockAITurn({ role: "assistant", text: "Intuition: horizontal motion is uniform; gravity changes only the vertical velocity." }),
    createMockAITurn({ role: "user", text: "What's the equation?" }),
    createMockAITurn({ role: "assistant", text: topic.equation }),
    createMockAITurn({ role: "user", text: "Check the range with the engine." }),
    createMockAITurn({ role: "assistant", text: "Verified calculation next, then a unit check, simulation, practice, hint, and review." }),
  ];
}

export function createShowcaseRequest() {
  return createMockAIRequest({
    feature: "tutor",
    prompt: "A ball is launched at 18 m/s at 42° from level ground. Find its range.",
    conceptIds: ["kinematics"],
    simulationId: "sim-projectile",
    scenarioId: "projectile-showcase",
  });
}

export { createMockAIResponse, createAIDemoUser as createAIDemoUsers };

export function allDemoUsers() {
  return PERSONAS.map((persona) => createAIDemoUser(persona.id));
}

export function scanForScenario(id: AIDemoScenarioId) {
  if (id === "low-ocr-confidence") return getScanAnalyses().find((item) => item.id === "scan-ocr-0o");
  return getScanAnalyses()[0];
}
