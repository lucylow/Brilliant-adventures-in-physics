# Component catalog

All interactive Bav components live under `components/bav`.

| Component | Purpose |
| --- | --- |
| BavButton / BavIconButton | Primary, secondary, ghost, danger, scientific; loading/disabled |
| BavCard | Elevation: flat, border, soft, featured, scientific |
| BavMetricCard | Compact Home stats |
| BavBadge / BavChip | Status and filters |
| BavProgressBar / BavProgressRing | Linear and circular mastery |
| BavAvatar | Initials avatar |
| BavSectionHeader | Title + optional action |
| BavListItem / BavDivider | Compact lists |
| BavTextField / BavNumberInput / BavSlider / BavToggle | Forms |
| BavModal / BavBottomSheet / BavToast | Overlays |
| BavSkeleton / BavLoadingState | Loading |
| BavEmptyState / BavErrorState / BavOfflineState | Recovery |
| BavEquationCard | Formula + variables + verified badge |
| BavLabCard | featured / standard / compact / locked |
| BavTutorCard / BavTutorMessage | Structured AI cards vs chat |
| BavXpBadge / BavStreakBadge | Rewards |
| ScientificMotifs | orbit, wave, grid, vector, particle, field |

Layout: `components/layout` (`Stack`, `Row`, `Grid`, `Section`, `BottomNavSpacer`, screen shells).

Feature chrome:

- `components/home/HomeDashboard.tsx`
- `components/tutor/TutorChrome.tsx`
- `components/practice/PracticeChrome.tsx`
- `components/scan/ScanCapture.tsx`
- `components/lesson/LessonChrome.tsx`
- `components/adventure/AdventureJourney.tsx`
- `components/search/SearchField.tsx`
- `components/scientific/ScientificDiagram.tsx`

Icons: one MaterialIcons family via `lib/design-system/icons.ts`.
