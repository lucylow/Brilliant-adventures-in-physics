# Paywall design

The paywall should feel like B.A.V.: scientific, calm, curious. White surface, strong B.A.V. blue, orbit motif, rounded plan cards.

## Structure

1. Close control (never hidden)
2. Hero: “Unlock the full physics universe.”
3. Benefits that map to real entitlements
4. Monthly / Annual / Lifetime cards
5. Primary CTA that adapts (Start Free Trial, Unlock BAV+, Get Lifetime Access, Try Again)
6. Restore purchases
7. Not now

Lifetime copy says **one-time purchase / permanent access**. It is never called a subscription.

Annual savings copy appears only when both monthly and annual store prices are known.

Trial copy appears only when the product’s `trialAvailability` is true (or a demo scenario says so).

## Variants

Fifteen development variants live in `lib/monetization/variants.ts`. Assignment is deterministic by user id. No statistical claims from mock samples.

## Ethics

No fake urgency, hidden close, invented discounts, or “you are failing because you are free.”
