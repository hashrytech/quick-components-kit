import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));
const outputDir = path.resolve(__dirname, 'dist');

const outputPkg = {
  name: pkg.name,
  description: pkg.description,
  keywords: pkg.keywords,
  repository: pkg.repository,
  version: pkg.version,
  license: pkg.license,
  author: pkg.author,
  files: pkg.files,
  sideEffects: pkg.sideEffects,
  svelte: pkg.svelte,
  main: pkg.main,
  module: pkg.module,
  types: pkg.types,
  type: pkg.type,
  exports: pkg.exports,
  dependencies: pkg.dependencies,
  peerDependencies: pkg.peerDependencies,
  publishConfig: {
    access: 'public'
  }
};

fs.writeFileSync(path.join(outputDir, 'package.json'), JSON.stringify(outputPkg, null, 2));
console.log(`Generated clean package.json at ${outputDir}/package.json`);
