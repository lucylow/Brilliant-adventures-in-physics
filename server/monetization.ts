import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

const snapshotSchema = z.object({
  platform: z.enum(["ios", "android", "web"]),
  productIds: z.array(z.string().min(1)).max(12),
  synthetic: z.boolean().optional(),
});

/**
 * Server-side entitlement verification boundary.
 * The client must never be trusted as the source of long-lived paid access.
 * Until App Store / Play receipts are wired, this returns unverified.
 */
export const monetizationRouter = router({
  entitlements: publicProcedure.query(({ ctx }) => {
    return {
      userId: ctx.user?.id ?? null,
      verified: false,
      lifetimeOwned: false,
      productIds: [] as string[],
      source: "unverified" as const,
      reason: "No trusted receipt validator is configured on this server yet.",
    };
  }),
  verifyPurchase: publicProcedure.input(snapshotSchema).mutation(({ input, ctx }) => {
    if (input.synthetic) {
      return {
        accepted: false,
        userId: ctx.user?.id ?? null,
        reason: "Synthetic mock receipts are never sent to production verification.",
      } as const;
    }
    if (isProduction()) {
      return {
        accepted: false,
        userId: ctx.user?.id ?? null,
        reason: "Production receipt validation is not configured. Premium is not granted.",
      } as const;
    }
    return {
      accepted: false,
      userId: ctx.user?.id ?? null,
      reason: "Development server does not mint paid access from client-supplied product IDs.",
    } as const;
  }),
});
