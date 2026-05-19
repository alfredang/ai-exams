/**
 * One-shot: upsert the "Microsoft Azure AI Fundamentals (AI-900)" bundle
 * that grants access to all 6 P1-P6 AI-900 practice exam variants.
 *
 *   npx tsx scripts/content/bundles/seed-ai-900-bundle.ts
 *
 * Idempotent — re-runs replace bundle items in place.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const BUNDLE = {
  slug: 'microsoft-ai-900',
  title: 'Microsoft Azure AI Fundamentals (AI-900)',
  description:
    'All 6 AI-900 practice exams in one bundle — 360 questions covering AI workloads, machine learning on Azure, computer vision, natural language processing, and generative AI. Save vs buying each practice exam separately.',
  price: 2000,         // $79 — PRACTICE tier
  priceVoucher: 9900, // $99 — VOUCHER tier (covers Microsoft AI-900 $99 exam fee)
  // Items keyed by purchase tier. Practice buyers get items[].tier==='PRACTICE'
  // only; Voucher buyers get all items (PRACTICE + VOUCHER). Fulfillment
  // logic enforces this in src/lib/fulfill.ts.
  practiceItemSlugs: [
    'microsoft-ai-900-p1',
    'microsoft-ai-900-p2',
    'microsoft-ai-900-p3',
    'microsoft-ai-900-p4',
    'microsoft-ai-900-p5',
    'microsoft-ai-900-p6'
  ],
  // The voucher is for the real Microsoft AI-900 cert. We attach it to P1
  // arbitrarily — the underlying voucher code is what the user redeems
  // with Microsoft, not the specific practice variant.
  voucherItemSlug: 'microsoft-ai-900-p1'
};

async function main() {
  const allSlugs = [...new Set([...BUNDLE.practiceItemSlugs, BUNDLE.voucherItemSlug])];
  const exams = await db.exam.findMany({
    where: { slug: { in: allSlugs } },
    select: { id: true, slug: true }
  });
  const examMap = Object.fromEntries(exams.map(e => [e.slug, e.id]));
  const missing = allSlugs.filter(s => !examMap[s]);
  if (missing.length > 0) {
    throw new Error(`Missing exam slugs: ${missing.join(', ')}`);
  }

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

  // Replace items so re-runs stay in sync with the source list.
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
