import { isoDaysAgo } from "../../clock";
import { stableId } from "../../utils/ids";
import { CATALOG, type CatalogTopic } from "../ai-catalog";
import { PERSONAS, type PersonaProfile } from "../ai-personas";
import { styleById } from "../ai-styles";
import { verifyTopicCalculation } from "../ai-verification";
import type { MockAITurn, SocraticStage, TutorConversation, TutorResponseStyle } from "../ai-types";

let conversationCache: TutorConversation[] | null = null;

const SOCRATIC_STAGES: SocraticStage[] = [
  "identify-knowns",
  "identify-unknown",
  "choose-principle",
  "choose-equation",
  "substitute",
  "check-units",
  "evaluate-answer",
];

function assistant(topic: CatalogTopic, persona: PersonaProfile, style: TutorResponseStyle, text: string, index: number): MockAITurn {
  return {
    id: stableId("msg", `${topic.id}-${persona.id}-${index}-a`),
    role: "assistant",
    text,
    createdAt: isoDaysAgo(0, 10 - index * 0.2),
    state: "sent",
    conceptIds: [topic.conceptId],
  };
}

function user(topic: CatalogTopic, persona: PersonaProfile, text: string, index: number): MockAITurn {
  return {
    id: stableId("msg", `${topic.id}-${persona.id}-${index}-u`),
    role: "user",
    text,
    createdAt: isoDaysAgo(0, 10 - index * 0.2 + 0.05),
    state: "sent",
    conceptIds: [topic.conceptId],
  };
}

function buildTurns(topic: CatalogTopic, persona: PersonaProfile, styleId: TutorResponseStyle, socratic: boolean): MockAITurn[] {
  const style = styleById(styleId);
  const verified = verifyTopicCalculation(topic);
  const verifiedLine = verified
    ? `Deterministic check: ${verified.name} = ${verified.value} ${verified.unit} using ${verified.principle}. This is a verified calculation, not a live-model guess.`
    : `No numerical claim is being verified here; ${topic.title} is being treated as an explanation.`;
  const turns: MockAITurn[] = [];
  let i = 0;
  turns.push(user(topic, persona, persona.opening(topic.title), i++));
  turns.push(assistant(topic, persona, styleId, style.render(topic, "You asked for a first picture of the idea."), i++));
  if (socratic) {
    const stageText: Record<SocraticStage, string> = {
      "identify-knowns": `What values are given? ${topic.example.known.map((item) => `${item.name} (${item.unit})`).join(", ")}.`,
      "identify-unknown": `The target is ${topic.example.unknown}. I am not giving the final number yet.`,
      "choose-principle": `Which principle fits ${topic.title}? ${topic.example.principle}`,
      "choose-equation": `If that principle is right, the equation is ${topic.equation}. Why that one?`,
      "substitute": "What would you substitute first, and which unit still needs checking?",
      "check-units": `The unit of ${topic.example.unknown} must match a rearrangement of ${topic.equation}.`,
      "evaluate-answer": `${verifiedLine} Does the size make sense for ${topic.title}?`,
    };
    SOCRATIC_STAGES.forEach((stage) => {
      turns.push(user(topic, persona, `For “${topic.example.prompt}”, help me with the ${stage.replace(/-/g, " ")} step — don’t skip ahead.`, i++));
      turns.push(assistant(topic, persona, "socratic", stageText[stage], i++));
    });
    turns.push(user(topic, persona, persona.closer(topic.title), i++));
    turns.push(assistant(topic, persona, "socratic", `You now have a method, not just an answer. ${topic.oneSentence}`, i++));
    return turns;
  }
  turns.push(user(topic, persona, persona.why(topic.title), i++));
  turns.push(assistant(topic, persona, styleId, `You asked why. That refers to ${topic.title}. ${topic.intuitionFirst} Limitation: ${topic.analogy.limitation}`, i++));
  turns.push(user(topic, persona, persona.showMe(topic.title), i++));
  turns.push(assistant(topic, persona, styleId, `You asked to see it. Example: ${topic.example.prompt} Knowns: ${topic.example.known.map((item) => `${item.name}=${item.value} ${item.unit}`).join(", ")}. ${verifiedLine}`, i++));
  if (persona.mistake) {
    turns.push(user(topic, persona, persona.mistake(topic.title), i++));
    turns.push(assistant(topic, persona, styleId, `Known mix-up: ${topic.misconception} Counterexample: ${topic.counterExample}`, i++));
  }
  turns.push(user(topic, persona, "Why?", i++));
  turns.push(assistant(topic, persona, styleId, `“Why?” points at the last principle: ${topic.example.principle}. ${topic.beginner}`, i++));
  turns.push(user(topic, persona, "Can you show me?", i++));
  turns.push(assistant(topic, persona, styleId, `Sketch ${topic.title} with ${topic.equation}. Try ${topic.simulationId}.`, i++));
  turns.push(user(topic, persona, "What changes if mass doubles?", i++));
  turns.push(assistant(topic, persona, styleId, `Ask whether mass appears in ${topic.equation}. Vacuum projectiles: no. Kinetic energy: yes, K scales with m. For ${topic.title}: re-read ${topic.equation} before claiming a change.`, i++));
  turns.push(user(topic, persona, persona.closer(topic.title), i++));
  turns.push(assistant(topic, persona, styleId, `Keep: ${topic.oneSentence} Avoid: ${topic.commonMistake} ${verifiedLine}`, i++));
  return turns;
}

