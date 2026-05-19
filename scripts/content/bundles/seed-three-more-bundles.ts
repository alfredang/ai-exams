/**
 * One-shot: create 3 missing bundles (CompTIA Cloud+, Microsoft DP-203,
 * AWS MLA-C01), hide their variants from the public catalog.
 *
 *   npx tsx scripts/content/bundles/seed-three-more-bundles.ts
 *
 * These cert families used non-standard variant slug patterns
 * (-practice-N or mixed) so they were not picked up by the
 * multi-variant batch driver.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

type BundleSpec = {
  slug: string;
  title: string;
  description: string;
  price: number;
  priceVoucher: number;
  practiceSlugs: string[];
  voucherSlug: string;
};

const BUNDLES: BundleSpec[] = [
  {
    slug: 'comptia-cloud-plus',
    title: 'CompTIA Cloud+',
    description: 'All 5 CompTIA Cloud+ (CV0-004) practice exams in one bundle — covering cloud architecture & design, deployment, operations & support, and troubleshooting.',
    price: 2000,
    priceVoucher: 36900, // matches CompTIA Cloud+ vendor exam fee
    practiceSlugs: [
      'comptia-cloud-plus-practice-1',
      'comptia-cloud-plus-practice-5',
      'comptia-cloud-plus-practice-6',
      'comptia-cloud-plus-practice-7',
      'comptia-cloud-plus-practice-8'
    ],
    voucherSlug: 'comptia-cloud-plus-practice-1'
  },
  {
    slug: 'microsoft-dp-203',
    title: 'Microsoft Azure Data Engineer Associate (DP-203)',
    description: 'All 2 DP-203 practice exams in one bundle — covering designing & implementing data storage, data processing, security, monitoring, and optimization for Azure data engineering workloads.',
    price: 2000,
    priceVoucher: 16500, // matches Microsoft Associate role-based vendor exam fee
    practiceSlugs: [
      'microsoft-dp-203-p1',
      'microsoft-dp-203-practice-6'
    ],
    voucherSlug: 'microsoft-dp-203-p1'
  },
  {
    slug: 'aws-mla-c01',
    title: 'AWS Certified Machine Learning Engineer — Associate',
    description: 'All AWS Certified ML Engineer Associate (MLA-C01) practice exams in one bundle — covering data preparation for ML, ML model development, deployment & orchestration, and ML solution monitoring & maintenance.',
    price: 2000,
    priceVoucher: 15000, // matches AWS Associate vendor exam fee
    practiceSlugs: [
      'aws-mla-c01',     // base shell (60q from fill scripts)
      'aws-mla-c01-p1'   // P1 variant (60q from PDF parser)
    ],
    voucherSlug: 'aws-mla-c01'
  }
];

async function processBundle(b: BundleSpec) {
  const allSlugs = [...new Set([...b.practiceSlugs, b.voucherSlug])];
  const exams = await db.exam.findMany({
    where: { slug: { in: allSlugs } },
    select: { id: true, slug: true }
  });
  const examMap = Object.fromEntries(exams.map(e => [e.slug, e.id]));
  const missing = allSlugs.filter(s => !examMap[s]);
  if (missing.length > 0) {
    console.log(`  ✗ ${b.slug}: missing exam slugs: ${missing.join(', ')} — skipping`);
    return;
  }

  // Hide variants from the public catalog.
  const hideResult = await db.exam.updateMany({
    where: { slug: { in: b.practiceSlugs } },
    data: { published: false }
  });

  // Upsert bundle.
  const bundle = await db.bundle.upsert({
    where: { slug: b.slug },
    update: {
      title: b.title,
      description: b.description,
      price: b.price,
      priceVoucher: b.priceVoucher,
      published: true
    },
    create: {
      slug: b.slug,
      title: b.title,
      description: b.description,
      price: b.price,
      priceVoucher: b.priceVoucher,
      published: true
    }
  });

  // Rewrite items.
  await db.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
  let position = 1;
  for (const slug of b.practiceSlugs) {
    await db.bundleItem.create({
      data: { bundleId: bundle.id, examId: examMap[slug], tier: 'PRACTICE', position: position++ }
    });
  }
  await db.bundleItem.create({
    data: { bundleId: bundle.id, examId: examMap[b.voucherSlug], tier: 'VOUCHER', position: position++ }
  });

  console.log(`  ✓ ${b.slug.padEnd(28)} | ${hideResult.count} variants hidden | Practice $${b.price/100} | Voucher $${b.priceVoucher/100}`);
}

async function main() {
  console.log(`Processing ${BUNDLES.length} additional bundles...\n`);
  for (const b of BUNDLES) await processBundle(b);
  console.log('\n✓ All 3 bundles processed.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
