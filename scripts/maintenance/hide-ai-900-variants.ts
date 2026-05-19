/**
 * One-shot DB patch: hide the 6 AI-900 P1-P6 practice exam variants from the
 * public catalog now that they're sold via the "Microsoft Azure AI Fundamentals
 * (AI-900)" bundle. Entitled users can still access them directly.
 *
 *   npx tsx scripts/maintenance/hide-ai-900-variants.ts
 *
 * Idempotent.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const SLUGS = [
  'microsoft-ai-900-p1',
  'microsoft-ai-900-p2',
  'microsoft-ai-900-p3',
  'microsoft-ai-900-p4',
  'microsoft-ai-900-p5',
  'microsoft-ai-900-p6'
];

async function main() {
  const result = await db.exam.updateMany({
    where: { slug: { in: SLUGS } },
    data: { published: false }
  });
  console.log(`✓ Unpublished ${result.count}/${SLUGS.length} AI-900 practice exam variants.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
