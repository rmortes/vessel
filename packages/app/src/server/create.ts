import type {
  AnyResponse,
  FetchMiddleware,
  JSONData,
  RequestParams,
} from 'shared/http';

import type {
  ServerApiRequestHandler,
  ServerLoader,
  StaticLoader,
} from './types';

export function createStaticLoader<
  Params extends RequestParams = RequestParams,
  Data extends JSONData = JSONData,
>(loader: StaticLoader<Params, Data>) {
  return loader;
}

export function createServerLoader<
  Params extends RequestParams = RequestParams,
  Response extends AnyResponse = AnyResponse,
>(
  loader: ServerLoader<Params, Response>,
  init?: { middleware?: FetchMiddleware[] },
) {
  loader.middleware = init?.middleware;
  return loader;
}

export function createApiRequestHandler<
  Params extends RequestParams = RequestParams,
  Response extends AnyResponse = AnyResponse,
>(
  handler: ServerApiRequestHandler<Params, Response>,
  init?: { middleware?: FetchMiddleware[] },
) {
  handler.middleware = init?.middleware;
  return handler;
}
