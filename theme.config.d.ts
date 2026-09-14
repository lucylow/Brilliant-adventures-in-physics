export const themeColors: {
  primary: { light: string; dark: string };
  primaryPressed: { light: string; dark: string };
  primaryMuted: { light: string; dark: string };
  background: { light: string; dark: string };
  surface: { light: string; dark: string };
  surfaceElevated: { light: string; dark: string };
  surfaceTint: { light: string; dark: string };
  foreground: { light: string; dark: string };
  muted: { light: string; dark: string };
  textSecondary: { light: string; dark: string };
  textMuted: { light: string; dark: string };
  border: { light: string; dark: string };
  success: { light: string; dark: string };
  successMuted: { light: string; dark: string };
  warning: { light: string; dark: string };
  warningMuted: { light: string; dark: string };
  error: { light: string; dark: string };
  errorMuted: { light: string; dark: string };
  info: { light: string; dark: string };
  infoMuted: { light: string; dark: string };
  simulationBackground: { light: string; dark: string };
  simulationGrid: { light: string; dark: string };
  onPrimary: { light: string; dark: string };
};

declare const themeConfig: {
  themeColors: typeof themeColors;
};

export default themeConfig;
