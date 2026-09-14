# AI response types

Externally shaped payloads are Zod-validated in `lib/mock/ai/ai-schemas.ts`.

Internal metadata (not shown unless the UI already has a slot):

`requestId`, `scenarioId`, `providerMode`, `createdAt`, `latencyMs`, `confidence`, `responseType`, `conceptIds`, `sourceType`, `isMock: true`, `modelLabel: "Demo AI"`

## Payloads

| Type | Use |
| --- | --- |
| `TutorResponsePayload` | Extends existing `TutorAnswer` |
| `ExplanationResponse` | Concept explanations by style/level |
| `HintResponse` | Hint ladder; `revealsAnswer` |
| `ProblemAnalysisResponse` / `ProblemSolutionResponse` | Structured working |
| `MisconceptionResponse` | Diagnostic + counterexample |
| `RecommendationResponse` | Ranked items + reasons |
| `ScanAnalysisResponse` | Mock vision; `isMock: true` |
| `SimulationRecommendationResponse` | Sim + parameters |
| `LearningPlanResponse` / `ReviewResponse` | Plans and weak-topic review |
| `ConversationSummary` / titles / follow-ups | History |
| `ErrorResponse` | Typed Demo AI errors |
| `PracticeFeedbackResponse` | whatWasRight / whatNeedsWork |
| `GraphAnalysisResponse` / `TableAnalysisResponse` | Interpretation |

## Provenance (`sourceType`)

- `verifiedCalculation` — `lib/physics`
- `educationalExplanation` — catalog text
- `mockGeneratedText` — composed Demo AI wording
- `userProvidedContent` — learner input
- `localFallback` — labeled local fallback, never claimed live

## Confidence

Bands `veryHigh | high | medium | low | failed` change scan/tutor UX (edit values, ask clarification). Confidence is not a truth claim.
