import { createMockTutorSession } from "../factories/tutor-session";
import { createMockTutorAnswer } from "@/lib/ai";
import { isoDaysAgo } from "../clock";
import type { MockTutorSession, MockTutorSource } from "../types";

type Prompt = {
  id: string;
  conceptId: string;
  topicId: string;
  title: string;
  daysAgo: number;
  userTurns: string[];
  assistantTurns: Array<{ text: string; source: MockTutorSource; equation?: string }>;
};

const PROMPTS: Prompt[] = [
  { id: "tutor-session-acceleration", conceptId: "acceleration", topicId: "kinematics", title: "What is acceleration?", daysAgo: 4, userTurns: ["What is acceleration?", "So moving fast does not mean accelerating?"], assistantTurns: [{ text: "Acceleration is the rate of change of velocity, including direction.", source: "AI_EXPLANATION" }, { text: "A car at constant highway speed on a straight road has large velocity and zero acceleration.", source: "AI_EXPLANATION" }] },
  { id: "tutor-session-mass-cancels", conceptId: "pendulum", topicId: "oscillations", title: "Why does mass cancel here?", daysAgo: 6, userTurns: ["Why does mass cancel in the pendulum period?", "Is that always true?"], assistantTurns: [{ text: "In T = 2π√(L/g), inertial mass and gravitational mass enter as a ratio that cancels for a simple pendulum.", source: "AI_EXPLANATION", equation: "T = 2π√(L/g)" }, { text: "The cancellation assumes a point bob, a massless rod, and small amplitude. It is not a universal claim about all oscillators.", source: "AI_EXPLANATION" }] },
  { id: "tutor-session-projectile-visual", conceptId: "projectile-motion", topicId: "projectile-motion", title: "Can you explain projectile motion visually?", daysAgo: 2, userTurns: ["Can you explain projectile motion visually?", "What stays constant?"], assistantTurns: [{ text: "Imagine two independent motions: a steady horizontal drift and a vertical motion that gravity steadily changes.", source: "AI_EXPLANATION" }, { text: "Horizontal velocity stays constant if air resistance is neglected. Vertical velocity decreases by about 9.8 m/s each second if up is positive.", source: "VERIFIED_CALCULATION" }] },
  { id: "tutor-session-potential", conceptId: "electric-potential", topicId: "electricity", title: "I don't understand electric potential.", daysAgo: 8, userTurns: ["I don't understand electric potential.", "Is it the same as potential energy?"], assistantTurns: [{ text: "Potential is potential energy per unit charge. A 12 V difference means 12 J of electric potential energy per coulomb.", source: "AI_EXPLANATION", equation: "V = U/q" }, { text: "Potential energy still depends on the charge you place in that landscape. Potential is the landscape itself.", source: "AI_EXPLANATION" }] },
  { id: "tutor-session-units", conceptId: "work", topicId: "energy", title: "Help me check my units.", daysAgo: 1, userTurns: ["Help me check my units.", "I got N·m but expected J."], assistantTurns: [{ text: "A joule is a newton-meter. If the quantity is work or energy, N·m and J are the same unit.", source: "VERIFIED_CALCULATION" }, { text: "Torque is also N·m, so keep the name of the quantity visible: work versus torque.", source: "AI_EXPLANATION" }] },
];

const FOLLOW_UPS = [
  "What is a free-body diagram for?",
  "When is energy conserved?",
  "How do I know which kinematics equation to use?",
  "Why is the normal force not always mg?",
  "What does a negative acceleration mean?",
  "Can you give a hint without the answer?",
  "How is impulse different from force?",
  "What is an ohmic resistor?",
  "Why do we use radians in SHM?",
  "Is E = mc² usable in chemistry class?",
  "How do I read a velocity–time graph?",
  "What is a field line actually telling me?",
  "Why is current the same in series?",
  "When does Snell's law fail?",
  "What is a photon's momentum?",
  "How small is a de Broglie wavelength for a baseball?",
  "What is gauge pressure?",
  "Why is entropy not just disorder?",
  "How do I choose a system for momentum?",
  "What does constructive interference require?",
  "Can mass be negative in F = ma?",
  "What is the difference between heat and temperature?",
  "How does a transformer change voltage?",
  "Why is c the same in every inertial frame?",
  "What is a node on a standing wave?",
  "How do I separate weight from mass?",
  "Why is work zero when force is perpendicular to displacement?",
  "Can a satellite be in free fall?",
  "What does an ohm measure besides resistance?",
  "Why do we draw the normal from the surface, not the ray?",
  "Is temperature the same as internal energy?",
  "How do I know a collision is inelastic?",
  "What is a field versus a force?",
  "Why does a transformer not change frequency?",
  "Can I use mgh far from Earth?",
  "What is a radian in a pendulum formula?",
  "How is current conserved at a junction?",
  "Why is the photoelectric graph a straight line?",
  "What does redshift actually measure?",
  "How small must an angle be for the pendulum model?",
  "Is centripetal force a new kind of force?",
  "What is the difference between emf and voltage drop?",
  "Why does a rolling object have two kinetic terms?",
  "How do I choose the system for energy?",
];

