# Billing architecture

This Expo managed app has **no RevenueCat / StoreKit / Play Billing SDK** in `package.json`. The smallest honest integration is a **billing port**.

```
UI screens
  → canAccessFeature / purchaseSelected / restorePurchases
    → BillingPort
      → MockBillingAdapter        (development, tests)
      → IosBillingAdapter         (StoreKit 2 boundary; unconfigured)
      → AndroidBillingAdapter     (Play Billing boundary; unconfigured)
      → UnavailableBillingAdapter (web)
    → server/monetization.ts      (never trusts a client “premium” boolean)
```

## Port methods

`initialize`, `getProducts`, `purchaseProduct`, `restorePurchases`, `getCustomerEntitlements`, `listenForPurchaseUpdates`, `presentManagement`, `disconnect`.

## Security

- No API keys, receipt credentials, or Play service accounts in the mobile client.
- Mock receipts are labeled `SYNTHETIC_RECEIPT` / `synthetic: true` and are rejected by `verifyPurchase`.
- Analytics never log receipts, tokens, or card data.
- Cached premium is time-bounded (`maxOfflinePremiumMs`). Lifetime cache is longer but still not an indefinite local boolean.
- Account switch / sign-out clears the entitlement cache.

## Real-platform integration boundary

When native IAP is added:

1. Put real product IDs in the env vars documented in `MONETIZATION.md`.
2. Implement StoreKit 2 / Play Billing behind `IosBillingAdapter` / `AndroidBillingAdapter`.
3. Verify receipts on `server/monetization.ts` before treating access as long-lived.
4. Keep the mock adapter for UI development.
