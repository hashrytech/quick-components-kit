#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the base project directory (../ from /scripts)
const baseDir = path.resolve(__dirname, '..');

// Determine target package.json (default to baseDir, or override with CLI arg)
const targetDir = process.argv[2] ? path.resolve(__dirname, '..', process.argv[2]) : baseDir;
const packageJsonPath = path.resolve(targetDir, 'package.json');

// Read package.json
if (!fs.existsSync(packageJsonPath)) {
  console.error(`package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

const packageJsonRaw = fs.readFileSync(packageJsonPath, 'utf-8');
const packageJson = JSON.parse(packageJsonRaw);

// Remove devDependencies and scripts
delete packageJson.devDependencies;
delete packageJson.scripts;

console.log(`Cleaning package.json in ${packageJsonPath}...`);

// Overwrite the existing package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('package.json cleaned and updated!');
