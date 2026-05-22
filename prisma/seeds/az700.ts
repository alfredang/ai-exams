/**
 * CLI shim for the AZ-700 bundle seed.
 *
 *   npx tsx prisma/seeds/az700.ts
 *
 * The actual logic lives in src/lib/seed/az700-questions.ts so the same
 * function can also be invoked from the protected admin API endpoint
 * /api/admin/seed-az700 (lets us bootstrap production without a redeploy).
 */
import { PrismaClient } from '@prisma/client';
import { seedAz700 } from '../../src/lib/seed/az700-questions';

const db = new PrismaClient();

async function main() {
  const result = await seedAz700(db);
  console.log(`✓ vendor: ${result.vendor}`);
  console.log(`✓ bundle: ${result.bundle}`);
  for (const e of result.exams) {
    console.log(`✓ ${e.slug}: ${e.questionCount} questions (${e.teaserCount} teaser)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
