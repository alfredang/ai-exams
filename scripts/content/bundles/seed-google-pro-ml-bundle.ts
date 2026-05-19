/**
 * One-shot: consolidate the 6 Google Professional Machine Learning Engineer
 * practice exams (P1–P6) into a single bundle, hide the individual variants
 * from the public catalog.
 *
 *   npx tsx scripts/content/bundles/seed-google-pro-ml-bundle.ts
 *
 * Idempotent.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const BUNDLE = {
  slug: 'google-professional-ml-engineer',
  title: 'Google Professional Machine Learning Engineer',
  description:
    'All 6 Google Professional ML Engineer practice exams in one bundle — 360 questions covering architecting low-code AI, collaborating across teams, scaling prototypes, serving and scaling models, automating ML pipelines, and monitoring AI solutions.',
  price: 2000,          // $79 — PRACTICE tier
  priceVoucher: 20000,  // $200 — VOUCHER tier (covers Google Pro ML Engineer $200 exam fee)
  practiceItemSlugs: [
    'google-professional-ml-engineer-p1',
    'google-professional-ml-engineer-p2',
    'google-professional-ml-engineer-p3',
    'google-professional-ml-engineer-p4',
    'google-professional-ml-engineer-p5',
    'google-professional-ml-engineer-p6'
  ],
  voucherItemSlug: 'google-professional-ml-engineer-p1'
};

async function main() {
  // 1. Hide the 6 individual practice variants from the public catalog.
  const hideResult = await db.exam.updateMany({
    where: { slug: { in: [...BUNDLE.practiceItemSlugs] } },
    data: { published: false }
  });
  console.log(`✓ Unpublished ${hideResult.count}/${BUNDLE.practiceItemSlugs.length} Pro ML variants.`);

  // 2. Upsert the bundle row.
  const allSlugs = [...new Set([...BUNDLE.practiceItemSlugs, BUNDLE.voucherItemSlug])];
  const exams = await db.exam.findMany({
    where: { slug: { in: allSlugs } },
    select: { id: true, slug: true }
  });
  const examMap = Object.fromEntries(exams.map(e => [e.slug, e.id]));
  const missing = allSlugs.filter(s => !examMap[s]);
  if (missing.length > 0) throw new Error(`Missing exam slugs: ${missing.join(', ')}`);

  const bundle = await db.bundle.upsert({
    where: { slug: BUNDLE.slug },
    update: {
      title: BUNDLE.title,
      description: BUNDLE.description,
      price: BUNDLE.price,
      priceVoucher: BUNDLE.priceVoucher,
      published: true
    },
    create: {
      slug: BUNDLE.slug,
      title: BUNDLE.title,
      description: BUNDLE.description,
      price: BUNDLE.price,
      priceVoucher: BUNDLE.priceVoucher,
      published: true
    }
  });

  // 3. Replace bundle items so re-runs stay in sync.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  let position = 1;
  for (const slug of BUNDLE.practiceItemSlugs) {
    await db.bundleItem.create({
      data: { bundleId: bundle.id, examId: examMap[slug], tier: 'PRACTICE', position: position++ }
    });
  }
  await db.bundleItem.create({
    data: { bundleId: bundle.id, examId: examMap[BUNDLE.voucherItemSlug], tier: 'VOUCHER', position: position++ }
  });

  console.log(`✓ ${BUNDLE.slug} | ${BUNDLE.title} | Practice $${BUNDLE.price / 100} | Voucher $${BUNDLE.priceVoucher / 100} | ${BUNDLE.practiceItemSlugs.length + 1} items`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
