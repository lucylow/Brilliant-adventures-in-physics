import { rankRecommendations } from "@/lib/monetization/content-map";
import type { MockConcept, MockLearnerProfile, MockLesson, MockMastery, MockMission, MockProblem, MockRecommendationSet, MockSimulation } from "./types";

export function buildRecommendations(input: {
  user: MockLearnerProfile;
  concepts: readonly MockConcept[];
  lessons: readonly MockLesson[];
  problems: readonly MockProblem[];
  simulations: readonly MockSimulation[];
  missions: readonly MockMission[];
  mastery: readonly MockMastery[];
}): MockRecommendationSet {
  const masteryByConcept = new Map(input.mastery.map((item) => [item.conceptId, item.masteryPercent / 100]));
  const masteryOf = (id: string) => masteryByConcept.get(id) ?? input.user.masterySummary[id] ?? 0;

  const weak = [...input.concepts]
    .filter((concept) => masteryOf(concept.id) > 0 && masteryOf(concept.id) < 0.7)
    .sort((a, b) => masteryOf(a.id) - masteryOf(b.id) || a.id.localeCompare(b.id));

  const locked = (concept: MockConcept) => concept.prerequisites.some((id) => masteryOf(id) < 0.7);
  const nextOpen = input.concepts.filter((concept) => !locked(concept) && masteryOf(concept.id) < 0.8);

  const lessonIds = nextOpen
    .map((concept) => input.lessons.find((lesson) => lesson.conceptId === concept.id)?.id)
    .filter((id): id is string => Boolean(id))
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, 6);

  const weakIds = new Set(weak.map((concept) => concept.id));
  const problemIds = input.problems
    .filter((problem) => weakIds.has(problem.conceptId) || input.user.favoriteTopics.includes(problem.topicId))
    .map((problem) => problem.id)
    .slice(0, 8);

  const simulationIds = rankRecommendations(
    input.simulations
      .filter((simulation) => simulation.featured || simulation.conceptIds.some((id) => nextOpen.some((concept) => concept.id === id)))
      .map((simulation) => ({ id: simulation.id })),
    () => false,
  )
    .map((item) => item.id)
    .slice(0, 6);

  const missionIds = input.missions
    .filter((mission) => mission.completionPercent < 1 && mission.requiredLevel <= input.user.level)
    .filter((mission) =>
      mission.conceptIds.every((id) => {
        const concept = input.concepts.find((item) => item.id === id);
        return concept ? !locked(concept) : false;
      }),
    )
    .map((mission) => mission.id)
    .slice(0, 5);

  const reasons: Record<string, string> = {};
  lessonIds.forEach((id) => { reasons[id] = "Prerequisites look ready; this lesson is the next coherent step."; });
  problemIds.forEach((id) => { reasons[id] = "This problem targets a topic still below comfortable mastery."; });
  simulationIds.forEach((id) => { reasons[id] = "A matching lab lets you see the same idea move."; });
  missionIds.forEach((id) => { reasons[id] = "This quest uses content you have already unlocked."; });

  return { lessons: lessonIds, problems: problemIds, simulations: simulationIds, missions: missionIds, reasons };
}
