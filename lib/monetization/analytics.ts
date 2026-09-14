import { isProductionRuntime } from "@/lib/mock/config";
import type { AnalyticsSafePayload, Offer, OfferKind, PlanCode } from "./types";
import { defaultClock, monetizationIso } from "./clock";

export const MONETIZATION_EVENTS = [
  "paywall_viewed",
  "paywall_closed",
  "plan_selected",
  "purchase_started",
  "purchase_pending",
  "purchase_succeeded",
  "purchase_failed",
  "restore_started",
  "restore_succeeded",
  "restore_failed",
  "trial_started",
  "subscription_started",
  "subscription_cancelled",
  "subscription_expired",
  "lifetime_purchased",
  "premium_feature_viewed",
  "premium_feature_locked",
  "upgrade_clicked",
] as const;

export type MonetizationEventName = (typeof MONETIZATION_EVENTS)[number];

const FORBIDDEN_KEYS = [
  "receipt",
  "token",
  "password",
  "card",
  "cvv",
  "pan",
  "credential",
  "authorization",
  "secret",
  "purchaseToken",
  "transactionReceipt",
];

export function sanitizeAnalyticsPayload(payload: Record<string, unknown> | undefined): AnalyticsSafePayload {
  const clean: AnalyticsSafePayload = {};
  if (!payload) return clean;
  for (const [key, value] of Object.entries(payload)) {
    if (FORBIDDEN_KEYS.some((forbidden) => key.toLowerCase().includes(forbidden.toLowerCase()))) continue;
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      if (typeof value === "string" && value.length > 120) continue;
      clean[key] = value;
    }
  }
  return clean;
}

export type QueuedMonetizationEvent = {
  event: MonetizationEventName;
  at: string;
  payload: AnalyticsSafePayload;
};

const queue: QueuedMonetizationEvent[] = [];
const MAX_QUEUE = 100;
let sink: ((event: QueuedMonetizationEvent) => void) | null = null;

export function setMonetizationAnalyticsSink(next: ((event: QueuedMonetizationEvent) => void) | null): void {
  sink = next;
}

export function trackMonetizationEvent(event: MonetizationEventName, payload?: Record<string, unknown>): void {
  try {
    const entry: QueuedMonetizationEvent = {
      event,
      at: monetizationIso(),
      payload: sanitizeAnalyticsPayload(payload),
    };
    queue.push(entry);
    if (queue.length > MAX_QUEUE) queue.shift();
    sink?.(entry);
  } catch {
    return;
  }
}

export function getMonetizationAnalyticsQueue(): QueuedMonetizationEvent[] {
  return [...queue];
}

export function clearMonetizationAnalyticsQueue(): void {
  queue.length = 0;
}

export function flushMonetizationAnalytics(): QueuedMonetizationEvent[] {
  const pending = getMonetizationAnalyticsQueue();
  clearMonetizationAnalyticsQueue();
  return pending;
}

export type DemoRevenuePoint = {
  label: string;
  demo: true;
  monthly: number;
  annual: number;
  lifetime: number;
  trials: number;
  conversion: number;
};

export function demoRevenueDashboard(): DemoRevenuePoint {
  if (isProductionRuntime()) {
    return { label: "DEMO DATA unavailable in production", demo: true, monthly: 0, annual: 0, lifetime: 0, trials: 0, conversion: 0 };
  }
  return {
    label: "DEMO DATA",
    demo: true,
    monthly: 42,
    annual: 18,
    lifetime: 7,
    trials: 11,
    conversion: 0.28,
  };
}

export function selectOffer(input: {
  plan: PlanCode;
  lifetimeOwned: boolean;
  trialEligible: boolean;
  returning: boolean;
  now?: number;
}): Offer {
  const now = input.now ?? defaultClock.now();
  const kind: OfferKind = input.lifetimeOwned
    ? "standard"
    : input.trialEligible
      ? "trial"
      : input.returning
        ? "returning_user"
        : input.plan === "plus"
          ? "annual_spotlight"
          : "standard";
  return {
    id: `offer-${kind}`,
    kind,
    title: kind,
    body: "Honest offer selection. No invented discounts.",
    productIds: kind === "lifetime" ? ["bav-lifetime"] : ["bav-plus-annual", "bav-plus-monthly", "bav-lifetime"],
    eligible: !input.lifetimeOwned || kind === "standard",
    featured: kind === "annual_spotlight" || kind === "trial",
    startsAt: monetizationIso(now),
  };
}

export function offerExpired(offer: Offer, now = defaultClock.now()): boolean {
  if (!offer.endsAt) return false;
  const ends = Date.parse(offer.endsAt);
  return Number.isFinite(ends) && ends <= now;
}
