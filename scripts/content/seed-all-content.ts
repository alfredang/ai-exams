import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { seedQuestionBank } from './seed-question-bank';

const questionBankDir = join(process.cwd(), 'content', 'question-banks');
const manifestPath = join(questionBankDir, 'manifest.json');

function readManifest(): string[] {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;
  if (!Array.isArray(manifest) || !manifest.every((entry) => typeof entry === 'string')) {
    throw new Error(`Invalid question bank manifest: ${manifestPath}`);
  }
  return manifest;
}

async function main() {
  const manifest = readManifest();
  const db = new PrismaClient();

  try {
    for (const fileName of manifest) {
      const bankPath = join(questionBankDir, fileName);
      const result = await seedQuestionBank(db, bankPath);
      const status = result.skipped ? `skipped (${result.reason})` : `inserted ${result.inserted}`;
      console.log(`${fileName}: ${status}`);
    }
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
