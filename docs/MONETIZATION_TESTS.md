# Monetization tests

Run:

```
pnpm test tests/monetization.test.ts tests/monetization-entitlements.test.ts tests/monetization-purchase.test.ts tests/monetization-platform.test.ts
pnpm check
pnpm lint
```

Covered:

- Catalog validation (existing `tests/monetization.test.ts`)
- Entitlement matrix across free / trial / monthly / annual / lifetime / expired / unknown / pending
- Feature gates for every `FEATURES` id
- Purchase success, cancel, failure, pending, restore, duplicate tap, offline, missing product
- Lifetime does not expire as a subscription
- Usage reset before / at / after UTC midnight
- USD / CAD / EUR / GBP formatting
- Long localized prices
- Paywall empty / offline states and accessible labels
- Analytics sanitization
- Config validation
- Fixture volume

Developer scenarios: `/dev/monetization` (blocked in production).
