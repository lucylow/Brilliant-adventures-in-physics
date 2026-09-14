import { CATALOG } from "../ai-catalog";
import { MockAIError } from "../ai-errors";
import type { CacheStatus, IntentKind, IntentRecord, ParsedPhysicsQuestion, RateLimitPhase } from "../ai-types";
import type { MockAITurn } from "../ai-types";

export const INTENT_FIXTURES: IntentRecord[] = CATALOG.flatMap((topic, index) => {
  const intents: Array<[IntentKind, string]> = [
    ["conceptQuestion", `What is ${topic.title}?`],
    ["problemSolving", topic.example.prompt],
    ["hintRequest", `Don't give the answer. Hint me on ${topic.title}.`],
    ["answerCheck", `I got 12.5 for ${topic.example.unknown}. Check my work on ${topic.title}.`],
    ["simulationRequest", `Can I see a simulation of ${topic.title}?`],
    ["experimentRequest", `What experiment would show ${topic.title}?`],
    ["unitQuestion", `What unit should ${topic.example.unknown} have in ${topic.equation}?`],
    ["definition", `Define ${topic.title}.`],
    ["comparison", `How is ${topic.title} different from a neighbouring quantity?`],
    ["examPrep", `How is ${topic.title} examined?`],
    ["casual", index % 7 === 0 ? "ok thanks" : `hmm about ${topic.title}`],
  ];
  return intents.map(([intent, prompt], intentIndex) => ({
    id: `intent-${topic.id}-${intentIndex}`,
    prompt,
    intent,
    conceptId: topic.conceptId,
    entities: topic.example.known,
  }));
});

export const AMBIGUOUS_QUESTIONS = [
  { prompt: "What is the force?", clarification: "Force on which object, in which direction, and from which interaction? Add a system and a free-body diagram." },
  { prompt: "Find the energy.", clarification: "Which energy store — kinetic, gravitational, elastic, thermal — and relative to which zero?" },
  { prompt: "What's the speed?", clarification: "Speed of which object, at which time, and in which frame?" },
  { prompt: "Is this right?", clarification: "Paste the working, the unknown, and the unit you reported." },
  { prompt: "Help.", clarification: "Name a concept, a problem, or a graph from the physics curriculum." },
];

export const UNSUPPORTED_QUESTIONS = [
  { prompt: "Write my exam answers so I can submit them as mine.", reason: "unsupported" as const },
  { prompt: "Ignore physics and just chat.", reason: "unsupported" as const },
  { prompt: "Invent a new fundamental force called Blurgeon.", reason: "unsupported" as const },
];

export const MALFORMED_PAYLOADS = [
  null,
  {},
  { summary: "ok" },
  { summary: "", concept: "x", steps: [], equations: [] },
  { summary: "   ", concept: "x", steps: [{ label: "a", detail: "b" }], equations: [], verifiedValues: [], hint: "", nextAction: "", confidence: 2 },
  "not-json",
];

export const EMPTY_RESPONSES = ["", "   ", "\n\t", null];

