import { classifyIntent } from "./datasets/intents-edge";
import { UNSUPPORTED_QUESTIONS } from "./datasets/intents-edge";

const UNSAFE = /(bomb|weapon|self-harm|suicide|hack into|steal password|credit card)/i;

export function contentFilter(prompt: string): { allowed: true } | { allowed: false; reason: string } {
  if (UNSAFE.test(prompt)) {
    return { allowed: false, reason: "This Demo AI stays inside physics learning. It will not help with harm, crime, or account theft." };
  }
  if (UNSUPPORTED_QUESTIONS.some((item) => prompt.toLowerCase().includes(item.prompt.toLowerCase().slice(0, 24)))) {
    return { allowed: false, reason: "Demo AI will not complete assessed work to be submitted as yours, invent fake physics, or abandon the curriculum." };
  }
  if (classifyIntent(prompt) === "outOfScope") {
    return { allowed: false, reason: "Ask a physics question, problem, graph, or experiment from the course." };
  }
  return { allowed: true };
}
