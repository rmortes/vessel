import type {
  LoadableRoute,
  LoadedRoute,
  MatchedRoute,
  Route,
} from 'shared/routing';

import type {
  HttpRequestModule,
  RequestEvent,
  RequestParams,
} from './http/request';
import type { JSONData } from './http/response';

// ---------------------------------------------------------------------------------------
// Server Module
// ---------------------------------------------------------------------------------------

export type ServerModule = {
  [id: string]: unknown;
  staticLoader?: StaticLoader;
  serverLoader?: ServerLoader;
  serverAction?: ServerAction;
};

// ---------------------------------------------------------------------------------------
// Server Entry
// ---------------------------------------------------------------------------------------

export type ServerEntryContext = {
  route: LoadedServerRoute;
};

export type ServerEntryModule = {
  [id: string]: unknown;
  render: ServerRenderer;
};

export type ServerEntryLoader = () => Promise<ServerEntryModule>;

export type ServerRenderer = (
  context: ServerEntryContext,
) => Promise<ServerRenderResult>;

export type ServerRenderResult = {
  head?: string;
  css?: string;
  html: string;
};

// ---------------------------------------------------------------------------------------
// Server Manifest
// ---------------------------------------------------------------------------------------

export type ServerManifest = {
  entry: ServerEntryLoader;
  routes: ServerRoute[];
  endpoints: ServerEndpointRoute[];
  html: {
    entry: string;
    template: string;
    stylesheet: string;
    head: Record<string, string>;
    body: Record<string, string>;
  };
  staticData: {
    hashMap: string;
    loader: StaticDataLoader;
  };
  trailingSlash: boolean;
};

export type ServerRoute = LoadableRoute<ServerModule>;
export type MatchedServerRoute = MatchedRoute<ServerRoute>;
export type LoadedServerRoute = LoadedRoute<MatchedServerRoute, ServerModule>;

export type ServerEndpointRoute = LoadableRoute<HttpRequestModule>;
export type ServerRequestHandler = (request: Request) => Promise<Response>;

export type ServerRedirect = {
  readonly path: string;
  readonly status: number;
};

// ---------------------------------------------------------------------------------------
// Static Loader
// ---------------------------------------------------------------------------------------

export type StaticDataLoader = (id: string) => Promise<JSONData>;

export type StaticLoaderInput<Params extends RequestParams = RequestParams> =
  Readonly<{
    pathname: string;
    route: Route;
    params: Params;
  }>;

/** Map of data asset id to server loaded data object. */
export type StaticLoaderDataMap = Map<string, JSONData>;

/** Key can be anything but only truthy values are cached. */
export type StaticLoaderCacheKey = unknown;

export type StaticLoaderCacheMap = Map<
  StaticLoaderCacheKey,
  StaticLoaderOutput
>;

export type StaticLoaderCacheKeyBuilder = (
  input: StaticLoaderInput,
) => StaticLoaderCacheKey | Promise<StaticLoaderCacheKey>;

export type StaticLoader<
  Params extends RequestParams = RequestParams,
  Data extends JSONData = JSONData,
> = (
  input: StaticLoaderInput<Params>,
) => MaybeStaticLoaderOutput<Data> | Promise<MaybeStaticLoaderOutput<Data>>;

export type StaticLoaderOutput<Data = JSONData> = {
  data?: Data;
  readonly redirect?: string | { path: string; status?: number };
  readonly cache?: StaticLoaderCacheKeyBuilder;
};

export type MaybeStaticLoaderOutput<Data = JSONData> =
  | void
  | undefined
  | null
  | StaticLoaderOutput<Data>;

// ---------------------------------------------------------------------------------------
// Server Loader
// ---------------------------------------------------------------------------------------

export type ServerLoader<Params extends RequestParams = RequestParams> = (
  event: RequestEvent<Params>,
) => ServerLoaderOutput | Promise<ServerLoaderOutput>;

export type ServerLoaderOutput = Response | JSONData;

// ---------------------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------------------

export type ServerAction<Params extends RequestParams = RequestParams> = (
  event: RequestEvent<Params>,
) => ServerLoaderOutput | Promise<ServerLoaderOutput>;
