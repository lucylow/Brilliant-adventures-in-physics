import { MOCK_DATA_VERSION } from "./version";
import type { MockDataset, MockDatasetStats, MockScenarioId } from "./types";

export function getMockDatasetStats(dataset: MockDataset, scenario: MockScenarioId): MockDatasetStats {
  const difficultyCounts: Record<string, number> = {};
  for (const problem of dataset.problems) {
    difficultyCounts[problem.difficulty] = (difficultyCounts[problem.difficulty] ?? 0) + 1;
  }
  const topicCounts: Record<string, number> = {};
  for (const concept of dataset.concepts) {
    topicCounts[concept.topicId] = (topicCounts[concept.topicId] ?? 0) + 1;
  }
  const masteryAverage = dataset.mastery.length
    ? dataset.mastery.reduce((sum, item) => sum + item.masteryPercent, 0) / dataset.mastery.length
    : 0;
  return {
    scenario,
    version: MOCK_DATA_VERSION,
    entityCounts: {
      users: dataset.users.length,
      topics: dataset.topics.length,
      concepts: dataset.concepts.length,
      lessons: dataset.lessons.length,
      equations: dataset.equations.length,
      problems: dataset.problems.length,
      attempts: dataset.attempts.length,
      mastery: dataset.mastery.length,
      simulations: dataset.simulations.length,
      experiments: dataset.experiments.length,
      missions: dataset.missions.length,
      achievements: dataset.achievements.length,
      tutorSessions: dataset.tutorSessions.length,
      notebook: dataset.notebook.length,
      notifications: dataset.notifications.length,
      activity: dataset.activity.length,
      reviewQueue: dataset.reviewQueue.length,
      lensRecords: dataset.lensRecords.length,
      discoveryCards: dataset.expansion?.discoveryCards.length ?? 0,
      labExperiments: dataset.expansion?.labExperiments.length ?? 0,
      dailyChallenges: dataset.expansion?.dailyChallenges.length ?? 0,
      questionsOfTheDay: dataset.expansion?.questionsOfTheDay.length ?? 0,
      misconceptions: dataset.expansion?.misconceptions.length ?? 0,
      flashcards: dataset.expansion?.flashcards.length ?? 0,
      facts: dataset.expansion?.facts.length ?? 0,
      microLessons: dataset.expansion?.microLessons.length ?? 0,
      graphs: dataset.expansion?.graphs.length ?? 0,
    },
    topicCounts,
    difficultyCounts,
    completion: {
      lessons: dataset.learningState.lessonsCompleted,
      labs: dataset.learningState.labsCompleted,
      missions: dataset.missions.filter((mission) => mission.completionPercent >= 1).length,
    },
    masteryAverage,
  };
}
