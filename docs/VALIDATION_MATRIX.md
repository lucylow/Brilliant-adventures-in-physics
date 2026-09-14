# Validation Matrix

Feature × failure mode. “Covered” means a deterministic test and/or a typed recovery path exists in this pass. Existing product tests (physics, privacy, retry queue, Tutor service, media adapters) remain in force.

| Feature | Success | Invalid input | Offline | Timeout | Permission | Persistence corruption | Duplicate action | Unmount | Retry exhaustion |
|---|---|---|---|---|---|---|---|---|---|
| Tutor | `tests/tutor-service.test.ts`, `tests/tutor-validation.test.ts` | blank question rejected | labeled local fallback, recovery copy | `requestTutorAnswerWithTimeout` | n/a | draft load `*WithStatus` | `useAsyncAction` / executeOnce | generation guard | fallback is not infinite |
| Practice | existing practice tests | numeric checker rejects non-finite | recovery copy; local questions still work | recovery copy | n/a | learning-state schema | async action guard | mounted ref | queue attempt cap |
| Lab | physics + simulation tests | domain validators | recovery copy; local sims | timestep timeout halt | n/a | experiment load status | duplicate play guard | `shouldTick` requires focus | error state, reset only |
| Physics Lens | existing lens tests | measurement validation | recovery copy | recovery copy | media permission Result | draft schema + quarantine | async action guard | mounted loaders | draft retry queue |
| Scan | scan uses `safeProjectile` | speed/angle domain | recovery copy | recovery copy | camera optional; typed path remains | n/a | solve disabled while invalid | n/a | n/a |
| Lesson | existing lesson tests | route id optional | recovery copy | recovery copy | n/a | completion events schema | completion idempotent | existing active flags | n/a |
| Progress | existing progress tests | filters | recovery copy | recovery copy | n/a | learning load recovered | n/a | existing loaders | n/a |
| Concepts | search is local | empty query empty-state | recovery copy | recovery copy | n/a | n/a | n/a | n/a | n/a |
| Settings | preference tests | locale enum | retry queue Result APIs | timeout mapped | n/a | refuse overwrite on recovered | retrying flag | active flags | max attempts |
| Notebook | notebook tests + schema | invalid entry throw/Result | recovery copy | recovery copy | local URI validation | demo fallback, no overwrite | n/a | existing loaders | n/a |
| Onboarding | onboarding tests + migrate | level/goal enums | recovery copy | recovery copy | n/a | refuse overwrite | n/a | existing loaders | n/a |
| Upgrade | monetization tests | empty catalog is not invented | recovery copy | recovery copy | store permission is platform | no fake entitlement write | restoring disabled | n/a | purchase retry states |

Shared rows:

- **Malformed persisted data:** `tests/storage-hardening.test.ts`, existing `*recovery*.test.ts`
- **Autosave queue:** `tests/retry-queue.test.ts`, `tests/offline-queue-result.test.ts`
- **Physics domain:** `tests/physics.test.ts`, `tests/physics-validation.test.ts`, `tests/physics-domain-matrix.test.ts`
- **Simulation states:** `tests/simulation-safety.test.ts`
- **Camera permission:** `tests/media-adapters.test.ts`, `tests/media-safety.test.ts`
- **Privacy clearing:** `tests/privacy.test.ts`, `tests/privacy-clear-report.test.ts`
- **Navigation:** `tests/navigation-safety.test.ts`
- **Copy matrix:** `tests/feature-recovery-matrix.test.ts`
