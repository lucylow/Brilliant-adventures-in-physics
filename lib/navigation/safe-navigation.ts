import { ValidationError, err, ok, type Result } from "../../shared/errors";
import { ROUTE_NAMES, safeHref, type RouteName } from "./route-params";

export type SafeRouter = {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
};

export function navigateSafely(router: SafeRouter, path: RouteName | string, params?: Record<string, string | undefined>): Result<string, ValidationError> {
  const href = safeHref(path, params);
  if (!href.ok) return href;
  try {
    router.push(href.data);
    return ok(href.data);
  } catch (cause) {
    return err(new ValidationError({
      message: "Navigation could not start",
      operation: "navigateSafely",
      cause,
    }));
  }
}

export function replaceSafely(router: Pick<SafeRouter, "replace">, path: RouteName | string, params?: Record<string, string | undefined>): Result<string, ValidationError> {
  const href = safeHref(path, params);
  if (!href.ok) return href;
  try {
    router.replace(href.data);
    return ok(href.data);
  } catch (cause) {
    return err(new ValidationError({
      message: "Navigation replace could not start",
      operation: "replaceSafely",
      cause,
    }));
  }
}

export function backSafely(router: Pick<SafeRouter, "back">, fallback?: () => void): void {
  try {
    router.back();
  } catch {
    fallback?.();
  }
}

export { ROUTE_NAMES };
