import { clone } from "../utils/clone";
import { isoDaysAgo } from "../clock";
import { createMockTutorAnswer } from "@/lib/ai";
import type { MockTutorSession } from "../types";

export function createMockTutorSession(overrides: Partial<MockTutorSession> = {}): MockTutorSession {
  const question = "What is acceleration?";
  const answer = createMockTutorAnswer(question);
  return clone({
    id: "tutor-session-acceleration",
    userId: "user-maya",
    topicId: "kinematics",
    conceptId: "kinematics",
    title: "Acceleration versus velocity",
    startedAt: isoDaysAgo(4, 8),
    updatedAt: isoDaysAgo(4, 7),
    suggestedQuestions: ["Can acceleration be negative while speed increases?", "How do I read acceleration from a velocity graph?"],
    answer,
    messages: [
      { id: "m1", role: "user", text: question, source: "MOCK_TUTOR", createdAt: isoDaysAgo(4, 8) },
      { id: "m2", role: "assistant", text: "Acceleration is the rate of change of velocity, including direction. Speed can stay large while acceleration is zero.", source: "AI_EXPLANATION", createdAt: isoDaysAgo(4, 8) },
      { id: "m3", role: "user", text: "So moving fast does not mean accelerating?", source: "MOCK_TUTOR", createdAt: isoDaysAgo(4, 7) },
      { id: "m4", role: "assistant", text: "Exactly. Constant velocity means zero acceleration. A car on cruise control on a straight road is the usual example.", source: "AI_EXPLANATION", createdAt: isoDaysAgo(4, 7) },
    ],
    ...overrides,
  });
}
