import { CATALOG } from "../ai-catalog";
import { getLearnerModel } from "./learner-model";
import { personalizeExplanation, selectTeachingStrategy } from "./personalize";
import { decideIntervention } from "./adaptive";
import { getSimulationCopilotTurns } from "./copilots";
import { getWhatIfScenarios } from "./what-if";
import { classifyDialogueIntent } from "./dialogue";
import type { AIDemoShowcaseId, LearnerModelId } from "./types";
import { learnerIdForTestUser } from "./orchestration";

export type ReplayBeat = {
  t: string;
  speaker: "user" | "assistant" | "system";
  text: string;
  conceptId?: string;
};

export type DemoReplay = {
  id: AIDemoShowcaseId;
  title: string;
  learnerId: LearnerModelId;
  seed: string;
  beats: ReplayBeat[];
  notes: string;
};

function topic(id: string) {
  return CATALOG.find((item) => item.id === id) ?? CATALOG.find((item) => item.conceptId === id) ?? CATALOG[0];
}

export function getDemoReplays(): DemoReplay[] {
  const projectile = topic("projectile-split");
  const ohm = topic("ohm-circuit");
  const wave = topic("wave-vfl");
  const optics = topic("snell-bend");
  return [
    {
      id: "tutor",
      title: "Tutor Demo",
      learnerId: "intermediate",
      seed: "showcase-tutor",
      notes: "Same prompt always yields the same Demo AI card while mock mode is on.",
      beats: [
        { t: "00:00", speaker: "user", text: projectile.starters[1] ?? projectile.example.prompt, conceptId: projectile.conceptId },
        { t: "00:04", speaker: "assistant", text: `${projectile.oneSentence} Model ${projectile.equation}.`, conceptId: projectile.conceptId },
        { t: "00:12", speaker: "user", text: "What happens if mass doubles?", conceptId: projectile.conceptId },
        { t: "00:15", speaker: "assistant", text: "In the vacuum model, range is independent of mass. Drag would change that; Demo AI will not silently keep the idealization if you add air.", conceptId: projectile.conceptId },
      ],
    },
    {
      id: "scan",
      title: "Scan Demo",
      learnerId: "visual",
      seed: "showcase-scan",
      notes: "Mock OCR only. Unreadable images ask for typed knowns.",
      beats: [
        { t: "00:00", speaker: "system", text: "Fixture: textbook problem image for projectile range." },
        { t: "00:03", speaker: "assistant", text: `Detected knowns (mock): ${projectile.example.known.map((item) => `${item.name}=${item.value}${item.unit}`).join(", ")}.` },
        { t: "00:08", speaker: "user", text: "Why is this force here?", conceptId: projectile.conceptId },
        { t: "00:11", speaker: "assistant", text: "After launch the vacuum model has no horizontal force. Weight talks only to v_y." },
      ],
    },
    {
      id: "experiment",
      title: "Experiment Demo",
      learnerId: "simulation",
      seed: "showcase-experiment",
      notes: "Observed, inferred, and expected stay three separate sentences.",
      beats: [
        { t: "00:00", speaker: "user", text: `Help with setup of ${projectile.experiment.name}.` },
        { t: "00:04", speaker: "assistant", text: projectile.experiment.objective },
        { t: "00:20", speaker: "user", text: "What should I conclude?" },
        { t: "00:24", speaker: "assistant", text: `Observed: ${projectile.experiment.observation}. Inferred: a pattern consistent with ${projectile.equation} inside the stated assumptions. Expected: ${projectile.example.principle}.` },
      ],
    },
    {
      id: "exam",
      title: "Exam Demo",
      learnerId: "exam",
      seed: "showcase-exam",
      notes: "Coaching for learning, not a live exam leak.",
      beats: [
        { t: "00:00", speaker: "user", text: ohm.example.prompt, conceptId: ohm.conceptId },
        { t: "00:05", speaker: "assistant", text: `Trap: ${ohm.commonMistake}. Start from ${ohm.equation}.` },
        { t: "00:18", speaker: "system", text: "20-minute plan rebuilt from the exam learner's weak topics." },
      ],
    },
    {
      id: "simulation",
      title: "Simulation Demo",
      learnerId: "simulation",
      seed: "showcase-sim",
      notes: "Copilot answers use the local engine when a number is claimed.",
      beats: [
        { t: "00:00", speaker: "user", text: "What should I change?", conceptId: projectile.conceptId },
        { t: "00:03", speaker: "assistant", text: getSimulationCopilotTurns().find((item) => item.conceptId === projectile.conceptId)?.assistant ?? projectile.intuitionFirst },
        { t: "00:10", speaker: "user", text: "What if gravity halves?", conceptId: projectile.conceptId },
        { t: "00:13", speaker: "assistant", text: (() => {
          const row = getWhatIfScenarios().find((item) => item.parameter === "g" && item.conceptId === projectile.conceptId);
          return row ? `${row.principle} ${row.after.name}=${row.after.value} ${row.after.unit} under ${row.assumption}.` : projectile.equation;
        })() },
      ],
    },
    {
      id: "personalization",
      title: "Personalization Demo",
      learnerId: "beginner",
      seed: "showcase-pers",
      notes: "Same concept, different factory → different lead-in.",
      beats: [
        { t: "00:00", speaker: "system", text: `Beginner strategy ${selectTeachingStrategy(getLearnerModel("beginner"), "kinematics")}: ${personalizeExplanation("kinematics", "beginner").summary}` },
        { t: "00:08", speaker: "system", text: `Exam strategy ${selectTeachingStrategy(getLearnerModel("exam"), "kinematics")}: ${personalizeExplanation("kinematics", "exam").summary}` },
      ],
    },
    {
      id: "recovery",
      title: "Recovery Demo",
      learnerId: "returning",
      seed: "showcase-rec",
      notes: "No catch-up guilt. A short recap is a restart.",
      beats: [
        { t: "00:00", speaker: "system", text: decideIntervention(getLearnerModel("returning")).message },
        { t: "00:06", speaker: "assistant", text: "Six minutes on a familiar kinematics recap is enough. Demo AI will not scold a gap." },
      ],
    },
    {
      id: "streaming",
      title: "Streaming Demo",
      learnerId: "intermediate",
      seed: "showcase-str",
      notes: "Blocks arrive incrementally; cancel is first-class. Uses Expansion I stream scenarios.",
      beats: [
        { t: "00:00", speaker: "assistant", text: "Demo AI" },
        { t: "00:01", speaker: "assistant", text: projectile.oneSentence },
        { t: "00:02", speaker: "assistant", text: projectile.equation },
        { t: "00:03", speaker: "system", text: "complete" },
      ],
    },
    {
      id: "verification",
      title: "Verification Demo",
      learnerId: "advanced",
      seed: "showcase-ver",
      notes: "Numbers go through lib/physics. Mismatch is visible, not hidden.",
      beats: [
        { t: "00:00", speaker: "user", text: projectile.example.prompt },
        { t: "00:04", speaker: "assistant", text: `Verified range uses the deterministic projectile engine. Equation ${projectile.equation} is the local model, not a live-provider claim.` },
      ],
    },
    {
      id: "multimodal",
      title: "Multimodal Demo",
      learnerId: "visual",
      seed: "showcase-mm",
      notes: "Circuit / ray / graph fixtures keep valid simulation and lesson references.",
      beats: [
        { t: "00:00", speaker: "user", text: `Read this circuit with the ${ohm.title} question.`, conceptId: ohm.conceptId },
        { t: "00:04", speaker: "assistant", text: `Label battery, resistors, and nodes before writing ${ohm.equation}. This is mock vision.` },
        { t: "00:12", speaker: "user", text: `Angles on this ${optics.title} ray diagram.`, conceptId: optics.conceptId },
        { t: "00:16", speaker: "assistant", text: `Angles are measured from the normal. ${optics.equation}` },
        { t: "00:22", speaker: "user", text: classifyDialogueIntent(`How do I use ${wave.equation} for ${wave.title} without skipping units?`).prompt, conceptId: wave.conceptId },
        { t: "00:26", speaker: "assistant", text: wave.oneSentence },
      ],
    },
  ];
}

export function replayForShowcase(id: AIDemoShowcaseId): DemoReplay {
  return getDemoReplays().find((item) => item.id === id) ?? getDemoReplays()[0];
}

export function replayForTestUser(state: Parameters<typeof learnerIdForTestUser>[0]): DemoReplay {
  const learnerId = learnerIdForTestUser(state);
  return getDemoReplays().find((item) => item.learnerId === learnerId) ?? getDemoReplays()[0];
}
