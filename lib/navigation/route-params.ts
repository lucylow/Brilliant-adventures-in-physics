import { z } from "zod";
import { NotFoundError, ValidationError, err, ok, type Result } from "../../shared/errors";

export const ROUTE_NAMES = {
  home: "/",
  tutor: "/tutor",
  lab: "/lab",
  practice: "/practice",
  progress: "/progress",
  astronomy: "/astronomy",
  quantum: "/quantum",
  lesson: "/lesson",
  lens: "/lens",
  scan: "/scan",
  concepts: "/concepts",
  settings: "/settings",
  notebook: "/notebook",
  privacy: "/privacy",
  upgrade: "/upgrade",
  achievement: "/achievement",
  milestone: "/bav-milestone",
  onboarding: "/onboarding",
  onboardingSummary: "/onboarding-summary",
  media: "/media",
} as const;

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES];

const idSchema = z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/i);

export const achievementParamsSchema = z.object({
  id: idSchema,
});

export const milestoneParamsSchema = z.object({
  id: idSchema,
});

export const conceptParamsSchema = z.object({
  concept: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/i).optional(),
});

export const practiceParamsSchema = z.object({
  concept: z.string().trim().min(1).max(80).optional(),
  review: z.union([z.literal("1"), z.literal("true"), z.undefined()]).optional(),
});

export const lessonParamsSchema = z.object({
  id: z.string().trim().min(1).max(80).optional(),
});

export function readParam(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

export function parseRouteParams<T>(schema: z.ZodType<T>, params: Record<string, unknown>, operation: string): Result<T, ValidationError> {
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    return err(new ValidationError({
      message: "This screen is missing a valid identifier.",
      operation,
      safeMetadata: { issues: parsed.error.issues.slice(0, 4).map((issue) => issue.path.join(".")) },
    }));
  }
  return ok(parsed.data);
}

export function requireId(value: unknown, entity: string): Result<string, NotFoundError | ValidationError> {
  const id = readParam(value);
  if (!id) {
    return err(new NotFoundError({
      message: `${entity} id is missing`,
      operation: "requireId",
      feature: entity,
    }));
  }
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return err(new ValidationError({
      message: `${entity} id is invalid`,
      operation: "requireId",
      feature: entity,
    }));
  }
  return ok(parsed.data);
}

export function safeHref(path: string, params?: Record<string, string | undefined>): Result<string, ValidationError> {
  if (!path.startsWith("/")) {
    return err(new ValidationError({ message: "Route path must be in-app", operation: "safeHref" }));
  }
  const query = params
    ? Object.entries(params)
        .filter(([, value]) => typeof value === "string" && value.length > 0)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? "")}`)
        .join("&")
    : "";
  return ok(query ? `${path}?${query}` : path);
}
