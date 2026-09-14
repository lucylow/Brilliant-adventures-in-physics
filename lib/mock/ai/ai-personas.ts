import type { LearnerPersonaId, TutorResponseStyle } from "./ai-types";

export type PersonaProfile = {
  id: LearnerPersonaId;
  label: string;
  preferredStyle: TutorResponseStyle;
  opening: (topic: string) => string;
  why: (topic: string) => string;
  showMe: (topic: string) => string;
  whatIf: (topic: string) => string;
  closer: (topic: string) => string;
  mistake?: (topic: string) => string;
};

export const PERSONAS: PersonaProfile[] = [
  {
    id: "curious-beginner",
    label: "Curious beginner",
    preferredStyle: "analogy-first",
    opening: (topic) => `I keep hearing about ${topic}, but I don't yet have a picture of it. What is it really?`,
    why: (topic) => `Why does that picture of ${topic} work? I want the reason, not just the slogan.`,
    showMe: (topic) => `Can you show me a small everyday example of ${topic}?`,
    whatIf: (topic) => `What changes if I make the situation a bit more extreme for ${topic}?`,
    closer: (topic) => `If I had to explain ${topic} to a friend in one minute, what should I not get wrong?`,
  },
  {
    id: "confused-learner",
    label: "Confused learner",
    preferredStyle: "remedial",
    opening: (topic) => `I thought ${topic} meant something else, and now the lesson and my notes disagree.`,
    why: (topic) => `Wait — so the thing I believed about ${topic} is incomplete? Where did I slip?`,
    showMe: (topic) => `Can you walk that again more slowly for ${topic}, with the units visible?`,
    whatIf: (topic) => `If two quantities look similar in ${topic}, how do I tell them apart in a problem?`,
    closer: (topic) => `Give me a checkpoint question so I can see whether I still mix up ${topic}.`,
    mistake: (topic) => `I treated a related quantity as if it were ${topic}. Is that the usual mix-up?`,
  },
  {
    id: "fast-learner",
    label: "Fast learner",
    preferredStyle: "advanced",
    opening: (topic) => `I already know the headline for ${topic}. What is the assumption people skip?`,
    why: (topic) => `Why is that assumption valid for ${topic}, and when does it fail?`,
    showMe: (topic) => `Show the governing equation for ${topic} and what each symbol measures.`,
    whatIf: (topic) => `What happens to ${topic} in a limiting case — zero, infinity, or a swapped variable?`,
    closer: (topic) => `Give me a challenge that still stays inside the ${topic} model we actually use.`,
  },
  {
    id: "exam-crammer",
    label: "Exam crammer",
    preferredStyle: "exam-style",
    opening: (topic) => `How is ${topic} typically examined, and what is the first line markers want to see?`,
    why: (topic) => `Why do exam questions on ${topic} hide the knowns in a story?`,
    showMe: (topic) => `Show a compact method for ${topic}: knowns, principle, equation, units, sense-check.`,
    whatIf: (topic) => `What is the most common trap on ${topic} papers?`,
    closer: (topic) => `Give me a one-page mental checklist for ${topic} before I turn the page.`,
  },
  {
    id: "visual-learner",
    label: "Visual learner",
    preferredStyle: "visual",
    opening: (topic) => `Can you explain ${topic} as something I could sketch?`,
    why: (topic) => `Why does that diagram of ${topic} include those arrows or axes?`,
    showMe: (topic) => `What would a graph of ${topic} look like, and what is the slope?`,
    whatIf: (topic) => `If I animated ${topic}, which variable should I highlight as it changes?`,
    closer: (topic) => `Which simulation should I open to see ${topic} move?`,
  },
  {
    id: "equation-focused",
    label: "Equation-focused learner",
    preferredStyle: "equation-first",
    opening: (topic) => `Start with the equation for ${topic}. What is defined, and what is measured?`,
    why: (topic) => `Why this equation for ${topic} rather than a neighbouring formula?`,
    showMe: (topic) => `Isolate the unknown in the ${topic} equation and keep the units on every term.`,
    whatIf: (topic) => `If one symbol in the ${topic} equation doubles, what happens algebraically?`,
    closer: (topic) => `What unit check would catch a wrong rearrangement of the ${topic} equation?`,
  },
  {
    id: "intuitive-learner",
    label: "Intuitive learner",
    preferredStyle: "analogy-first",
    opening: (topic) => `Give me an analogy for ${topic}, then tell me where the analogy lies.`,
    why: (topic) => `Why is that analogy for ${topic} useful, and what physics does it hide?`,
    showMe: (topic) => `Connect the analogy back to a real measurement of ${topic}.`,
    whatIf: (topic) => `When does the everyday picture of ${topic} become misleading?`,
    closer: (topic) => `What sentence should I remember so I don't treat the analogy as exact ${topic} physics?`,
  },
  {
    id: "simulation-first",
    label: "Simulation-first learner",
    preferredStyle: "visual",
    opening: (topic) => `I want to poke ${topic} in a simulation. What should I change first?`,
    why: (topic) => `Why would doubling that parameter change ${topic} that way?`,
    showMe: (topic) => `Which readout in the ${topic} sim is the verified quantity?`,
    whatIf: (topic) => `What happens in the ${topic} sim if mass doubles while everything else stays put?`,
    closer: (topic) => `After the sim, what should I still calculate by hand for ${topic}?`,
  },
  {
    id: "skeptical-learner",
    label: "Skeptical learner",
    preferredStyle: "socratic",
    opening: (topic) => `How do we actually know the usual story about ${topic} is the right model here?`,
    why: (topic) => `What measurement would disagree if our ${topic} model were missing a force or a term?`,
    showMe: (topic) => `Show a counterexample people confuse with ${topic}.`,
    whatIf: (topic) => `If I dropped air resistance or friction, what in ${topic} would change?`,
    closer: (topic) => `What would you need me to measure before trusting a ${topic} numerical claim?`,
  },
  {
    id: "mistake-prone",
    label: "Mistake-prone learner",
    preferredStyle: "step-by-step",
    opening: (topic) => `I keep losing marks on ${topic}, usually on units or signs.`,
    why: (topic) => `Why would a number look right for ${topic} while the unit is still wrong?`,
    showMe: (topic) => `Here is my habit: I jump to the formula. What should I write first for ${topic}?`,
    whatIf: (topic) => `If my answer for ${topic} has the right digits but the wrong unit, what did I actually compute?`,
    closer: (topic) => `Give me a final-check question that would have caught my last ${topic} error.`,
    mistake: (topic) => `I got a plausible number for ${topic} but I think I described the wrong quantity.`,
  },
  {
    id: "advanced-learner",
    label: "Advanced learner",
    preferredStyle: "advanced",
    opening: (topic) => `Where does the school model of ${topic} sit relative to a more general formulation?`,
    why: (topic) => `Which conservation law or symmetry is actually doing the work in ${topic}?`,
    showMe: (topic) => `Write the ${topic} relation, then name the approximation that made it look simple.`,
    whatIf: (topic) => `What happens to ${topic} if we restore a term the intro course dropped?`,
    closer: (topic) => `What should I study next that still depends on a secure ${topic} foundation?`,
  },
];

export function personaById(id: LearnerPersonaId): PersonaProfile {
  const found = PERSONAS.find((persona) => persona.id === id);
  if (!found) throw new Error(`Unknown persona ${id}`);
  return found;
}

export function personaAt(index: number): PersonaProfile {
  return PERSONAS[((index % PERSONAS.length) + PERSONAS.length) % PERSONAS.length];
}
