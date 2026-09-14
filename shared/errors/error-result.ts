import type { AppError } from "./app-error";

export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type ErrorResult<E = AppError> = { ok: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { ok: true, data };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; data: T } {
  return result.ok;
}

export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return !result.ok;
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.data : fallback;
}

export function mapResult<T, U, E>(result: Result<T, E>, mapper: (data: T) => U): Result<U, E> {
  return result.ok ? ok(mapper(result.data)) : result;
}

export async function fromPromise<T>(operation: Promise<T>, onError: (error: unknown) => AppError): Promise<Result<T>> {
  try {
    return ok(await operation);
  } catch (error) {
    return err(onError(error));
  }
}

export function toErrorResult<E>(error: E): ErrorResult<E> {
  return { ok: false, error };
}
