import { isMockModeEnabled } from "@/lib/mock/config";
import { getMockDataset } from "@/lib/mock/registry";
import { selectTutorSuggestions } from "@/lib/mock/expansion/selectors";
import type { TutorAnswer } from "@/lib/ai";
import type { ScreenStatus } from "@/lib/screen-recovery";

export type TutorMessageKind = "user" | "assistant" | "equation" | "verified" | "idea" | "hint" | "simulation" | "practice";

export type TutorMessageModel = {
  id: string;
  kind: TutorMessageKind;
  text: string;
  equation?: string;
  values?: Array<{ label: string; value: string }>;
  verified: boolean;
};

export type TutorViewModel = {
  status: ScreenStatus;
  title: string;
  subtitle: string;
  remaining: number;
  limit: number;
  suggested: string[];
  messages: TutorMessageModel[];
  inputState: "idle" | "typing" | "sending" | "disabled" | "error";
};

export function buildTutorViewModel(input: {
  remaining: number;
  limit: number;
  draft: string;
  submitting: boolean;
  error?: string | null;
  messages: Array<{ role: "user" | "assistant"; text: string }>;
  lastAnswer?: TutorAnswer | null;
}): TutorViewModel {
  const disabled = input.remaining <= 0;
  const inputState = input.submitting ? "sending" : input.error ? "error" : disabled ? "disabled" : input.draft.length > 0 ? "typing" : "idle";
  const cards: TutorMessageModel[] = [];
  const equation = input.lastAnswer?.equations[0];
  if (equation) {
    cards.push({
      id: "eq",
      kind: "equation",
      text: "Key equation",
      equation,
      verified: false,
    });
  }
  if (input.lastAnswer?.verifiedValues?.length) {
    cards.push({
      id: "verified",
      kind: "verified",
      text: "Deterministic engine result",
      values: input.lastAnswer.verifiedValues.map((item) => ({ label: item.name, value: `${item.value} ${item.unit}` })),
      verified: true,
    });
  }
  return {
    status: "success",
    title: "Bavi",
    subtitle: "AI Physics Tutor · Online",
    remaining: input.remaining,
    limit: input.limit,
    suggested: isMockModeEnabled() ? selectTutorSuggestions(getMockDataset()) : ["Hint", "Solve step-by-step", "Explain simpler", "Show simulation", "Similar problem"],
    messages: [
      ...input.messages.map((message, index) => ({
        id: `m-${index}`,
        kind: message.role,
        text: message.text,
        verified: false,
      })),
      ...cards,
    ],
    inputState,
  };
}

export function isVerifiedTutorCard(kind: TutorMessageKind, verified: boolean): boolean {
  return kind === "verified" && verified;
}
