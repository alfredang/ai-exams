/**
 * CLI shim for the Claude Certified Developer — Foundations (CCDV-F) seed.
 *
 *   npx tsx prisma/seeds/ccdv-foundations.ts
 *
 * The actual logic lives in src/lib/seed/ccdv-foundations-questions.ts so the
 * same function can also be invoked from the protected admin API endpoint
 * /api/admin/seed-ccdv-foundations (lets us bootstrap production without a
 * redeploy).
 */
import { PrismaClient } from '@prisma/client';
import { seedCcdvFoundations } from '../../src/lib/seed/ccdv-foundations-questions';

const db = new PrismaClient();

async function main() {
  const result = await seedCcdvFoundations(db);
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
