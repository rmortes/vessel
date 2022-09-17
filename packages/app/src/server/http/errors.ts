import { HttpError, isHttpError } from 'shared/routing';

import { json } from './response';

export function invariant(value: boolean, message?: string): asserts value;

export function invariant<T>(
  value: T | null | undefined,
  message?: string,
): asserts value is T;

/**
 * Throws HTTP bad request (status code 400) if the value is `false`, `null`, or `undefined`.
 */
export function invariant(value: unknown, message = 'invalid falsy value') {
  if (value === false || value === null || typeof value === 'undefined') {
    throw new httpError(message, 400);
  }
}

/**
 * Throws HTTP validation error (status code 422) if the condition is false.
 */
export function validate(condition: boolean, message = 'validation failed') {
  if (!condition) throw new httpError(message, 422);
}

/**
 * Throws a `HTTPError` to easily escape handling the request and respond with the given status
 * code and optional message.
 */
export function httpError(
  message: string,
  init?: number | ResponseInit,
  data?: Record<string, unknown>,
) {
  throw new HttpError(message, init, data);
}

export function handleHttpError(error: unknown) {
  if (isHttpError(error)) {
    return json(
      { error: { message: error.message, data: error.data } },
      error.init,
    );
  } else {
    return json({ error: { message: 'internal server error' } }, 500);
  }
}