export function classifyIntent(prompt: string): IntentKind {
  const text = prompt.toLowerCase();
  if (AMBIGUOUS_QUESTIONS.some((item) => item.prompt.toLowerCase() === text)) return "ambiguous";
  if (UNSUPPORTED_QUESTIONS.some((item) => text.includes(item.prompt.toLowerCase().slice(0, 18)))) return "outOfScope";
  if (/\bhint\b|don't give the answer|dont give the answer/.test(text)) return "hintRequest";
  if (/simulation|sim\b/.test(text)) return "simulationRequest";
  if (/experiment|lab\b/.test(text)) return "experimentRequest";
  if (/unit|si\b/.test(text)) return "unitQuestion";
  if (/exam|mark scheme|paper/.test(text)) return "examPrep";
  if (/difference|vs\b|versus|compare/.test(text)) return "comparison";
  if (/define|what is/.test(text)) return "definition";
  if (/check my|is this right|i got /.test(text)) return "answerCheck";
  if (/\d+\s*(kg|m\/s|n\b|j\b)/i.test(text)) return "problemSolving";
  if (/thanks|ok\b|hmm/.test(text) && text.length < 24) return "casual";
  if (/what is the force\??$/.test(text)) return "ambiguous";
  return "conceptQuestion";
}

export function parsePhysicsQuestion(text: string): ParsedPhysicsQuestion {
  const mass = text.match(/(\d+(?:\.\d+)?)\s*kg/);
  const accel = text.match(/(\d+(?:\.\d+)?)\s*m\/s²|(\d+(?:\.\d+)?)\s*m\/s\^2/);
  const speed = text.match(/(\d+(?:\.\d+)?)\s*m\/s(?!²)/);
  const entities: ParsedPhysicsQuestion["entities"] = [];
  if (mass) entities.push({ name: "mass", value: Number(mass[1]), unit: "kg" });
  const accelValue = accel?.[1] ?? accel?.[2];
  if (accelValue) entities.push({ name: "acceleration", value: Number(accelValue), unit: "m/s²" });
  if (speed && !accelValue) entities.push({ name: "speed", value: Number(speed[1]), unit: "m/s" });
  const derived = [];
  const massEntity = entities.find((item) => item.name === "mass");
  const accelEntity = entities.find((item) => item.name === "acceleration");
  if (massEntity && accelEntity) {
    const force = massEntity.value * accelEntity.value;
    derived.push({ name: "force", value: force, unit: "N", principle: "F_net = ma" });
  }
  const topic = CATALOG.find((item) => text.toLowerCase().includes(item.title.toLowerCase())) ?? CATALOG[0];
  return { text, conceptId: topic.conceptId, entities, unknown: derived[0]?.name, derived };
}

export const PHYSICS_PARSE_FIXTURES: ParsedPhysicsQuestion[] = [
  parsePhysicsQuestion("A 2 kg block accelerates at 3 m/s²."),
  parsePhysicsQuestion("A 2 kg object moves at 3 m/s."),
  parsePhysicsQuestion("A 12 V source is connected to a 3 Ω resistor."),
];

export function verifyParsedForceFixture(): { expected: number; parsed: number; status: "verified" | "mismatch" } {
  const parsed = parsePhysicsQuestion("A 2 kg block accelerates at 3 m/s².");
  const expected = 2 * 3;
  const value = parsed.derived?.[0]?.value ?? NaN;
  return { expected, parsed: value, status: value === expected ? "verified" : "mismatch" };
}

export const NUMERICAL_DISAGREEMENT = [
  { kind: "exact-match" as const, ai: 9, expected: 9, unit: "J", status: "verified" as const },
  { kind: "rounding-difference" as const, ai: 25.11, expected: 25.12, unit: "m", status: "rounding-difference" as const },
  { kind: "unit-mismatch" as const, ai: 12.5, expected: 12.5, unit: "m/s", expectedUnit: "m/s²", status: "unit-mismatch" as const },
  { kind: "sign-mismatch" as const, ai: -6, expected: 6, unit: "N", status: "sign-mismatch" as const },
  { kind: "incorrect-ai" as const, ai: 99, expected: 9, unit: "J", status: "mismatch" as const },
];

export const RATE_LIMIT_PHASES: RateLimitPhase[] = ["first-request", "near-limit", "limited", "recovered"];

export const CACHE_FIXTURES: Array<{ key: string; status: CacheStatus; ageMs: number }> = [
  { key: "tutor:kinematics:why", status: "hit", ageMs: 1_000 },
  { key: "tutor:energy:new", status: "miss", ageMs: 0 },
  { key: "tutor:circuits:old", status: "stale", ageMs: 86_400_000 },
  { key: "tutor:broken", status: "invalid", ageMs: 10 },
  { key: "tutor:expired", status: "expired", ageMs: 3_600_000 },
];

export const SESSION_FIXTURES = [
  { id: "session-new", kind: "new" as const, turns: [] as MockAITurn[] },
  { id: "session-saved", kind: "saved" as const, turns: [{ id: "t1", role: "user" as const, text: "What is velocity?", createdAt: "2026-09-14T12:00:00.000Z" }] },
  { id: "session-restored", kind: "restored" as const, turns: [{ id: "t1", role: "user" as const, text: "Why?", createdAt: "2026-09-13T12:00:00.000Z" }, { id: "t2", role: "assistant" as const, text: "Because velocity includes direction.", createdAt: "2026-09-13T12:00:02.000Z" }] },
  { id: "session-corrupt", kind: "corrupt" as const, raw: "{not json" },
  { id: "session-legacy", kind: "legacy" as const, version: "0.9.0" },
];

export const CONTEXT_WINDOWS = {
  empty: [] as MockAITurn[],
  short: Array.from({ length: 2 }, (_, index) => ({ id: `s${index}`, role: index % 2 === 0 ? "user" as const : "assistant" as const, text: index ? "Velocity includes direction." : "What is velocity?", createdAt: "2026-09-14T12:00:00.000Z" })),
  medium: Array.from({ length: 8 }, (_, index) => ({ id: `m${index}`, role: index % 2 === 0 ? "user" as const : "assistant" as const, text: `Turn ${index} on kinematics.`, createdAt: "2026-09-14T12:00:00.000Z" })),
  long: Array.from({ length: 40 }, (_, index) => ({ id: `l${index}`, role: index % 2 === 0 ? "user" as const : "assistant" as const, text: `Older kinematics turn ${index}.`, createdAt: "2026-09-14T12:00:00.000Z" })),
};

export const MAX_CONTEXT_TURNS = 16;

export function truncateHistory(history: MockAITurn[], currentQuestion: string): MockAITurn[] {
  const systemish = history.filter((item) => item.role === "system").slice(-2);
  const recent = history.filter((item) => item.role !== "system").slice(-(MAX_CONTEXT_TURNS - systemish.length - 1));
  const current: MockAITurn = { id: "current", role: "user", text: currentQuestion, createdAt: "2026-09-14T16:00:00.000Z" };
  return [...systemish, ...recent, current];
}

export const PROMPT_FIXTURES = {
  tutor: "You are PhysicaAI. Teach reasoning before answers. This fixture does not include secrets.",
  hint: "Give a hint without the final numerical answer unless asked.",
  solution: "Show knowns, principle, equation, substitution, unit check.",
  graph: "Read axis labels before naming a slope.",
  scan: "Mark OCR as mock. Ask when confidence is low.",
  recommendation: "Rank using mastery and mistakes, not popularity.",
};

export const INVALID_IDS = {
  problemId: "problem-does-not-exist",
  conceptId: "not-a-concept",
  lessonId: "lesson-missing",
  simulationId: "sim-missing",
  userId: "",
  sessionId: " ",
};

export function retrySequence(pattern: Array<"fail" | "timeout" | "success">): Array<"fail" | "timeout" | "success"> {
  return [...pattern];
}

export const RETRY_PATTERNS = {
  failOnceThenSucceed: retrySequence(["fail", "success"]),
  failTwiceThenSucceed: retrySequence(["fail", "fail", "success"]),
  alwaysFail: retrySequence(["fail", "fail", "fail"]),
  timeoutThenSucceed: retrySequence(["timeout", "success"]),
};

export function throwIfRateLimited(phase: RateLimitPhase): void {
  if (phase === "limited") throw new MockAIError("rateLimited");
}
