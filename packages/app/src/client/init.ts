import { MarkdownMeta } from 'shared/markdown';
import { installURLPattern } from 'shared/polyfills';
import {
  getRouteComponentTypes,
  type LoadableRouteComponent,
  type RouteComponentType,
} from 'shared/routing';

import app from ':virtual/vessel/app';
import manifest from ':virtual/vessel/manifest';

import {
  type ClientLoadableRoute,
  Router,
  type RouterFrameworkDelegate,
} from './router';
import type { ClientManifest } from './router/types';
import { isMarkdownModule } from './utils';

export type ClientInitOptions = {
  frameworkDelegate: RouterFrameworkDelegate;
};

export async function init({ frameworkDelegate }: ClientInitOptions) {
  await installURLPattern();

  const router = new Router({
    baseUrl: app.baseUrl,
    trailingSlash: window['__VSL_TRAILING_SLASH__'],
    frameworkDelegate,
  });

  if (import.meta.env.PROD) {
    const redirects = window['__VSL_STATIC_REDIRECTS_MAP__'] ?? {};
    for (const from of Object.keys(redirects)) {
      const to = redirects[from];
      router.addRedirect(from, to);
    }
  }

  readManifest(router, manifest);

  if (import.meta.hot) {
    import.meta.hot.on(
      'vessel::md_meta',
      ({
        filePath,
        type,
        meta,
      }: {
        filePath: string;
        type: RouteComponentType;
        meta: MarkdownMeta;
      }) => {
        const route = frameworkDelegate.route.get();
        if (
          route[type] &&
          isMarkdownModule(route[type]!.module) &&
          filePath.endsWith(route.id)
        ) {
          frameworkDelegate.route.set({
            ...route,
            [type]: {
              ...route[type],
              module: {
                ...route[type]!.module,
                __markdownMeta: meta,
              },
            },
          });
        }
      },
    );

    frameworkDelegate.route.subscribe((route) => {
      if (route) {
        import.meta.hot!.send('vessel::route_change', { id: route.id });
      }
    });

    import.meta.hot.accept('/:virtual/vessel/manifest', (mod) => {
      handleManifestChange(router, mod?.default);
    });
  }

  return router;
}

const routeIds = new Set<string | symbol>();

function readManifest(
  router: Router,
  { loaders, fetch, routes }: ClientManifest,
) {
  let loaderIndex = 0;
  const clientRoutes: ClientLoadableRoute[] = [];

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const [id, pathname, score] = route.path;

    const newRoute = {
      id,
      pathname,
      score,
      pattern: new URLPattern({ pathname }),
    };

    for (const type of getRouteComponentTypes()) {
      if (route[type]) {
        newRoute[type] = {
          loader: loaders[loaderIndex++],
          canFetch: fetch.includes(loaderIndex),
        } as LoadableRouteComponent;
      }
    }

    clientRoutes.push(newRoute);
    if (import.meta.hot) routeIds.add(id!);
  }

  router.addAll(clientRoutes);
}

function handleManifestChange(router: Router, manifest?: ClientManifest) {
  if (import.meta.hot) {
    for (const id of routeIds) {
      router.remove(id);
      routeIds.delete(id);
    }

    if (manifest) readManifest(router, manifest);
  }
}
