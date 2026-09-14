# Recovery Architecture

PhysicaAI is local-first. Failures should be educational and recoverable. Learners are never blamed.

## Control flow

```
UI action
  -> useAsyncAction / runSafely (mounted + generation + duplicate guard)
    -> domain validator (Zod or physics-validation)
      -> existing service / storage / physics helper
        -> Result<T, AppError> or ServiceResult<T>
          -> ScreenState (loading | success | empty | error | offline)
```

Expected failures use `Result`. Unexpected render failures use `AppErrorBoundary` with a diagnostic ID, retry, and return-home. Production does not show stack traces.

## Persistence recovery

1. Read with `safeStorageGet` / existing `*WithStatus` loaders.
2. `JSON.parse` is wrapped; parse failures become `SerializationError`.
3. Zod `safeParse` rejects malformed records.
4. Invalid records are quarantined; valid sibling records are left intact.
5. Writes refuse to overwrite storage that was unreadable (`recovered: true` paths already present in preferences, onboarding, learning state, notebooks, and experiments).

Schema version is `CURRENT_SCHEMA_VERSION = 1`. Migrations are additive (`migratePreferences`, `migrateOnboarding`, `migrateLearningState`, `migrateDraft`, `migrateNotebookEntry`).

## Autosave queue

`lib/retry-queue.ts` remains the persisted queue. `lib/offline-queue.ts` adds:

- maximum queue size (10)
- maximum payload size
- checksum
- attempt count and `nextAttemptAt`
- expiry
- Result-returning `getRetryQueueStatus`, `drainRetryQueue`, `retrySingleItem`, `discardSingleItem`, `clearRetryQueueSafe`

Foreground and network reconciliation still run through `AutosaveReconciler`. Duplicate drains remain guarded by the existing in-flight ref.

## Network

`lib/network.ts` still maps Expo network state to `online | offline | checking | unknown`. `useNetworkStatus()` listens safely. Screens should show what still works locally. Tutor fallback is labeled `[Local fallback]` and must never be presented as live AI output or as a fabricated numerical solution.

## Simulation

Explicit states: `idle`, `running`, `paused`, `complete`, `error`, `empty`. The controller refuses illegal transitions, pauses when unfocused, and disposes animation ownership. Timesteps are clamped; particle counts are capped on low-end devices; NaN samples halt the loop.

## Privacy clear

`clearAllLocalDataWithReport()` returns `fullyCleared | partiallyCleared | failed` with sanitized per-key diagnostics. The UI must not say everything was deleted when a subset failed. `clearAllLocalData()` still throws on partial failure so older callers keep their contract.

## Copy

Use the feature matrix in `lib/screen-recovery.ts`. Examples already in product copy:

- “Your experiment could not start because gravity is missing. Check the value and try again.”
- “You're offline. Your current experiment is safe on this device. Reconnect to retry Tutor.”
- “The saved experiment could not be restored because its data is incomplete. Your other experiments are unaffected.”
