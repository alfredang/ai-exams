/**
 * One-shot: consolidate the 5 Microsoft Security Operations Analyst (SC-200)
 * practice exams (P1–P5) into a single bundle, hide the individual variants
 * from the public catalog.
 *
 *   npx tsx scripts/content/bundles/seed-sc-200-bundle.ts
 *
 * Idempotent.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const BUNDLE = {
  slug: 'microsoft-sc-200',
  title: 'Microsoft Security Operations Analyst (SC-200)',
  description:
    'All 5 SC-200 practice exams in one bundle — 300 questions covering threat mitigation with Microsoft Defender XDR, Microsoft Defender for Cloud, and Microsoft Sentinel, including incident response and KQL query authoring.',
  price: 2000,         // $69 — PRACTICE tier
  priceVoucher: 16500, // $165 — VOUCHER tier (adds real Microsoft SC-200 exam voucher)
  practiceItemSlugs: [
    'microsoft-sc-200-p1',
    'microsoft-sc-200-p2',
    'microsoft-sc-200-p3',
    'microsoft-sc-200-p4',
    'microsoft-sc-200-p5'
  ],
  voucherItemSlug: 'microsoft-sc-200-p1'
};

async function main() {
  // 1. Hide the 5 individual practice variants from the public catalog.
  const hideResult = await db.exam.updateMany({
    where: { slug: { in: [...BUNDLE.practiceItemSlugs] } },
    data: { published: false }
  });
  console.log(`✓ Unpublished ${hideResult.count}/${BUNDLE.practiceItemSlugs.length} SC-200 variants.`);

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
