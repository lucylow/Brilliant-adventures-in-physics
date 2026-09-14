# Error Handling Audit

This document records the production-hardening pass over the existing Brilliant Adventures in Physics / PhysicaAI codebase. It is based on the real source tree, not a rewrite.

## Original failures discovered

Baseline commands were run after installing dependencies. Before this pass, the repository already contained substantial recovery code (typed `ServiceResult`, autosave retry queue, persistence `*WithStatus` loaders, Tutor validation, media adapters, and an app error boundary). Remaining gaps were structural rather than a single crashing bug:

| Classification | Finding | Root cause |
|---|---|---|
| TYPE_ERROR / BUILD_CONFIGURATION_ERROR | `pnpm check` failed immediately with `tsc is not recognized` | `node_modules` was missing in this environment; not a source-level TypeScript defect |
| ASYNC_LIFECYCLE_ERROR | Duplicate submit / stale response guards were local and inconsistent | Screens used ad-hoc `active` flags instead of a shared abort/generation helper |
| PERSISTENCE_ERROR | JSON was parsed with `JSON.parse` plus custom guards, but there was no shared Zod schema or quarantine | Each store reimplemented validation; malformed records were detected but not quarantined |
| NETWORK_ERROR | Retry queue items lacked expiry, payload-size caps, attempt counts, and Result APIs | Existing queue stored `{ id, payload, queuedAt }` only |
| PHYSICS_VALIDATION_ERROR | Deterministic helpers throw `Error`; UI layers could still compute NaN paths if they skipped those helpers | No shared Result-returning domain validators |
| NAVIGATION_ERROR | Route params were trusted as strings | Achievement/milestone IDs were not validated before lookup |
| SECURITY_ERROR | Server DB failures could log raw error objects | `upsertUser` rethrew after `console.error` of the original error |
| ACCESSIBILITY_ERROR | Recovery UI existed, but retry/offline/empty states were not a single accessible contract | Loading/empty/error lived in `physica-ui` without offline/success/diagnostic ID |
| RUNTIME_ERROR | `pointerEvents` remains in style objects | Application-owned usages already use `style.pointerEvents` (supported). Dependency warnings are documented, not globally suppressed |

No client file was found that embeds private `OPENAI_API_KEY`, `JWT_SECRET`, or `BUILT_IN_FORGE_API_KEY`. Those remain server `process.env` values. `EXPO_PUBLIC_*` variables are OAuth portal URLs and app IDs only.

## Architecture changes

The existing `lib/service-result.ts`, `lib/retry-queue.ts`, `lib/persistence.ts`, and `lib/network.ts` contracts were **kept**. New modules wrap them:

- `shared/errors/` — typed `AppError` family, `Result<T>`, `normalizeError()`, retry policy
- `lib/safe-async/` — timeout, retry, abort, duplicate-submit, stale-generation guards
- `hooks/use-safe-async.ts`, `hooks/use-network-status.ts` — lifecycle-safe UI actions
- `lib/storage/` — Zod schemas, `safeParse`, migrations, quarantine, safe AsyncStorage helpers
- `lib/offline-queue.ts` — Result APIs over the existing queue
- `lib/physics-validation/` — domain validators and Result wrappers around `lib/physics.ts`
- `lib/simulation-safety/` — timestep caps and explicit simulation states
- `lib/tutor-validation.ts` — Zod Tutor request/response schemas and labeled local fallback
- `components/states/` — loading / error / empty / offline / success / retry
- `server/_core/db-errors.ts`, `startup.ts`, `shutdown.ts` — DB normalization and graceful stop

## New error codes

`VALIDATION`, `PERSISTENCE`, `NETWORK`, `TIMEOUT`, `AUTHENTICATION`, `AUTHORIZATION`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT`, `MEDIA_PERMISSION`, `MEDIA_UNAVAILABLE`, `PHYSICS_DOMAIN`, `SIMULATION`, `TUTOR_SERVICE`, `SERIALIZATION`, `MIGRATION`, `CONFIGURATION`, `UNKNOWN`.

Every `AppError` includes `code`, `message`, `userMessage`, `retryable`, `severity`, `operation`, `cause`, `timestamp`, and `safeMetadata`. Secrets, tokens, Authorization headers, and raw prompts are redacted.

## Persistence schemas

Zod schemas now exist for preferences, onboarding, learning state, topic mastery, completion events, session drafts, Tutor/Practice/Lens draft payloads, notebook entries, saved experiments, retry queue items, privacy activity, usage, and achievement records. Untrusted storage uses `safeParse()`, never `parse()`. Malformed records are quarantined under `physicaai.quarantine.v1` and must not overwrite valid data.

## Retry rules

Retry: network failures, timeouts, rate limits, temporary Tutor/persistence failures.

Do not retry: validation, authentication, authorization, not found, physics domain errors, malformed payloads, exhausted attempts (`MAX_QUEUE_ATTEMPTS = 5`), expired items (`7` days), oversized payloads (`32 KiB`).

Backoff is exponential with jitter (`shared/errors/retry-policy.ts`).

## Physics validation rules

`finiteNumber`, `positiveNumber`, `nonNegativeNumber`, `validAngle`, `validRadians`, `validVelocity`, `validMass`, `validTime`, `validGravity`, `validCharge`, `validResistance`, `validVoltage`, `validFrequency`, `validWavelength`, `validTemperature`, and `subluminalVelocity` reject `NaN`, infinities, missing values, zero denominators, and superluminal speeds. Quantity conversion checks dimensions. Deterministic `lib/physics.ts` throw messages are unchanged so existing tests stay honest.

## Tests added

See `docs/VALIDATION_MATRIX.md`. New files include `tests/app-errors.test.ts`, `tests/safe-async.test.ts`, `tests/storage-hardening.test.ts`, `tests/offline-queue-result.test.ts`, `tests/physics-validation.test.ts`, `tests/simulation-safety.test.ts`, `tests/tutor-validation.test.ts`, `tests/navigation-safety.test.ts`, `tests/media-safety.test.ts`, `tests/privacy-clear-report.test.ts`, `tests/diagnostics.test.ts`, `tests/server-hardening.test.ts`, `tests/ui-recovery-contract.test.ts`, `tests/feature-recovery-matrix.test.ts`, and `tests/physics-domain-matrix.test.ts`.

## Commands executed

- `pnpm install`
- `pnpm check`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

Results of the final run are recorded in the closing section of this hardening pass (they must match the actual command output; this document does not claim a green build unless those commands passed).

## Remaining known limitations

See `docs/KNOWN_WARNINGS.md`.
