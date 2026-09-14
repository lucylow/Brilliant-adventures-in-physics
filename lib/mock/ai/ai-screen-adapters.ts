import { isMockAIEnabled } from "./config";
import { inspectMockAI } from "./ai-inspector";
import { selectPracticeFeedback, selectRankedRecommendations, selectReviewCoachMessage, selectSimulationRecommendation, selectTutorStarterPrompts } from "./ai-selectors";
import { getNotebookAssists } from "./datasets/assist";
import { getProgressNarratives } from "./datasets/study";
import { getScanAnalyses } from "./datasets/scans-graphs";

export function tutorScreenModel() {
  if (!isMockAIEnabled()) return null;
  return {
    demoLabel: "Demo AI — development mock responses, not a live provider.",
    starters: selectTutorStarterPrompts("tutor-screen", 4),
    inspector: inspectMockAI(),
  };
}

export function scanScreenModel() {
  if (!isMockAIEnabled()) return null;
  const scan = getScanAnalyses().find((item) => item.imageType === "textbook-problem") ?? getScanAnalyses()[0];
  return {
    demoLabel: "Demo AI scan — mock recognition, not a live vision provider.",
    scan,
  };
}

export function practiceScreenModel(conceptId: string) {
  if (!isMockAIEnabled()) return null;
  return {
    demoLabel: "Demo AI practice feedback",
    feedback: selectPracticeFeedback(conceptId),
  };
}

export function homeRecommendationModel() {
  if (!isMockAIEnabled()) return null;
  return {
    demoLabel: "Demo AI ranking (uses local mastery and mistakes, not popularity).",
    ranked: selectRankedRecommendations(),
  };
}

export function progressScreenModel() {
  if (!isMockAIEnabled()) return null;
  return {
    demoLabel: "Demo AI progress interpretation",
    narrative: getProgressNarratives()[0],
    coach: selectReviewCoachMessage(14),
  };
}

export function notebookScreenModel(conceptId: string) {
  if (!isMockAIEnabled()) return null;
  const assist = getNotebookAssists().find((item) => item.conceptId === conceptId) ?? getNotebookAssists()[0];
  return {
    demoLabel: "Demo AI notebook assistance — generated text is labeled, not live.",
    assist,
  };
}

export function simulationScreenModel(conceptId: string) {
  if (!isMockAIEnabled()) return null;
  return {
    demoLabel: "Demo AI simulation recommendation",
    recommendation: selectSimulationRecommendation(conceptId),
  };
}
