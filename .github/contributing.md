# Contributing Guide

First off, thank you for taking the time to contribute to Vessel. You'll find instructions below
on how to get yourself up and running so you can create your first PR.

## 🎒 Getting Started

### Prerequisites

Let's setup our machine. The only software you'll need to install is:

- [node](https://nodejs.org/en/download)
- [git](https://git-scm.com/downloads)
- [pnpm](https://pnpm.io/installation)
- [volta](https://docs.volta.sh/guide) or [nvm](https://github.com/nvm-sh/nvm)
  (we recommend volta)

They're very easy to install, just follow the links and you should be up and running in no time.

### Fork & Clone

Next, head over to the [Vessel repository on GitHub][vessel] and click the `Fork` button in the
top right corner. After the project has been forked, run the following commands in your terminal...

```bash
# Replace {github-username} with your GitHub username.
$: git clone https://github.com/{github-username}/vessel --depth=1

$: cd vessel

$: pnpm install
```

**OPTIONAL:** Now it'll help if we keep our `main` branch pointing at the original repository and make
pull requests from the forked branch.

```bash
# Add the original repository as a "remote" called "upstream".
$: git remote add upstream git@github.com:vessel-js/vessel.git

# Fetch the git information from the remote.
$: git fetch upstream

# Set your local main branch to use the upstream main branch whenver you run `git pull`.
$: git branch --set-upstream-to=upstream/main main

# Run this when we want to update our version of main.
$: git pull
```

### Node

Once you're done simply set your Node version to match the required version by Vessel. If you've
installed `volta` then it will automatically pin it, and if you're using `nvm` simply run `nvm use`
from the project root.

## 💼 Package Manager (PNPM)

```bash
# Install all dependenices and symlink packages in the workspace (see `pnpm-workspace.yaml`).
$: pnpm i

# Install dependency for a single package.
$: pnpm -F core i vite

# Update a dependency for a single package.
$: pnpm -F core up vite@2.6.13

# Update a dependency for all packages.
$: pnpm up vite@2.6.13 -r
```

## 📝 Documentation Site

The documentation site can be found in the `docs/` directory at the root of the project. It's
simply a Vessel application, refer to the docs itself if you need any guidance.

```bash
# run development environment
$: pnpm docs:dev

# build for production
$: pnpm docs:build

# preview production site
$: pnpm docs:preview
```

## 💻 Scripts

```bash
# Run eslint and prettier to lint files and look for any code type/style/format issues.
$: pnpm lint

# Run eslint and prettier to lint files and also auto-fix any issues.
$: pnpm format

# Run build in any of the packages in the `packages/` directory.
$: pnpm -F app build

# Run build and watch for changes in any of the packages in the `packages/` directory.
$: pnpm -F app dev

# Build all packages in the `packages/` directory.
$: pnpm build
```

## 🧪 Sandbox

The `sandbox/` directory at the root of the Vessel project is where we build and test Vessel
applications locally. It's safe to include anything inside of this directory as it's ignored
by Git.

We can quickly scaffold applications for local development via the `create-vessel` package which
can also handle symlinking the `@vessel-js/*` packages.

> We're using either NPM or Yarn in the example below because, Vessel uses a PNPM workspace which
> will only get in the way when running commands inside the sandbox.

```bash
# 1. - make sure all local packages are built.
$: yarn build
# 2. - scaffold an application for local development.
$: yarn create vessel sandbox/foo --link ../../packages
# 3.
$: yarn --cwd sandbox/foo
# 4.
$: yarn dev --cwd sandbox/foo
# 5. - run in another terminal session/window if we need to hack on a package.
$: pnpm -F app dev
$: pnpm -F svelte dev
```

The `--link ../../packages` CLI option will link any `@vessel-js/*` packages based on the link path
provided. For example, `@vessel-js/app` will be linked to `../../packages/app`.

## ✍️ Commit

This project uses [semantic commit messages][semantic-commit-style] to automate generating
changelogs and releases. Simply refer to the link, and also see existing commits to get an idea
of how to write your message.

If you've made changes to a specific package, simply include the package name without the
`@vessel-js` prefix in the commit scope (see example below).

```bash
# Commit general changes.
$: git commit -m 'chore: your commit message'

# Commit changes made to a specific package (eg: @vessel/app).
$: git commit -m 'fix(app): your commit message identifying fix'
```

## 🎉 Pull Request

**Working on your first Pull Request?** You can learn how from this free series
[How to Contribute to an Open Source Project on GitHub][pr-beginner-series].

Preferably create an issue first on GitHub, and then checkout a branch matching the issue number
(see example below). Once you're done, commit your changes, push to your forked repo, and create
a PR (see link above for more information if it's your first time).

```bash
# Create a branch for your PR, replace {issue-no} with the GitHub issue number.
$: git checkout -b issue-{issue-no}
```

[vessel]: https://github.com/vessel-js/vessel
[npm]: https://www.npmjs.com
[monorepo]: https://en.wikipedia.org/wiki/Monorepo
[semantic-commit-style]: https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716
[pr-beginner-series]: https://app.egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github
