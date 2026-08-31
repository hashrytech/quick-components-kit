#!/usr/bin/env node
/**
 * Packaging assertion (theming plan, Phase 1 kit scope): the theme token
 * contract must ship. svelte-package only packages src/lib, so a refactor
 * that moves theme.css out of src/lib would silently drop the file every
 * consumer's app.css imports. Fail the build instead.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

const themeCss = path.join(root, 'dist', 'theme.css');
if (!fs.existsSync(themeCss)) {
	failures.push('dist/theme.css is missing — is src/lib/theme.css still under src/lib?');
} else if (!fs.readFileSync(themeCss, 'utf8').includes('--color-primary-500')) {
	failures.push('dist/theme.css exists but does not look like the token contract.');
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.exports?.['./theme.css'] !== './dist/theme.css') {
	failures.push('package.json exports["./theme.css"] must be "./dist/theme.css".');
}

if (failures.length) {
	console.error('check-package FAILED:');
	for (const f of failures) console.error('  - ' + f);
	process.exit(1);
}
console.log('check-package OK: dist/theme.css present and exported.');
