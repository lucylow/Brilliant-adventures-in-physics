# Known Warnings and Limitations

This file lists issues that remain after the hardening pass, with the exact reason they are unresolved.

## Application-owned `pointerEvents`

Usages in `components/network-status-banner.tsx` and `components/physics-visuals.tsx` set `pointerEvents` **inside style objects**. That is the supported React Native pattern (replacing the deprecated `pointerEvents` View prop). They are not suppressed with a global LogBox ignore.

If a runtime warning still appears, it is likely from:

- React Native Web translating CSS `pointer-events`
- A dependency (NativeWind, Screens, or Gesture Handler)

Reason unresolved: the warning is not reproduced as an application-owned deprecated prop, and globally ignoring it would hide real regressions.

## Expo / dependency notices

- `pnpm` may report a newer package-manager version. Unresolved because upgrading pnpm globally is outside this repository’s lockfile.
- Native module peer warnings from Expo SDK 54, if any, require an SDK upgrade. Unresolved because an SDK bump is a product decision and can break Expo Router 6.

## Secrets and environment

- Production API processes still require `JWT_SECRET`, `DATABASE_URL`, and optional Forge keys. Local development can start without a database (existing lazy `getDb()`). Unresolved in local/dev because the template is designed to run without MySQL.
- `EXPO_PUBLIC_*` OAuth URLs are public client configuration, not private keys. They were not moved and must not be replaced with server secrets.

## Network listener availability

`expo-network`’s `addNetworkStateListener` is used by `AutosaveReconciler` and `useNetworkStatus`. On some web targets the listener may report `unknown`. Unresolved because the host environment, not application code, owns connectivity APIs. UI treats `unknown` as “could not confirm” and never claims success.

## Tutor / AI

The client still uses a deterministic mock Tutor plus a clearly labeled local fallback. A live provider is server-side (`server/_core/llm.ts`) and requires `BUILT_IN_FORGE_API_KEY` / OpenAI configuration. Unresolved in the client because provider secrets must not enter the bundle, and this pass does not invent live AI answers.

## Database transactions

`upsertUser` is a single `insert … onDuplicateKeyUpdate`. There is no multi-table write that needs a transaction yet. Unresolved as a broader transaction helper because no second table exists in `drizzle/schema.ts`.

## Tests that cannot run in Node

React Native screen components are not executed in jsdom here. Recovery contracts are tested through pure helpers (`screenStatusFromFlags`, `recoveryCopy`, validators). Unresolved as full detox/maestro coverage because those runners are not part of this package’s scripts.

## Remaining product TODOs

`todo.md` still contains a few product items (for example restore-purchases against a real store). Those are product scope, not unfixed crashers from this pass.
