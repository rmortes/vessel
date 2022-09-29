import { type VesselPlugins, VM_PREFIX } from '@vessel-js/app/node';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'pathe';

import { renderMarkdoc, svelteMarkdocTags, transformTreeNode } from './markdoc';

const VIRTUAL_APP_ID = `${VM_PREFIX}/svelte/app` as const;

export function sveltePlugin(): VesselPlugins {
  let appDir: string;

  const require = createRequire(import.meta.url);

  function resolveAppId() {
    const appFile = path.resolve(appDir, '+app.svelte');
    return fs.existsSync(appFile)
      ? { id: appFile }
      : { id: require.resolve('@vessel-js/svelte/+app.svelte') };
  }

  return [
    {
      name: '@vessel/svelte',
      enforce: 'pre',
      config() {
        return {
          optimizeDeps: {
            include: ['svelte'],
          },
          resolve: {
            alias: {
              [VIRTUAL_APP_ID]: `/${VIRTUAL_APP_ID}`,
            },
          },
        };
      },
      vessel: {
        enforce: 'pre',
        config(config) {
          appDir = config.dirs.app;
          const appId = resolveAppId().id;
          return {
            entry: {
              client: require.resolve('@vessel-js/svelte/entry-client.js'),
              server: require.resolve('@vessel-js/svelte/entry-server.js'),
            },
            client: {
              app: appId,
            },
            markdown: {
              markdoc: { tags: svelteMarkdocTags },
              render: renderMarkdoc,
              transformTreeNode: [transformTreeNode],
            },
          };
        },
      },
      resolveId(id) {
        if (id === `/${VIRTUAL_APP_ID}`) {
          return resolveAppId();
        }

        return null;
      },
    },
  ];
}
