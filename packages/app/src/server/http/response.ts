/**
 * From: https://github.com/remix-run/remix/blob/main/packages/remix-server-runtime
 */

export type JsonFunction = <Data extends unknown>(
  data: Data,
  init?: number | ResponseInit,
) => TypedResponse<Data>;

export type TypedResponse<T extends unknown = unknown> = Response & {
  json(): Promise<T>;
};

export type JSONData = Record<string, unknown>;

/**
 * This is a shortcut for creating `application/json` responses. Converts `data` to JSON and sets
 * the `Content-Type` header.
 */
export const json: JsonFunction = (data, init = {}) => {
  const responseInit = typeof init === 'number' ? { status: init } : init;

  const headers = new Headers(responseInit.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
  }

  return new Response(JSON.stringify(data), {
    ...responseInit,
    headers,
  });
};

export type RedirectFunction = (
  url: string,
  init?: number | ResponseInit,
) => TypedResponse<never>;

/**
 * A redirect response. Sets the status code and the `Location` header. Defaults to "302 Found".
 */
export const redirect: RedirectFunction = (url, init = 302) => {
  let responseInit = init;

  if (typeof responseInit === 'number') {
    responseInit = { status: responseInit };
  } else if (typeof responseInit.status === 'undefined') {
    responseInit.status = 302;
  }

  const headers = new Headers(responseInit.headers);
  headers.set('Location', url);

  return new Response(null, {
    ...responseInit,
    headers,
  }) as TypedResponse<never>;
};

export function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}

const redirectStatusCodes = new Set([301, 302, 303, 307, 308]);
export function isRedirectResponse(response: Response): boolean {
  return redirectStatusCodes.has(response.status);
}
