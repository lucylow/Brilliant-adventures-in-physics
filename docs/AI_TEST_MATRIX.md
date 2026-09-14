# AI test matrix

Source of truth: `tests/ai-mock.test.ts` plus existing `tests/tutor-service.test.ts` and `tests/tutor-validation.test.ts`.

| Area | Assertion |
| --- | --- |
| Production boundary | Mock AI off in default test runtime; `getMockAIProvider()` throws |
| Dataset volume | `validateAIDataset()` minima (100 conversations, 1000 messages, …) |
| References | Every conversation `conceptId` exists in `conceptRegistry` |
| Turn bounds | 5–20 turns per conversation |
| Determinism | Same seed → same starters / projectile variants |
| Schema | Tutor payload parses with Zod + existing `parseTutorAnswer` |
| Memory | “Why?” refers to the previous concept |
| Streaming | Chunking + cancel |
| Failure | timeout / offline throw `MockAIError` |
| Duplicate send | `beginSend` rejects a second in-flight session |
| Intent | hint vs ambiguous |
| Physics parse | 2 kg at 3 m/s² → 6 N |
| Verification | KE ½mv² = 9 J; 99 J is mismatch; unit mismatch detected |
| Recommendations | Reasons mention mistakes/mastery, not popularity |
| Truncation | Long history keeps current question |
| Malformed / safety | Empty/partial payloads fail; assessed-work filtered |
| State machine | Illegal `idle → complete` throws |
| Service switch | `createAppTutorService` uses Demo AI only when enabled |
| Fallback | Offline Demo AI still yields `[Local fallback]` |
| Hints | Subtle hints do not reveal a final numeric answer |

Run:

```
pnpm test tests/ai-mock.test.ts
pnpm check
pnpm test
```
