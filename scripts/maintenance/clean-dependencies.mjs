import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const nodeModulesPath = path.resolve(repoRoot, 'node_modules');

if (!nodeModulesPath.startsWith(`${repoRoot}${path.sep}`)) {
  throw new Error('Refusing to remove dependencies outside the repository');
}

await rm(nodeModulesPath, { recursive: true, force: true });
console.log('removed node_modules');
