#!/usr/bin/env node
/**
 * Build the kit and copy it straight into the apps that consume it, so kit
 * changes can be tried without cutting an npm release.
 *
 * Copying rather than `npm link` is deliberate. A link makes the kit resolve
 * from its own directory, so it drags in its own `node_modules/svelte` and the
 * app ends up with two Svelte copies — `Snippet` gets two identities and
 * `svelte-check` reports dozens of "two different types with this name exist"
 * errors that have nothing to do with your change. Copying into the app leaves
 * exactly one Svelte, so types and builds behave as they will after a release.
 *
 * One shot rather than a watcher, also deliberate. `svelte-package` writes
 * components and type declarations in separate phases through a
 * `__package_types_tmp__` staging directory; anything copying `dist` while that
 * runs hits ENOENT and EPERM on files moving underneath it. Building first and
 * copying after removes the race entirely.
 *
 * Usage:  npm run push          — build, then copy to the default apps
 *         npm run push -- <dir> — copy to specific app directories instead
 *         npm run push -- --no-build
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = '@hashrytech/quick-components-kit';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const DEFAULT_APPS = [
	'F:/Projects/hashry/github/quick-store',
	'F:/Projects/hashry/github/hashry-admin'
];

const argv = process.argv.slice(2);
const build = !argv.includes('--no-build');
const requested = argv.filter((a) => !a.startsWith('--'));

if (build) {
	console.log('[push] building…');
	const r = spawnSync('npx', ['svelte-package'], {
		cwd: root,
		stdio: 'inherit',
		shell: process.platform === 'win32'
	});
	if (r.status !== 0) {
		console.error('[push] build failed — nothing copied');
		process.exit(r.status ?? 1);
	}
}

/** Files under `dir`, relative to it. Skips svelte-package's staging directory. */
function listFiles(dir, base = dir, out = new Set()) {
	let entries;
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for (const e of entries) {
		if (e.name === '__package_types_tmp__') continue;
		const full = path.join(dir, e.name);
		if (e.isDirectory()) listFiles(full, base, out);
		else out.add(path.relative(base, full));
	}
	return out;
}

const apps = (requested.length ? requested : DEFAULT_APPS)
	.map((a) => path.resolve(a))
	.map((appDir) => ({ appDir, target: path.join(appDir, 'node_modules', ...KIT.split('/'), 'dist') }))
	.filter(({ appDir, target }) => {
		// The app must already have the kit installed from npm — this replaces
		// `dist`, it does not stand in for the package.json the app resolves through.
		if (fs.existsSync(path.dirname(target))) return true;
		console.warn(`[push] skip ${appDir} — ${KIT} is not installed there`);
		return false;
	});

if (!apps.length) {
	console.error('[push] no target apps');
	process.exit(1);
}

const wanted = listFiles(dist);
if (!wanted.size) {
	console.error(`[push] ${dist} is empty — build first`);
	process.exit(1);
}

for (const { appDir, target } of apps) {
	for (const rel of wanted) {
		const to = path.join(target, rel);
		fs.mkdirSync(path.dirname(to), { recursive: true });
		fs.copyFileSync(path.join(dist, rel), to);
	}
	// Drop files the kit no longer produces, so a renamed or deleted component
	// does not linger in the app and keep resolving.
	let pruned = 0;
	for (const rel of listFiles(target)) {
		if (!wanted.has(rel)) {
			fs.rmSync(path.join(target, rel), { force: true });
			pruned++;
		}
	}
	console.log(`[push] ${appDir} — ${wanted.size} files${pruned ? `, ${pruned} pruned` : ''}`);
}

console.log('[push] done. Reload the app in the browser.');