export function getTutorConversations(): TutorConversation[] {
  if (conversationCache) return conversationCache;
  const items: TutorConversation[] = [];
  CATALOG.forEach((topic, topicIndex) => {
    const persona = PERSONAS[topicIndex % PERSONAS.length];
    const style = persona.preferredStyle;
    const turns = buildTurns(topic, persona, style, false);
    items.push({
      id: stableId("conv", `${topic.id}-${persona.id}`),
      userId: `demo-${persona.id}`,
      conceptId: topic.conceptId,
      topic: topic.title,
      personaId: persona.id,
      style,
      learnerLevel: topicIndex % 3 === 0 ? "middle-school" : topicIndex % 3 === 1 ? "high-school" : "intro-college",
      difficulty: topicIndex % 4 === 3 ? "hard" : topicIndex % 2 === 0 ? "easy" : "medium",
      outcome: persona.id === "confused-learner" || persona.id === "mistake-prone" ? "misconception-corrected" : "resolved",
      misconception: topic.misconception,
      title: conversationTitleFor(topic.title, topicIndex),
      startedAt: isoDaysAgo(20 - (topicIndex % 18), 4),
      updatedAt: isoDaysAgo(topicIndex % 5, 2),
      turns,
    });
  });
  PERSONAS.forEach((persona, personaIndex) => {
    const topic = CATALOG[(personaIndex * 3) % CATALOG.length];
    const turns = buildTurns(topic, persona, persona.preferredStyle, persona.id === "skeptical-learner" || persona.id === "exam-crammer");
    items.push({
      id: stableId("conv", `persona-${persona.id}-${topic.id}`),
      userId: `demo-${persona.id}`,
      conceptId: topic.conceptId,
      topic: topic.title,
      personaId: persona.id,
      style: persona.preferredStyle,
      learnerLevel: "high-school",
      difficulty: "medium",
      outcome: persona.id === "fast-learner" ? "needs-practice" : "resolved",
      misconception: topic.misconception,
      title: conversationTitleFor(topic.title, personaIndex + 40),
      startedAt: isoDaysAgo(12 - personaIndex, 6),
      updatedAt: isoDaysAgo(personaIndex % 4, 1),
      turns,
    });
  });
  CATALOG.slice(0, 28).forEach((topic, index) => {
    const persona = PERSONAS[(index + 4) % PERSONAS.length];
    const style: TutorResponseStyle = index % 2 === 0 ? "socratic" : "step-by-step";
    const turns = buildTurns(topic, persona, style, true);
    items.push({
      id: stableId("conv", `socratic-${topic.id}-${persona.id}`),
      userId: `demo-${persona.id}`,
      conceptId: topic.conceptId,
      topic: topic.title,
      personaId: persona.id,
      style,
      learnerLevel: "high-school",
      difficulty: "medium",
      outcome: "clarification",
      misconception: topic.misconception,
      title: conversationTitleFor(topic.title, index + 70),
      startedAt: isoDaysAgo(9 - (index % 8), 3),
      updatedAt: isoDaysAgo(index % 3, 5),
      turns,
    });
  });
  CATALOG.slice(0, 29).forEach((topic, index) => {
    const persona = PERSONAS[(index + 7) % PERSONAS.length];
    const turns = buildTurns(topic, persona, "exam-style", false);
    items.push({
      id: stableId("conv", `exam-${topic.id}`),
      userId: "demo-exam-crammer",
      conceptId: topic.conceptId,
      topic: topic.title,
      personaId: persona.id,
      style: "exam-style",
      learnerLevel: "high-school",
      difficulty: "hard",
      outcome: "needs-practice",
      title: conversationTitleFor(topic.title, index + 100),
      startedAt: isoDaysAgo(6, index % 10),
      updatedAt: isoDaysAgo(1, index % 8),
      turns,
    });
  });
  conversationCache = items;
  return conversationCache;
}

export function conversationTitleFor(topicTitle: string, salt: number): string {
  const titles = [
    `Understanding ${topicTitle}`,
    `Why ${topicTitle} changes`,
    `The mystery of ${topicTitle}`,
    `Checking units in ${topicTitle}`,
    `Exam notes: ${topicTitle}`,
    `A visual pass at ${topicTitle}`,
    `Assumptions behind ${topicTitle}`,
  ];
  return titles[salt % titles.length];
}

export function conversationStats(): { conversations: number; messages: number } {
  const conversations = getTutorConversations();
  return { conversations: conversations.length, messages: conversations.reduce((sum, item) => sum + item.turns.length, 0) };
}
