import type { App } from 'node/app/App';
import fs from 'node:fs';

export const DEFAULT_INDEX_HTML = `
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="generator" content="vessel@{{ version }}" />
    <!--@vessel/head-->
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="app"><!--@vessel/app--></div>
    <!--@vessel/body-->
  </body>
</html>
`;

export function readIndexHtmlFile(app: App, { dev = true } = {}): string {
  const indexPath = app.dirs.app.resolve('index.html');

  let html = fs.existsSync(indexPath)
    ? fs.readFileSync(indexPath, 'utf-8')
    : DEFAULT_INDEX_HTML;

  if (dev) {
    html = html.replace(
      '<!--@vessel/head-->',
      '<script type="module" src="/:virtual/vessel/client"></script>\n\t<!--@vessel/head-->',
    );
  }

  return html.replace('{{ version }}', app.version);
}
