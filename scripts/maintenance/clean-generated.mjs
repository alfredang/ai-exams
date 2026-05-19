import { rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function resolveInsideRepo(relativePath) {
  const target = path.resolve(repoRoot, relativePath);
  if (target !== repoRoot && !target.startsWith(`${repoRoot}${path.sep}`)) {
    throw new Error(`Refusing to clean outside repository: ${relativePath}`);
  }
  return target;
}

async function removeTarget(relativePath) {
  const target = resolveInsideRepo(relativePath);
  await rm(target, { recursive: true, force: true });
  console.log(`removed ${relativePath}`);
}

async function removePrismaTempEngines() {
  const clientDir = resolveInsideRepo(path.join('node_modules', '.prisma', 'client'));
  let entries = [];
  try {
    entries = await readdir(clientDir);
  } catch {
    return;
  }

  const tempEngines = entries.filter((name) => /^query_engine-.*\.tmp\d+$/.test(name));
  for (const name of tempEngines) {
    await rm(path.join(clientDir, name), { force: true });
    console.log(`removed node_modules/.prisma/client/${name}`);
  }
}

await Promise.all([
  removeTarget('.next'),
  removeTarget('dist'),
  removeTarget('coverage'),
  removeTarget(path.join('node_modules', '.cache')),
  removeTarget(path.join('node_modules', '@prisma', 'engines', 'node_modules', '.cache')),
  removeTarget('tsconfig.tsbuildinfo')
]);
await removePrismaTempEngines();
