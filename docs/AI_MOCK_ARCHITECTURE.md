# AI mock architecture

```
UI screens (Tutor, Scan, Practice, Home, Progress, Notebook, Lab)
        │
        ▼
existing services / adapters  (tutor-service, catalog adapters)
        │
        ├── live/deterministic path (unchanged)
        └── MockAIProvider  ← only when isMockAIEnabled()
                │
                ├── config + failure injection
                ├── catalog + generators (lazy)
                ├── session memory + truncation
                ├── verification via lib/physics
                └── repositories / selectors
```

## Key modules (`lib/mock/ai/`)

| Module | Role |
| --- | --- |
| `config.ts` | Modes, production boundary, scenario, failure |
| `ai-types.ts` / `ai-schemas.ts` | Typed responses + Zod |
| `ai-client.ts` | `AIProvider` mock implementation |
| `ai-catalog.ts` | Curriculum-grounded unique physics content |
| `datasets/` | Conversations, hints, scans, plans, … |
| `ai-verification.ts` | Numbers go through `lib/physics` |
| `ai-streaming.ts` | Chunked streaming, cancel, error |
| `ai-memory.ts` / `ai-session.ts` | Multi-turn context, duplicate-send lock |
| `ai-screen-adapters.ts` | View-models for screens (no giant arrays in UI) |
| `ai-inspector.ts` | Dev-only inspector snapshot |

## Provider contract

`AIProvider` matches actual product features:

- `sendMessage` → Tutor
- `generateExplanation` / `generateHint`
- `analyzeProblem` / `analyzeImage`
- `generatePracticeFeedback` / `generateRecommendations`
- `streamMessage`

`sendMessage` maps onto existing `TutorAnswer` via `toTutorAnswer()`.

## Verification

When a catalog topic has a `verified` calculation, the mock calls `lib/physics` (projectile, kinetic energy, Ohm, …). If an AI number disagrees, `verificationStatus = "mismatch"` and the UI must not treat it as correct.

## Safety

- No provider secrets
- Content filter for out-of-scope / assessed-work requests
- Fallback text is labeled `[Local fallback]`
- Inspector hidden when `NODE_ENV=production`
