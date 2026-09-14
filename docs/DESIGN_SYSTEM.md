# B.A.V. design system

The Figma Make redesign is implemented as a reusable token and component layer inside this Expo app. Screens consume `lib/design-system` and `components/bav`. They do not hardcode screenshot values.

## Tokens

Source of color truth: `theme.config.js` (wired into NativeWind and `useColors()`).

Semantic layout lives in `lib/design-system/tokens.ts`:

- `background` / `surface` / `surfaceElevated`
- `primary` / `primaryPressed` / `primaryMuted`
- `foreground` / `textSecondary` / `textMuted`
- `success` / `warning` / `error` / `info`
- `simulationBackground` for dark scientific canvases

Spacing, radius, touch targets, z-index, and motion durations are named tokens. Do not scatter raw hex values in screens.

## Typography

Primitives in `components/bav/BavText.tsx`: Display, Heading1–3, Body, BodyMedium, BodySmall, Caption, Overline, Equation, Metric, Button, Navigation.

Equations use the mono ramp. Dynamic Type is allowed with per-variant max multipliers.

## Components

Import from `@/components/bav`.

Required states: default, pressed, disabled, loading (where relevant), accessibility labels, 44pt minimum targets.

Card elevations: `flat`, `border`, `soft`, `featured`, `scientific`.

## Changing tokens

1. Edit `theme.config.js` and `theme.config.d.ts`.
2. Keep semantic names in `lib/design-system/tokens.ts` in sync if layout constants change.
3. Run `pnpm check` and `pnpm test`.

## Adding a component

Place it in `components/bav/`, export from `components/bav/index.ts`, and prefer tokens over literals.

## Adding a screen

Use `ScrollScreen` / `DetailScreen` / `ChatScreenShell` / `ExperimentScreen` from `components/layout`. Build a view model in `lib/view-models` so the UI does not know whether data is mock or live.

## Mock data

`EXPO_PUBLIC_USE_MOCK_DATA=true` enables mock mode outside production. The default learner is the catalog persona, not a hardcoded screenshot name. The Figma screenshot fixture lives in `lib/mock/catalog.ts` as `FIGMA_HOME_FIXTURE` and is used only when `useVisualFixture` is set (showcase / visual QA).

## Visual demo

Development only: `/dev/showcase`.
