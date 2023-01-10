import prompt from 'enquirer';
import { execa } from 'execa';
import fs from 'fs';
import kleur from 'kleur';
import minimist from 'minimist';
import { createRequire } from 'module';
import path from 'path';
import semver from 'semver';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = minimist(process.argv.slice(2));
const isDryRun = args.dry;
const skippedPackages = [];
const currentVersion = require('../package.json').version;
const packagesDir = fs.readdirSync(path.resolve(__dirname, '../packages'));
const packages = packagesDir.filter((p) => !p.startsWith('.'));
const preId =
  args.preid || (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)?.[0]);
const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []),
];

function inc(i) {
  return semver.inc(currentVersion, i, preId);
}

async function run(bin, args, opts = {}) {
  return execa(bin, args, { stdio: 'inherit', ...opts });
}

async function dryRun(bin, args, opts = {}) {
  console.info(kleur.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts);
}

const runIfNotDry = isDryRun ? dryRun : run;

function getPkgRoot(pkgName) {
  return path.resolve(__dirname, '../packages/' + pkgName);
}

function step(msg) {
  console.info('\n✨ ' + kleur.cyan(msg) + '\n');
}

async function main() {
  let targetVersion = args._[0];

  if (!targetVersion) {
    const { release } = /** @type {{ release: string }} */ (
      await prompt.prompt({
        type: 'select',
        name: 'release',
        message: 'Select release type',
        choices: versionIncrements.map((i) => `${i} (${inc(i)})`).concat(['custom']),
      })
    );

    if (release === 'custom') {
      targetVersion = /** @type {{ version: string }} */ (
        await prompt.prompt({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion,
        })
      ).version;
    } else {
      targetVersion = /** @type {string[]} */ (release.match(/\((.*)\)/))[1];
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(kleur.red(`🚨 invalid target version: ${targetVersion}`));
  }

  const { yes } = /** @type {{ yes: boolean }} */ (
    await prompt.prompt({
      type: 'confirm',
      name: 'yes',
      message: `Releasing v${targetVersion}. Confirm?`,
    })
  );

  if (!yes) {
    return;
  }

  step('Updating cross dependencies...');
  updateVersions(targetVersion);

  step('Generating changelog...');
  await run(`npm`, ['run', 'changelog']);

  for (const pkg of packages) {
    await publishPackage(pkg, targetVersion, runIfNotDry);
  }

  step('Adding back workspace settings...');
  updateVersions('workspace:*');

  step('Updating lockfile...');
  await run(`pnpm`, ['install']);

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
  if (stdout) {
    step('Committing changes...');
    await runIfNotDry('git', ['add', '-A']);
    await runIfNotDry('git', ['commit', '-m', `chore(release): v${targetVersion}`]);
  } else {
    console.log('No changes to commit.');
  }

  step('Pushing to GitHub...');
  await runIfNotDry('git', ['tag', `v${targetVersion}`]);
  await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
  await runIfNotDry('git', ['push', 'origin', 'main']);

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`);
  }

  if (skippedPackages.length) {
    console.log(
      kleur.yellow(
        `The following packages are skipped and NOT published:\n- ${skippedPackages.join('\n- ')}`,
      ),
    );
  }
  console.log();
}

function updateVersions(version) {
  // 1. update root package.json
  updatePackageVersion(path.resolve(__dirname, '..'), version);
  // 2. update all packages
  packages.forEach((p) => updatePackageVersion(getPkgRoot(p), version));
}

function updatePackageVersion(pkgRoot, version) {
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  if (version !== 'workspace:*') pkg.version = version;

  if (!pkg.private) {
    updatePackageDeps(pkg, 'dependencies', version);
    updatePackageDeps(pkg, 'peerDependencies', version);
  }

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function updatePackageDeps(pkg, depType, version) {
  const deps = pkg[depType];
  if (!deps) return;
  Object.keys(deps).forEach((dep) => {
    if (/^@?vessel-js/.test(dep)) {
      const color = version === 'workspace:*' ? 'cyan' : 'yellow';
      console.log(kleur[color](`🦠 ${pkg.name} -> ${depType} -> ${dep}@${version}`));
      deps[dep] = version;
    }
  });
}

async function publishPackage(pkgName, version, runIfNotDry) {
  if (skippedPackages.includes(pkgName)) {
    return;
  }

  const pkgRoot = getPkgRoot(pkgName);
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  if (pkg.private) {
    console.log(kleur.red(`\n🚫 Skipping private package: ${pkg.name}`));
    return;
  }

  let releaseTag = null;
  if (args.tag) {
    releaseTag = args.tag;
  } else if (version.includes('alpha')) {
    releaseTag = 'alpha';
  } else if (version.includes('beta')) {
    releaseTag = 'beta';
  } else if (version.includes('rc')) {
    releaseTag = 'rc';
  } else {
    releaseTag = 'latest';
  }

  step(`Publishing ${pkgName}...`);

  try {
    await runIfNotDry(
      'yarn',
      ['publish', '--new-version', version, '--tag', releaseTag, '--access', 'public'],
      {
        cwd: pkgRoot,
        stdio: 'pipe',
      },
    );
    console.log(kleur.green(`\n✅ Successfully published ${pkgName}@${version}`));
  } catch (e) {
    if (/** @type {any} */ (e).stderr.match(/previously published/)) {
      console.log(kleur.red(`\n🚫 Skipping already published: ${pkgName}`));
    } else {
      throw e;
    }
  }
}

if (isDryRun) console.log(kleur.cyan('\n☂️  Running in dry mode...\n'));

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
