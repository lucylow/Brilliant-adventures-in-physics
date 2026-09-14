import { isoDaysAgo } from "../clock";
import type { ActivityKind, MockActivity, MockAttempt, MockExperiment, MockMission, MockTutorSession } from "../types";

export function createActivityFeed(input: {
  userId: string;
  attempts: readonly MockAttempt[];
  missions: readonly MockMission[];
  experiments: readonly MockExperiment[];
  tutorSessions: readonly MockTutorSession[];
}): MockActivity[] {
  const items: MockActivity[] = [];
  for (const attempt of input.attempts.slice(-40)) {
    items.push({
      id: `activity-attempt-${attempt.id}`,
      userId: input.userId,
      kind: "problem-solved",
      title: attempt.isCorrect ? "Solved a practice problem" : attempt.abandoned ? "Left a problem unfinished" : "Missed a practice problem",
      detail: attempt.isCorrect ? `Earned ${attempt.xpEarned} XP` : "Recorded locally for review",
      occurredAt: attempt.submittedAt,
      xp: attempt.xpEarned,
      referenceId: attempt.problemId,
    });
  }
  input.missions.filter((mission) => mission.completionPercent >= 1).forEach((mission) => {
    items.push({ id: `activity-mission-${mission.id}`, userId: input.userId, kind: "mission-completed", title: `Completed “${mission.title}”`, detail: mission.hook, occurredAt: isoDaysAgo(3, 4), xp: mission.rewardXp, referenceId: mission.id });
  });
  input.experiments.slice(0, 12).forEach((experiment) => {
    items.push({ id: `activity-exp-${experiment.id}`, userId: input.userId, kind: "experiment-saved", title: `Lab: ${experiment.title}`, detail: experiment.summary, occurredAt: experiment.createdAt, referenceId: experiment.id });
  });
  input.tutorSessions.slice(0, 12).forEach((session) => {
    items.push({ id: `activity-tutor-${session.id}`, userId: input.userId, kind: "tutor-asked", title: `Asked Tutor: ${session.title}`, detail: session.messages[0]?.text ?? session.title, occurredAt: session.startedAt, referenceId: session.id });
  });
  const extras: Array<[ActivityKind, string]> = [
    ["lesson-completed", "Completed “Newton's Laws”"],
    ["simulation-run", "Ran Projectile Lab"],
    ["achievement-unlocked", "Unlocked First Discovery"],
    ["review", "Reviewed Energy"],
    ["simulation-saved", "Saved a spring snapshot"],
    ["module-started", "Started Quantum module"],
    ["notebook-saved", "Saved a sign-convention note"],
  ];
  extras.forEach(([kind, title], index) => {
    items.push({ id: `activity-extra-${index}`, userId: input.userId, kind, title, detail: "Local mock activity for the home and progress feeds.", occurredAt: isoDaysAgo(index + 1, 6), xp: kind === "achievement-unlocked" ? 15 : 8 });
  });
  return items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 140);
}
