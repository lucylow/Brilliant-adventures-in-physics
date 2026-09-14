export type RecoveryKind = "offline" | "error" | "empty" | "timeout" | "permission" | "persistence";

const COPY: Record<string, Record<RecoveryKind, string>> = {
  tutor: {
    offline: "You're offline. Your question is still on this device. Reconnect to retry Tutor.",
    error: "Tutor could not finish this explanation. Your draft is unchanged.",
    empty: "Ask a physics question to start Tutor.",
    timeout: "Tutor took too long to respond. Your question is still here.",
    permission: "Tutor does not need extra device permissions.",
    persistence: "Your Tutor draft could not be saved just now. It remains on screen.",
  },
  practice: {
    offline: "You're offline. Practice still works with local questions.",
    error: "That practice item could not be scored. Your other attempts are unchanged.",
    empty: "No practice questions match this filter yet.",
    timeout: "Practice took too long to save. Try again; your answer is still visible.",
    permission: "Practice does not need camera permission.",
    persistence: "The attempt could not be stored. Try again without losing the current question.",
  },
  lab: {
    offline: "You're offline. Lab experiments still run on this device.",
    error: "The experiment could not start. Check the values and try again.",
    empty: "Choose an experiment to begin.",
    timeout: "The simulation paused because a step took too long.",
    permission: "This lab experiment does not need camera permission.",
    persistence: "The lab completion could not be saved. The experiment is still available.",
  },
  lens: {
    offline: "You're offline. Physics Lens measurements stay on this device.",
    error: "The saved experiment could not be restored because its data is incomplete. Your other experiments are unaffected.",
    empty: "No Physics Lens measurements yet.",
    timeout: "Saving the experiment took too long. Your table is still on screen.",
    permission: "Camera access was not granted. You can continue with typed measurements.",
    persistence: "The Lens draft could not be saved. Your current measurements remain visible.",
  },
  scan: {
    offline: "You're offline. Scan can still solve typed values with the local engine.",
    error: "Those values could not be solved. Check speed and angle, then retry.",
    empty: "Type a problem or enter launch values to begin.",
    timeout: "Solving took too long. Your entered values are unchanged.",
    permission: "You can type the problem if the camera is unavailable.",
    persistence: "The scanned problem could not be stored. The values are still on screen.",
  },
  lesson: {
    offline: "You're offline. The lesson still works from local content.",
    error: "This lesson could not load. Your other lessons are unaffected.",
    empty: "No lesson is selected.",
    timeout: "The lesson took too long to update. Your place is unchanged.",
    permission: "Lessons do not need camera permission.",
    persistence: "Lesson completion could not be saved. You can retry from this screen.",
  },
  progress: {
    offline: "You're offline. Progress shown here is from this device.",
    error: "Progress could not be loaded. Retry without changing saved attempts.",
    empty: "Complete a lesson, lab, or practice item to see progress.",
    timeout: "Progress took too long to refresh. Existing totals were kept.",
    permission: "Progress does not need extra permissions.",
    persistence: "Progress could not be updated. Existing records were left unchanged.",
  },
  concepts: {
    offline: "You're offline. Concept search still works from the local registry.",
    error: "Concept search could not run. Try a simpler query.",
    empty: "No concepts match this search.",
    timeout: "Concept search timed out. Your query is still here.",
    permission: "Concepts do not need camera permission.",
    persistence: "Concept preferences could not be stored.",
  },
  settings: {
    offline: "You're offline. Settings still save on this device.",
    error: "Settings could not be loaded. Preferences were not overwritten.",
    empty: "No extra settings to show.",
    timeout: "Saving settings took too long. The previous values were kept.",
    permission: "Some media settings need permission only when you capture.",
    persistence: "Preferences storage is unreadable, so it was not overwritten.",
  },
  notebook: {
    offline: "You're offline. Notebook entries stay on this device.",
    error: "The notebook could not be restored because a record is incomplete. Other notes are unaffected.",
    empty: "No notebook entries yet.",
    timeout: "Saving the note took too long. The text is still on screen.",
    permission: "Notebook image previews are local-only.",
    persistence: "The note could not be stored. Your draft text remains.",
  },
  onboarding: {
    offline: "You're offline. Onboarding still saves on this device.",
    error: "Onboarding could not be restored. You can continue from the first step.",
    empty: "Start onboarding to choose a learning path.",
    timeout: "Saving your path took too long. Your selections are still visible.",
    permission: "Onboarding does not need camera permission.",
    persistence: "Onboarding storage is unreadable, so it was not overwritten.",
  },
  upgrade: {
    offline: "You're offline. Free study tools still work. Catalog prices are not invented.",
    error: "Upgrade details are unavailable because the store catalog is empty.",
    empty: "No store products are available on this device.",
    timeout: "The store took too long to respond. No purchase was made.",
    permission: "Purchases are handled by the platform store when available.",
    persistence: "Purchase state could not be stored. No fake entitlement was created.",
  },
};

export function recoveryCopy(feature: string, kind: RecoveryKind): string {
  return COPY[feature]?.[kind] ?? "This activity could not finish. Your local study data was not changed.";
}

export const RECOVERY_FEATURES = Object.keys(COPY);

export type ScreenStatus = "loading" | "success" | "empty" | "error" | "offline";

export function screenStatusFromFlags(input: {
  loading?: boolean;
  offline?: boolean;
  error?: boolean;
  empty?: boolean;
}): ScreenStatus {
  if (input.loading) return "loading";
  if (input.offline) return "offline";
  if (input.error) return "error";
  if (input.empty) return "empty";
  return "success";
}
