/**
 * One-shot: hide standalone exam shells that duplicate an existing bundle,
 * and fold the Microsoft AI-102 "official" + "practice" shells into the
 * existing microsoft-ai-102 bundle.
 *
 *   npx tsx scripts/maintenance/seed-hide-bundle-duplicates.ts
 *
 * Idempotent — safe to re-run.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Standalone exam slugs to unpublish (they duplicate a bundle that already
// exists at the same cert).
const SLUGS_TO_HIDE = [
  // 6 AWS base shells whose slug shadows their bundle in URL routing
  'aws-aif-c01',
  'aws-clf-c02',
  'aws-dea-c01',
  'aws-dop-c02',
  'aws-dva-c02',
  'aws-saa-c03',
  // Google Cloud — different slug from the bundle but same cert
  'google-associate-cloud-engineer',
  // Microsoft AI-102 orphan shells — folded into the bundle below
  'microsoft-ai-102-official',
  'microsoft-ai-102-practice'
];

// Bundle expansions — add the AI-102 orphan shells as PRACTICE items so
// bundle buyers get access to them too.
async function expandAi102Bundle() {
  const bundle = await db.bundle.findUnique({
    where: { slug: 'microsoft-ai-102' },
    include: { items: { orderBy: { position: 'asc' } } }
  });
  if (!bundle) { console.log('  ⚠ microsoft-ai-102 bundle not found'); return; }

  const orphanSlugs = ['microsoft-ai-102-official', 'microsoft-ai-102-practice'];
  const orphans = await db.exam.findMany({
    where: { slug: { in: orphanSlugs } },
    select: { id: true, slug: true }
  });
  if (orphans.length === 0) { console.log('  ⚠ no AI-102 orphan exams to fold'); return; }

  // Highest current position
  let pos = bundle.items.reduce((m, i) => Math.max(m, i.position), 0);
  for (const orphan of orphans) {
    pos += 1;
    // upsert is safe — unique (bundleId, examId, tier)
    await db.bundleItem.upsert({
      where: { bundleId_examId_tier: { bundleId: bundle.id, examId: orphan.id, tier: 'PRACTICE' } },
      update: { position: pos },
      create: { bundleId: bundle.id, examId: orphan.id, tier: 'PRACTICE', position: pos }
    });
    console.log(`  ✓ added ${orphan.slug} to microsoft-ai-102 bundle (position ${pos})`);
  }
}

async function main() {
  await expandAi102Bundle();

  const r = await db.exam.updateMany({
    where: { slug: { in: SLUGS_TO_HIDE } },
    data: { published: false }
  });
  console.log(`\n✓ Unpublished ${r.count}/${SLUGS_TO_HIDE.length} standalone shell(s).`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
