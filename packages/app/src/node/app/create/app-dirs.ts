import { normalizePath } from 'node/utils';
import fs from 'node:fs';
import path from 'node:path';
import { searchForWorkspaceRoot } from 'vite';

import type { AppDirectories, Directory } from '../App';
import type { ResolvedAppConfig } from '../config';

export function createAppDirectories(
  root: string,
  config: ResolvedAppConfig,
): AppDirectories {
  const cwdDir = createDirectory(process.cwd());
  const rootDir = createDirectory(root);
  const workspaceDir = createDirectory(
    searchForWorkspaceRoot(cwdDir.path, rootDir.path),
  );
  const appDir = createDirectory(config.dirs.app);
  const buildDir = createDirectory(config.dirs.build);
  const tmpDir = createDirectory(rootDir.resolve('.vessel'));
  const clientDir = createDirectory(rootDir.resolve('.vessel/client'));
  const serverDir = createDirectory(rootDir.resolve('.vessel/server'));
  const publicDir = createDirectory(config.dirs.public);
  return {
    cwd: cwdDir,
    workspace: workspaceDir,
    root: rootDir,
    app: appDir,
    tmp: tmpDir,
    build: buildDir,
    client: clientDir,
    server: serverDir,
    public: publicDir,
  };
}

export function createDirectory(dirname: string): Directory {
  const resolve = (...args: string[]) =>
    args.length === 1 && path.posix.isAbsolute(normalizePath(args[0]))
      ? normalizePath(args[0])
      : normalizePath(path.posix.resolve(dirname, ...args));

  const relative = (...args: string[]) =>
    normalizePath(path.posix.relative(dirname, path.posix.join(...args)));

  const read = (filePath: string) =>
    fs.readFileSync(resolve(filePath), 'utf-8');

  const write = (filePath: string, data: string) =>
    fs.writeFileSync(resolve(filePath), data);

  return {
    path: dirname,
    resolve,
    relative,
    read,
    write,
  };
}
