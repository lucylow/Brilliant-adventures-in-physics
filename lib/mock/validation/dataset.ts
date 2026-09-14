import { z } from "zod";
import type { MockDataset } from "../types";

const id = z.string().min(1).max(120);
const iso = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "iso date");
const finite = z.number().finite();

export const mockUserSchema = z.object({
  id, displayName: z.string().min(1), xp: finite.nonnegative(), level: finite.int().positive(), streak: finite.nonnegative(),
});

export const mockTopicSchema = z.object({
  id, name: z.string().min(1), prerequisites: z.array(z.string()), conceptIds: z.array(z.string()),
});

export const mockConceptSchema = z.object({
  id, title: z.string().min(1), topicId: z.string().min(1), prerequisites: z.array(z.string()), difficulty: z.enum(["easy", "medium", "hard", "challenge"]),
});

export const mockLessonSchema = z.object({
  id, topicId: z.string(), conceptId: z.string(), title: z.string().min(1), durationMin: finite.positive(),
});

export const mockProblemSchema = z.object({
  id, conceptId: z.string(), topicId: z.string(), prompt: z.string().min(8), unit: z.string().min(1), finalAnswer: finite, xpReward: finite.nonnegative(),
});

export function validateMockDataset(dataset: MockDataset): string[] {
  const errors: string[] = [];
  const check = (label: string, result: { success: boolean; error?: { issues: Array<{ message: string }> } }) => {
    if (!result.success) errors.push(`${label}: ${result.error?.issues.map((issue) => issue.message).join("; ")}`);
  };
  dataset.users.forEach((user) => check(`user:${user.id}`, mockUserSchema.safeParse(user)));
  dataset.topics.forEach((topic) => check(`topic:${topic.id}`, mockTopicSchema.safeParse(topic)));
  dataset.concepts.forEach((concept) => check(`concept:${concept.id}`, mockConceptSchema.safeParse(concept)));
  dataset.lessons.forEach((lesson) => check(`lesson:${lesson.id}`, mockLessonSchema.safeParse(lesson)));
  dataset.problems.forEach((problem) => {
    check(`problem:${problem.id}`, mockProblemSchema.safeParse(problem));
    if (problem.xpReward < 0) errors.push(`problem:${problem.id} has negative XP`);
  });
  return errors;
}

export function validateMockReferences(dataset: MockDataset): string[] {
  const errors: string[] = [];
  const topicIds = new Set(dataset.topics.map((item) => item.id));
  const conceptIds = new Set(dataset.concepts.map((item) => item.id));
  const lessonIds = new Set(dataset.lessons.map((item) => item.id));
  const problemIds = new Set(dataset.problems.map((item) => item.id));
  const simulationIds = new Set(dataset.simulations.map((item) => item.id));

  for (const concept of dataset.concepts) {
    if (!topicIds.has(concept.topicId)) errors.push(`concept ${concept.id} topicId ${concept.topicId} is missing`);
    for (const prereq of concept.prerequisites) {
      if (!conceptIds.has(prereq)) errors.push(`concept ${concept.id} prerequisite ${prereq} is missing`);
    }
  }
  for (const lesson of dataset.lessons) {
    if (!conceptIds.has(lesson.conceptId)) errors.push(`lesson ${lesson.id} conceptId ${lesson.conceptId} is missing`);
    if (!topicIds.has(lesson.topicId)) errors.push(`lesson ${lesson.id} topicId ${lesson.topicId} is missing`);
    if (lesson.nextLessonId && !lessonIds.has(lesson.nextLessonId)) errors.push(`lesson ${lesson.id} nextLessonId ${lesson.nextLessonId} is missing`);
  }
  for (const problem of dataset.problems) {
    if (!conceptIds.has(problem.conceptId)) errors.push(`problem ${problem.id} conceptId ${problem.conceptId} is missing`);
    if (!topicIds.has(problem.topicId)) errors.push(`problem ${problem.id} topicId ${problem.topicId} is missing`);
  }
  for (const simulation of dataset.simulations) {
    for (const conceptId of simulation.conceptIds) {
      if (!conceptIds.has(conceptId)) errors.push(`simulation ${simulation.id} concept ${conceptId} is missing`);
    }
  }
  for (const mission of dataset.missions) {
    for (const step of mission.steps) {
      if (step.action === "lesson" && !lessonIds.has(step.referenceId) && !step.referenceId.startsWith("lesson-")) {
        errors.push(`mission ${mission.id} lesson step ${step.referenceId} is missing`);
      }
      if (step.action === "practice" && !problemIds.has(step.referenceId) && !step.referenceId.startsWith("problem-")) {
        errors.push(`mission ${mission.id} practice step ${step.referenceId} is missing`);
      }
      if (step.action === "simulation" && !simulationIds.has(step.referenceId) && !step.referenceId.startsWith("sim-")) {
        errors.push(`mission ${mission.id} simulation step ${step.referenceId} is missing`);
      }
    }
  }
  for (const attempt of dataset.attempts) {
    if (!problemIds.has(attempt.problemId)) errors.push(`attempt ${attempt.id} problem ${attempt.problemId} is missing`);
  }
  return errors;
}

export function assertValidMockDataset(dataset: MockDataset): void {
  const errors = [...validateMockDataset(dataset), ...validateMockReferences(dataset)];
  if (errors.length) throw new Error(`Mock dataset invalid:\n${errors.slice(0, 40).join("\n")}`);
}
