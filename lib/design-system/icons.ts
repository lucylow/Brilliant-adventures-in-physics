import type { ComponentProps } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export type BavIconName =
  | "home"
  | "build"
  | "play"
  | "explore"
  | "tutor"
  | "streak"
  | "xp"
  | "mastery"
  | "camera"
  | "lens"
  | "simulation"
  | "arrow"
  | "arrowBack"
  | "check"
  | "warning"
  | "error"
  | "search"
  | "settings"
  | "bookmark"
  | "favorite"
  | "favoriteFilled"
  | "share"
  | "hint"
  | "equation"
  | "lab"
  | "profile"
  | "send"
  | "mic"
  | "attach"
  | "pause"
  | "reset"
  | "step"
  | "info"
  | "close"
  | "chevron"
  | "challenge"
  | "offline"
  | "copy";

type MaterialName = ComponentProps<typeof MaterialIcons>["name"];

export const BAV_ICON_MAP: Record<BavIconName, MaterialName> = {
  home: "home",
  build: "handyman",
  play: "play-circle-filled",
  explore: "explore",
  tutor: "chat-bubble",
  streak: "local-fire-department",
  xp: "star",
  mastery: "donut-large",
  camera: "photo-camera",
  lens: "biotech",
  simulation: "science",
  arrow: "arrow-forward",
  arrowBack: "arrow-back",
  check: "check",
  warning: "warning",
  error: "error-outline",
  search: "search",
  settings: "settings",
  bookmark: "bookmark-border",
  favorite: "favorite-border",
  favoriteFilled: "favorite",
  share: "share",
  hint: "lightbulb-outline",
  equation: "functions",
  lab: "science",
  profile: "person",
  send: "send",
  mic: "mic-none",
  attach: "attach-file",
  pause: "pause",
  reset: "refresh",
  step: "skip-next",
  info: "info-outline",
  close: "close",
  chevron: "chevron-right",
  challenge: "bolt",
  offline: "cloud-off",
  copy: "content-copy",
};

export function materialIconName(name: BavIconName): MaterialName {
  return BAV_ICON_MAP[name];
}
