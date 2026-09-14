# Experiment Data Format

Lab records in Expansion II are `LabExperiment` objects (`lib/mock/expansion/types.ts`). They extend the gen-1 `MockExperiment` / `SavedExperiment` shape so they can merge into `dataset.experiments`.

## Required fields

| Field | Meaning |
| --- | --- |
| `id` | Stable `lab-*` id |
| `title` / `subtitle` | Display strings |
| `category` | `mechanical`, `waves`, `circuits`, `optics`, `thermal`, `modern`, `space`, … |
| `difficulty` | `easy` \| `medium` \| `hard` \| `challenge` |
| `objective` / `hypothesis` | What the bench is testing |
| `equipment` / `setup` | Educational apparatus list |
| `controlledVariables` | Held constant |
| `independentVariable` / `dependentVariable` | The intended pair |
| `procedure` | Short classroom steps — not hazardous instructions |
| `observations` | Qualitative notes |
| `data` | `CsvTable` (headers, units, numeric rows, `MOCK_LAB_EXPORT`) |
| `expectedPattern` | What a correct graph/table should show |
| `analysisQuestions` | Prompts for the learner |
| `conclusion` | Educational wrap-up |
| `relatedConcepts` / `relatedEquations` | Catalog ids |
| `relatedSimulation` | Optional `sim-*` id |

`variables` and `initialConditions` remain on the base `MockExperiment` for the existing lab snapshot UI.

## CSV tables

```ts
import { toCsv, fromCsv, validateCsvDataset, summarizeDataset } from "@/lib/mock/expansion";

const text = toCsv(lab.data);
const table = fromCsv(text, lab.data.id);
const errors = validateCsvDataset(table);
const stats = summarizeDataset(table);
```

Header format: `name (unit)`. Rows are numeric. `malformedCsvFixtures()` supplies empty, ragged, and non-numeric strings for parser tests.

## Measurement series

Factories in `generators/series.ts` take `sampleCount`, `sampleInterval`, `noiseLevel`, `trend`, `offset`, `measurementResolution`, and `seed`. Noise is seeded; the same seed always yields the same series.

Dependent series (for example current from voltage with `R = 4 Ω`) are calculated, not independently randomized.

## Observation examples

- Pendulum: trial, predicted period, measured period, uncertainty
- Spring: extension, force, `k`
- Ohm: voltage, resistance, current, power
- Lens: `do`, `di`, `f`, magnification

Do not author rows that contradict the named model unless the record is explicitly a **fault** or **outlier-analysis** fixture.
