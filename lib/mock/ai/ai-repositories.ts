import { waitMockAILatency } from "./ai-latency";
import { getExplanations, getMisconceptions } from "./datasets/libraries";
import { getPracticeFeedback, getSolutions } from "./datasets/practice";
import { getScanAnalyses } from "./datasets/scans-graphs";
import { getLearningPlans, rankRecommendations } from "./datasets/study";
import { getTutorConversations } from "./datasets/conversations";
import type { ExplanationResponse, LearningPlanResponse, PracticeFeedbackResponse, RecommendationResponse, ScanAnalysisResponse, TutorConversation } from "./ai-types";

async function delay<T>(value: T, signal?: AbortSignal): Promise<T> {
  await waitMockAILatency(signal);
  return value;
}

export class MockTutorRepository {
  async listByUser(userId: string, signal?: AbortSignal): Promise<TutorConversation[]> {
    return delay(getTutorConversations().filter((item) => item.userId === userId || item.userId.startsWith("demo-")), signal);
  }
  async get(id: string, signal?: AbortSignal): Promise<TutorConversation | undefined> {
    return delay(getTutorConversations().find((item) => item.id === id), signal);
  }
}

export class MockAIExplanationRepository {
  async listForConcept(conceptId: string, signal?: AbortSignal): Promise<ExplanationResponse[]> {
    return delay(getExplanations().filter((item) => item.conceptId === conceptId), signal);
  }
  async misconceptions(conceptId: string, signal?: AbortSignal) {
    return delay(getMisconceptions().filter((item) => item.conceptId === conceptId), signal);
  }
}

export class MockAIRecommendationRepository {
  async ranked(signal?: AbortSignal): Promise<RecommendationResponse> {
    return delay(rankRecommendations({
      mastery: { kinematics: 0.8, momentum: 0.25 },
      recentMistakes: ["momentum:signError"],
      completedLessons: ["lesson-kinematics-foundations"],
      timeAvailableMin: 20,
      goal: "understand",
      difficultyPreference: "medium",
      recentTopics: ["kinematics"],
    }), signal);
  }
}

export class MockAIScanRepository {
  async list(signal?: AbortSignal): Promise<ScanAnalysisResponse[]> {
    return delay(getScanAnalyses(), signal);
  }
  async get(id: string, signal?: AbortSignal) {
    return delay(getScanAnalyses().find((item) => item.id === id), signal);
  }
}

export class MockAIFeedbackRepository {
  async forConcept(conceptId: string, signal?: AbortSignal): Promise<PracticeFeedbackResponse[]> {
    return delay(getPracticeFeedback().filter((item) => item.conceptId === conceptId), signal);
  }
  async solutions(conceptId: string, signal?: AbortSignal) {
    return delay(getSolutions().filter((item) => item.problemId.includes(conceptId) || item.unknown.length > 0), signal);
  }
}

export class MockAIPlanRepository {
  async list(signal?: AbortSignal): Promise<LearningPlanResponse[]> {
    return delay(getLearningPlans(), signal);
  }
}

export const mockTutorRepository = new MockTutorRepository();
export const mockAIExplanationRepository = new MockAIExplanationRepository();
export const mockAIRecommendationRepository = new MockAIRecommendationRepository();
export const mockAIScanRepository = new MockAIScanRepository();
export const mockAIFeedbackRepository = new MockAIFeedbackRepository();
export const mockAIPlanRepository = new MockAIPlanRepository();
