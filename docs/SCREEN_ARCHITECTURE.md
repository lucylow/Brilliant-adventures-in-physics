# Screen architecture

## Shells

- `ScrollScreen` — Home, Build catalog, Play, Explore, Progress, Profile
- `ChatScreenShell` — Tutor (keyboard avoiding)
- `ExperimentScreen` — Simulation viewport + control dock
- `DetailScreen` — Lesson, mission, settings-style stacks

## View models

| Model | File | States |
| --- | --- | --- |
| HomeViewModel | `lib/view-models/home.ts` | loading / success / empty / error / offline |
| LabViewModel | `lib/view-models/lab.ts` | success / empty |
| SimulationViewModel | `lib/view-models/lab.ts` | success |
| ProgressViewModel | `lib/view-models/progress.ts` | success / empty / error |
| TutorViewModel | `lib/view-models/tutor.ts` | input idle/typing/sending/disabled/error |
| PracticeViewModel | `lib/view-models/practice.ts` | idle/correct/incorrect |
| ScanViewModel | `lib/view-models/practice.ts` | capture/review/solve + confidence |

Adapters in `lib/adapters/index.ts` re-export those builders so UI does not import mock factories directly.

## Routing map

- Ask Bavi → `/tutor`
- Scan Problem → `/scan`
- Physics Lens → `/lens`
- Simulations → `/play` → `/simulation?id=`
- Continue Adventure → `/lesson` or `/lab`
- Accept Challenge → `/practice`
- Avatar → `/profile`

## Data

Live persistence remains `lib/progress-store`, `lib/preferences`, `lib/onboarding`.

When mock mode is enabled (`lib/mock/config.ts`), Home/Progress/Play read catalog personas and simulations. Production builds never enable mock mode.
