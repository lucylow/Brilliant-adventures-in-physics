import { EXPERIMENT_LOOP, nextLensStage, type LensStage } from "./feature-contracts";

export type LensSession = {
  stage: LensStage;
  scene: string;
  prediction: string;
  measurement: string;
  reflection: string;
};

export const lensStagePrompts: Record<LensStage, string> = {
  observe: "Describe what you can observe without explaining it yet.",
  predict: "Write one testable prediction before measuring.",
  measure: "Record one measurement and include its unit.",
  model: "Name the physics principle or equation you will use.",
  simulate: "Compare your prediction with a deterministic model.",
  compare: "Compare the measurement with your prediction.",
  reflect: "Write one thing you learned or would test next.",
};

export const lensStagePromptKeys: Record<LensStage, string> = {
  observe: "lens.stage.observe",
  predict: "lens.stage.predict",
  measure: "lens.stage.measure",
  model: "lens.stage.model",
  simulate: "lens.stage.simulate",
  compare: "lens.stage.compare",
  reflect: "lens.stage.reflect",
};

export function emptyLensSession(): LensSession { return { stage: "observe", scene: "", prediction: "", measurement: "", reflection: "" }; }

export function canAdvanceLens(session: LensSession): boolean {
  if (session.stage === "observe") return session.scene.trim().length >= 3;
  if (session.stage === "predict") return session.prediction.trim().length >= 3;
  if (session.stage === "measure") return session.measurement.trim().length >= 1;
  if (session.stage === "reflect") return session.reflection.trim().length >= 3;
  return true;
}

export function advanceLens(session: LensSession): LensSession {
  if (!canAdvanceLens(session)) throw new Error("Complete the current Lens step before continuing");
  return { ...session, stage: nextLensStage(session.stage) ?? session.stage };
}

export function lensProgress(stage: LensStage): number {
  const index = EXPERIMENT_LOOP.indexOf(stage);
  return index < 0 ? 0 : (index + 1) / EXPERIMENT_LOOP.length;
}
