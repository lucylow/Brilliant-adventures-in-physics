export const uiTokens = {
  spacing: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32 },
  radius: { sm: 10, md: 14, lg: 18, pill: 999 },
  touch: { minimum: 44 },
  type: { title: 28, section: 21, body: 16, caption: 12 },
} as const;

export function responsiveGutter(width = 375): number {
  return width >= 600 ? 28 : width <= 360 ? 16 : 20;
}

export function safeKeyboardOffset(platform: string): number {
  return platform === "ios" ? 12 : 8;
}

export function accessibilityActionLabel(action: string, subject: string): string {
  return `${action} ${subject}`.trim();
}
