import { resolveStaticDataAssetId } from 'shared/data';
import {
  execRouteMatch,
  getRouteComponentTypes,
  type Route,
} from 'shared/routing';

import type {
  ServerLoadedRoute,
  StaticLoaderDataMap,
  StaticLoaderInput,
} from './types';

export function createStaticLoaderInput(
  url: URL,
  route: Route,
): StaticLoaderInput {
  const match = execRouteMatch(url, route)!;
  return {
    pathname: url.pathname,
    route,
    params: match.groups,
  };
}

export function createStaticLoaderDataMap(
  routes: ServerLoadedRoute[],
): StaticLoaderDataMap {
  const map: StaticLoaderDataMap = new Map();

  for (const route of routes) {
    for (const type of getRouteComponentTypes()) {
      const component = route[type];
      if (
        component?.staticData &&
        Object.keys(component.staticData).length > 0
      ) {
        map.set(
          resolveStaticDataAssetId(route.id, type, route.url.pathname),
          component.staticData,
        );
      }
    }
  }

  return map;
}

export function createStaticDataScriptTag(map: StaticLoaderDataMap) {
  const table = {};

  for (const id of map.keys()) {
    const data = map.get(id)!;
    if (data && Object.keys(data).length > 0) {
      table[id] = data;
    }
  }

  return [
    '<script>',
    `__VSL_STATIC_DATA__ = JSON.parse(${JSON.stringify(
      JSON.stringify(table),
    )});`,
    '</script>',
  ].join('');
}
