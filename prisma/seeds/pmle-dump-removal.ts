/**
 * CLI shim for the PMLE dump removal.
 *
 *   npx tsx prisma/seeds/pmle-dump-removal.ts
 *
 * The logic lives in src/lib/seed/pmle-dump-removal.ts so the same function is
 * reachable from the protected admin API (/api/admin/fix-pmle-dumps) — which is
 * how it reaches production, since there is no container shell.
 */
import { PrismaClient } from '@prisma/client';
import { removePmleDumps } from '../../src/lib/seed/pmle-dump-removal';

const db = new PrismaClient();

async function main() {
  const r = await removePmleDumps(db);
  console.log(`✓ scanned ${r.scanned} candidate(s), removed ${r.removed} dump question(s)`);
  for (const [slug, n] of Object.entries(r.removedByExam)) console.log(`   - ${slug}: ${n} removed`);
  if (r.retiredVariants.length) {
    console.log(`✓ retired ${r.retiredVariants.length} unusable variant(s): ${r.retiredVariants.join(', ')}`);
    console.log(`   ↳ removed ${r.bundleItemsRemoved} bundle item(s); exams unpublished, NOT deleted (existing buyers keep access)`);
  }
  for (const [slug, a] of Object.entries(r.questionCountAdjusted)) {
    console.log(`✓ ${slug}: questionCount ${a.from} → ${a.to} (advertised length now matches the bank)`);
  }
  console.log('\nFinal state:');
  for (const [slug, s] of Object.entries(r.perExam)) {
    console.log(`   ${slug.padEnd(38)} ${String(s.total).padStart(3)} published · ${s.teasers} teaser · attempt=${s.questionCount} · ${s.published ? 'ACTIVE' : 'inactive'}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
