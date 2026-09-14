# Entitlements

Access is computed in `lib/monetization/entitlements.ts`.

## API

- `getEntitlements(context)`
- `hasEntitlement(entitlements, feature)` — full unlock (unlimited / trial / available)
- `canAccessFeature(entitlements, feature)` — includes limited previews
- `requireEntitlement` / `getFeatureGate` / `getFeatureAccessState`

Access states: `available`, `locked`, `trial`, `limited`, `unlimited`, `expired`, `pending`, `unknown`.

Pending, unknown, and expired never count as paid access.

## Features gated

Defined in `FEATURES`:

- advanced labs
- unlimited experiments
- advanced tutor / unlimited AI
- deep explanations
- exam prep
- quantum labs
- advanced astronomy
- downloadable reports
- advanced personalization
- premium missions
- advanced scans
- advanced simulations

## Free protection

Do not gate:

- core lessons and practice
- deterministic calculations (projectile, Ohm’s law, intro photon energy, intro Kepler)
- Physics Lens measurement
- saved learner progress
- accessibility

## Usage limits

Configured in `getMonetizationConfig().freeLimits` (defaults: 5 AI requests / day, 4 experiments / day, 3 previews / day, 0 downloads / day).

Plus and Lifetime make the matching meters unlimited. Daily reset is UTC midnight via `lib/monetization/clock.ts`.
