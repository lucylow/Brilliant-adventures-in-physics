export type TutorStyle = "concise" | "socratic" | "visual" | "exam";

export type TutorStep = {
  label: string;
  detail: string;
};

export type TutorAnswer = {
  summary: string;
  concept: string;
  steps: TutorStep[];
  equations: string[];
  verifiedValues: Array<{ name: string; value: number; unit: string }>;
  hint: string;
  nextAction: string;
  confidence: number;
};

export const TUTOR_SYSTEM = "You are PhysicaAI, a supportive physics tutor. Teach reasoning before final answers. State assumptions, use units, distinguish verified calculations from explanations, and never invent measurements.";

export function sanitizeText(text: string): string {
  return text.replace(/<script[\s\S]*?<\/script>/gi, "").trim().slice(0, 20000);
}

export function renderPrompt(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(variables[key] ?? ""));
}

export function validateTutorAnswer(value: unknown): TutorAnswer {
  if (!value || typeof value !== "object") throw new Error("Tutor response is invalid");
  const answer = value as Partial<TutorAnswer>;
  if (typeof answer.summary !== "string" || typeof answer.concept !== "string" || !Array.isArray(answer.steps) || !Array.isArray(answer.equations)) {
    throw new Error("Tutor response is missing required fields");
  }
  return {
    summary: sanitizeText(answer.summary),
    concept: sanitizeText(answer.concept),
    steps: answer.steps.filter((step): step is TutorStep => Boolean(step && typeof step.label === "string" && typeof step.detail === "string")).map((step) => ({ label: sanitizeText(step.label), detail: sanitizeText(step.detail) })),
    equations: answer.equations.filter((equation): equation is string => typeof equation === "string").map(sanitizeText),
    verifiedValues: Array.isArray(answer.verifiedValues) ? answer.verifiedValues.filter((item) => item && Number.isFinite(item.value) && typeof item.name === "string" && typeof item.unit === "string") : [],
    hint: typeof answer.hint === "string" ? sanitizeText(answer.hint) : "Try identifying the known values first.",
    nextAction: typeof answer.nextAction === "string" ? sanitizeText(answer.nextAction) : "Try a similar problem.",
    confidence: Math.max(0, Math.min(1, Number(answer.confidence) || 0)),
  };
}

export function tutorInstruction(style: TutorStyle): string {
  return {
    concise: "Use short explanations.",
    socratic: "Ask guiding questions before revealing steps.",
    visual: "Use analogies and describe diagrams.",
    exam: "Prioritize exam technique and concise working.",
  }[style];
}

export function hintLevel(mastery: number, attempt: number): 1 | 2 | 3 {
  if (mastery < 0.35) return 3;
  if (attempt === 0) return 1;
  return mastery < 0.65 ? 2 : 1;
}

export function createMockTutorAnswer(question: string, verifiedValues: TutorAnswer["verifiedValues"] = []): TutorAnswer {
  const cleanQuestion = sanitizeText(question);
  return {
    summary: `Let’s break down “${cleanQuestion || "this physics question"}” into knowns, an equation, and a check.`,
    concept: "Problem decomposition",
    steps: [
      { label: "Identify the knowns", detail: "Write each value with its unit before choosing a formula." },
      { label: "Choose the principle", detail: "Match the quantities to a supported physics relationship." },
      { label: "Verify the result", detail: "Check units, sign, and whether the magnitude is physically reasonable." },
    ],
    equations: ["known values → governing equation → verified result"],
    verifiedValues,
    hint: "What quantity is the problem asking you to find, and which values are already given?",
    nextAction: "Try a similar problem after reviewing the variables.",
    confidence: verifiedValues.length ? 0.96 : 0.78,
  };
}

export class TTLCache<T> {
  private readonly values = new Map<string, { value: T; expiresAt: number }>();
  set(key: string, value: T, ttlMs: number) { this.values.set(key, { value, expiresAt: Date.now() + ttlMs }); }
  get(key: string): T | undefined {
    const item = this.values.get(key);
    if (!item) return undefined;
    if (Date.now() > item.expiresAt) { this.values.delete(key); return undefined; }
    return item.value;
  }
}

export async function withFallback<T>(tasks: Array<() => Promise<T>>): Promise<T> {
  let lastError: unknown;
  for (const task of tasks) {
    try { return await task(); } catch (error) { lastError = error; }
  }
  throw lastError instanceof Error ? lastError : new Error("All AI providers failed");
}
