# Monetization

B.A.V. sells **feature entitlements**, not a yellow “premium = true” flag.

## Plans

| Plan | Kind | What it is |
| --- | --- | --- |
| Free | default | Core Tutor, Practice, Lessons, deterministic Lab, saved progress |
| BAV+ | subscription | Monthly or annual. Advanced labs, extra AI, exam prep, quantum/astronomy benches |
| Lifetime Unlock | non-consumable | One-time purchase. Permanent BAV+ access. **Not a subscription** |
| Family / Education | reserved | Not offered for purchase yet |

## Configure product IDs

Set these public IDs in Expo env. Do **not** put shared secrets in the client.

```
EXPO_PUBLIC_IOS_PLUS_MONTHLY=
EXPO_PUBLIC_IOS_PLUS_ANNUAL=
EXPO_PUBLIC_IOS_LIFETIME=
EXPO_PUBLIC_ANDROID_PLUS_MONTHLY=
EXPO_PUBLIC_ANDROID_PLUS_ANNUAL=
EXPO_PUBLIC_ANDROID_LIFETIME=
```

Development placeholders (`dev.bav.*`) are allowed outside production. Production builds reject placeholders.

## Mock vs real billing

- Development / tests: `MockBillingAdapter` (never reports a real App Store / Play transaction).
- Production: platform adapter. Until StoreKit 2 / Play Billing is wired, the adapter returns `store_not_configured` and **does not** invent an entitlement.
- `EXPO_PUBLIC_MOCK_BILLING=false` disables mock billing even in development.
- Mock billing cannot be constructed when `NODE_ENV=production`.

## How to test

```
pnpm test tests/monetization.test.ts tests/monetization-entitlements.test.ts tests/monetization-purchase.test.ts tests/monetization-platform.test.ts
```

Open `/dev/monetization` in a development build to switch scenarios. That screen is blocked in production.

## Purchase flow

Screens call `canAccessFeature(feature)` / `hasEntitlement(...)`. They never inspect `plan`, receipts, or store product IDs.

Verified success path: store result → entitlement refresh → confirmation → return to the originating feature.
