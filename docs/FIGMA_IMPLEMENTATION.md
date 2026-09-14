# Figma implementation

The visual source is the Figma Make project [RedesignB.A.V.MobileApp](https://github.com/lucylow/RedesignB.A.V.MobileApp). This repository remains the engineering source of truth.

## What was bridged

| Figma | App route | Data |
| --- | --- | --- |
| Home | `app/(tabs)/index.tsx` | `buildHomeViewModel` + learning store + mock learner |
| Build | `app/(tabs)/lab.tsx` | Existing physics workbench + `LabCatalog` |
| Play | `app/(tabs)/play.tsx` | Mock simulation catalog → `/simulation` |
| Explore | `app/(tabs)/explore.tsx` | Topics, astronomy, quantum, progress |
| Tutor | `app/(tabs)/tutor.tsx` | Existing tutor service + Bavi chrome |
| Scan | `app/scan.tsx` | Existing validated projectile engine |
| Lens | `app/lens.tsx` | Existing measurement lab |
| Simulation detail | `app/simulation.tsx` | `projectile()` deterministic engine |
| Progress | `app/(tabs)/progress.tsx` | Learning store + `ProgressInsights` |
| Profile | `app/profile.tsx` | Same home adapter |

Bottom navigation is five tabs: Home, Build, Play, Explore, Tutor. Practice, Progress, Astronomy, and Quantum remain as routes (`href: null` on the tab bar) so no feature was deleted.

## Visual language

- Page canvas `#F7F8FA`
- Cards white with hairline borders
- Primary `#2563EB`
- Hero Continue Adventure: large radius, blue fill, orbit motif, live progress
- Quick actions: 2×2 pastel tints from one family
- Simulations: dark `#0F172A` canvas with grid/orbit/wave motifs that never cover equations

## How to run

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

Expo web: `pnpm dev:metro`.

## How to add a screen

1. Add a route under `app/`.
2. Add the path to `lib/navigation/route-params.ts` `ROUTE_NAMES`.
3. Use layout shells and Bav components.
4. Prefer a view model over screen-level arrays.
