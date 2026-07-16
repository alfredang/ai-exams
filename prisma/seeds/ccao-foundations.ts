/**
 * CLI shim for the Claude Certified Associate — Foundations (CCAO-F) seed.
 *
 *   npx tsx prisma/seeds/ccao-foundations.ts
 *
 * The actual logic lives in src/lib/seed/ccao-foundations-questions.ts so the
 * same function can also be invoked from the protected admin API endpoint
 * /api/admin/seed-ccao-foundations (lets us bootstrap production without a
 * redeploy).
 */
import { PrismaClient } from '@prisma/client';
import { seedCcaoFoundations } from '../../src/lib/seed/ccao-foundations-questions';

const db = new PrismaClient();

async function main() {
  const result = await seedCcaoFoundations(db);
  console.log(`✓ vendor: ${result.vendor}`);
  for (const e of result.exams) {
    console.log(`✓ exam ${e.slug}: ${e.questionCount} questions (${e.teaserCount} teaser)`);
    if (e.legacyRetired > 0) {
      console.log(`  ↳ retired ${e.legacyRetired} legacy pre-seed question(s)`);
    }
  }
  console.log(`✓ bundle: ${result.bundle}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