export function createTutorCatalog(userId: string): MockTutorSession[] {
  const core = PROMPTS.map((prompt) => {
    const messages = prompt.userTurns.flatMap((text, index) => {
      const reply = prompt.assistantTurns[index];
      return [
        { id: `${prompt.id}-u${index}`, role: "user" as const, text, source: "MOCK_TUTOR" as const, createdAt: isoDaysAgo(prompt.daysAgo, 8 - index) },
        { id: `${prompt.id}-a${index}`, role: "assistant" as const, text: reply.text, source: reply.source, createdAt: isoDaysAgo(prompt.daysAgo, 8 - index), equationCard: reply.equation },
      ];
    });
    return createMockTutorSession({
      id: prompt.id,
      userId,
      conceptId: prompt.conceptId,
      topicId: prompt.topicId,
      title: prompt.title,
      startedAt: isoDaysAgo(prompt.daysAgo, 9),
      updatedAt: isoDaysAgo(prompt.daysAgo, 7),
      messages,
      suggestedQuestions: FOLLOW_UPS.slice(0, 4),
      answer: createMockTutorAnswer(prompt.title),
    });
  });

  const extras = FOLLOW_UPS.map((question, index) => {
    const conceptId = ["kinematics", "energy", "circuits", "optics", "waves"][index % 5];
    const answer = createMockTutorAnswer(question);
    const extraMessages = [
      { id: `tutor-extra-${index}-u0`, role: "user" as const, text: question, source: "MOCK_TUTOR" as const, createdAt: isoDaysAgo(1 + (index % 28), 3) },
      { id: `tutor-extra-${index}-a0`, role: "assistant" as const, text: answer.summary, source: "AI_EXPLANATION" as const, createdAt: isoDaysAgo(1 + (index % 28), 3) },
      { id: `tutor-extra-${index}-u1`, role: "user" as const, text: "Can you show the equation?", source: "MOCK_TUTOR" as const, createdAt: isoDaysAgo(1 + (index % 28), 2) },
      { id: `tutor-extra-${index}-a1`, role: "assistant" as const, text: answer.equations[0] ?? "Name the knowns, then the governing relation.", source: "VERIFIED_CALCULATION" as const, createdAt: isoDaysAgo(1 + (index % 28), 2), equationCard: answer.equations[0] },
    ];
    if (index % 2 === 0) {
      extraMessages.push(
        { id: `tutor-extra-${index}-u2`, role: "user" as const, text: "What should I try in the lab?", source: "MOCK_TUTOR" as const, createdAt: isoDaysAgo(1 + (index % 28), 1) },
        { id: `tutor-extra-${index}-a2`, role: "assistant" as const, text: "Change one variable in the matching simulation and keep the others fixed.", source: "AI_EXPLANATION" as const, createdAt: isoDaysAgo(1 + (index % 28), 1) },
      );
    }
    return createMockTutorSession({
      id: `tutor-session-extra-${index + 1}`,
      userId,
      conceptId,
      topicId: conceptId,
      title: question,
      startedAt: isoDaysAgo(1 + (index % 28), 4),
      updatedAt: isoDaysAgo(1 + (index % 28), 1),
      messages: extraMessages,
      suggestedQuestions: [FOLLOW_UPS[(index + 1) % FOLLOW_UPS.length], FOLLOW_UPS[(index + 2) % FOLLOW_UPS.length]],
      answer,
    });
  });

  return [...core, ...extras];
}
