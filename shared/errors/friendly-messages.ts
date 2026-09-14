import { ERROR_CODES, type ErrorCode } from "./error-codes";

export type FriendlyMessageContext = {
  operation?: string;
  feature?: string;
  detail?: string;
};

const FEATURE_COPY: Record<string, string> = {
  tutor: "Tutor",
  practice: "Practice",
  lab: "Lab",
  lens: "Physics Lens",
  scan: "Scan",
  lesson: "this lesson",
  progress: "Progress",
  concepts: "Concepts",
  settings: "Settings",
  notebook: "Notebook",
  onboarding: "onboarding",
  upgrade: "Upgrade",
  experiment: "this experiment",
};

export function featureLabel(feature?: string): string {
  if (!feature) return "this activity";
  return FEATURE_COPY[feature] ?? "this activity";
}

export function defaultFriendlyMessage(code: ErrorCode, context: FriendlyMessageContext = {}): string {
  const activity = featureLabel(context.feature);
  switch (code) {
    case ERROR_CODES.VALIDATION:
      return context.detail
        ? `${context.detail} Check the value and try again.`
        : `That input could not be used yet. Check the values for ${activity} and try again.`;
    case ERROR_CODES.PERSISTENCE:
      return `Your current work is still on this device. ${activity} could not be saved just now. Try again in a moment.`;
    case ERROR_CODES.NETWORK:
      return `You're offline. Your current experiment is safe on this device. Reconnect to retry ${activity}.`;
    case ERROR_CODES.TIMEOUT:
      return `${activity} took too long to respond. Your local work is unchanged. Check the connection and try again.`;
    case ERROR_CODES.AUTHENTICATION:
      return `Sign-in is needed before ${activity} can continue. Your local study data was not changed.`;
    case ERROR_CODES.AUTHORIZATION:
      return `This action is not available for the current account. Your local study data was not changed.`;
    case ERROR_CODES.NOT_FOUND:
      return `That item could not be found. Your other ${activity} data is unaffected.`;
    case ERROR_CODES.CONFLICT:
      return `${activity} could not be updated because a newer copy already exists. Reload and try again.`;
    case ERROR_CODES.RATE_LIMIT:
      return `${activity} is temporarily limited. Wait a moment, then retry. Your local work is safe.`;
    case ERROR_CODES.MEDIA_PERMISSION:
      return `Camera access was not granted. You can continue with typed measurements or enable permission in device settings.`;
    case ERROR_CODES.MEDIA_UNAVAILABLE:
      return `The camera or photo library is unavailable on this device. You can still enter measurements manually.`;
    case ERROR_CODES.PHYSICS_DOMAIN:
      return context.detail
        ? `Your experiment could not start because ${context.detail}`
        : `That value is outside the physical range for this experiment. Check the number and try again.`;
    case ERROR_CODES.SIMULATION:
      return `The simulation paused to keep results stable. Reset the experiment and try a smaller step or fewer particles.`;
    case ERROR_CODES.TUTOR_SERVICE:
      return `Tutor could not reach the explanation service. A clearly labeled local walkthrough is available, and no invented calculation was used.`;
    case ERROR_CODES.SERIALIZATION:
      return `The saved experiment could not be restored because its data is incomplete. Your other experiments are unaffected.`;
    case ERROR_CODES.MIGRATION:
      return `Saved data used an older format and could not be upgraded automatically. Your other records are unaffected.`;
    case ERROR_CODES.CONFIGURATION:
      return `This device is missing a required setting. ${activity} cannot start until configuration is complete.`;
    default:
      return `${activity} could not finish. Your local study data was not changed. You can retry or continue with what still works on this device.`;
  }
}
