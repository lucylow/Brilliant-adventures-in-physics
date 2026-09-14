import { clone } from "../utils/clone";
import type { MockDifficulty, MockLesson } from "../types";

export function createMockLesson(overrides: Partial<MockLesson> = {}): MockLesson {
  return clone({
    id: "lesson-kinematics-foundations",
    topicId: "kinematics",
    title: "Read a motion graph",
    durationMin: 10,
    objectiveIds: ["describe-motion"],
    blocks: [
      { type: "explain", data: { title: "Position changes", body: "A kinematics description tracks where an object is and how that position changes, without yet naming the force that causes the change." } },
      { type: "equation", data: { formula: "v = v₀ + at", caption: "Constant-acceleration velocity" } },
    ],
    conceptId: "kinematics",
    subtitle: "Connect position, velocity, and acceleration with units kept visible.",
    difficulty: "easy" as MockDifficulty,
    learningObjectives: ["Distinguish velocity from speed", "Use a constant-acceleration equation with units"],
    introduction: "Kinematics is the language of motion. Before asking why something speeds up, we need a precise way to say how it moves.",
    sections: [
      { heading: "Position and displacement", body: "Position is a location relative to an origin. Displacement is the change in position, a vector. Distance travelled can be larger than displacement if the path turns around." },
      { heading: "Velocity and acceleration", body: "Average velocity is displacement over time. Acceleration is how velocity changes. An object can move quickly and still have zero acceleration if its velocity is constant." },
    ],
    equations: ["v = v₀ + at", "x = x₀ + v₀t + ½at²"],
    workedExample: {
      prompt: "A cart starts at 2 m/s and accelerates at 1.5 m/s² for 4 s. Find its final velocity.",
      steps: ["Identify v₀ = 2 m/s, a = 1.5 m/s², t = 4 s.", "Use v = v₀ + at.", "v = 2 + 1.5 × 4 = 8 m/s."],
      answer: "8 m/s",
    },
    checkpointQuestions: [{ prompt: "If acceleration is zero, what happens to velocity?", answer: "Velocity stays constant." }],
    simulationReference: "sim-kinematics-track",
    commonMistakes: ["Treating speed and velocity as interchangeable", "Using the wrong sign for acceleration"],
    summary: "Keep origin, signs, and units explicit. Constant acceleration connects velocity and position through two standard equations.",
    nextLessonId: "lesson-free-fall",
    ...overrides,
  });
}
