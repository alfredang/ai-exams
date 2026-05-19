/**
 * One-shot: consolidate the 3 Professional Scrum Master I (PSM I) practice
 * exams (P1, P5, P6) into a single "Professional Scrum Master I (PSM I)"
 * bundle, and hide the individual variants from the public catalog.
 *
 *   npx tsx scripts/content/bundles/seed-psm-i-bundle.ts
 *
 * Idempotent — safe to re-run.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const BUNDLE = {
  slug: 'scrum-org-psm-i',
  title: 'Professional Scrum Master I (PSM I)',
  description:
    'All 3 Professional Scrum Master I practice exams in one bundle — covering Scrum framework theory, accountabilities (Product Owner, Scrum Master, Developers), events, artifacts, Scrum values, empiricism, self-management, and scaling.',
  price: 2000,        // $39 — PRACTICE tier
  priceVoucher: 22900, // $229 — VOUCHER tier (covers Scrum.org PSM I $200 fee + margin)
  practiceItemSlugs: [
    'scrum-org-psm-i-p1',
    'scrum-org-psm-i-p5',
    'scrum-org-psm-i-p6'
  ],
  // Voucher attached to P1 arbitrarily — the voucher is for the real Scrum.org
  // PSM I assessment, not any specific practice variant.
  voucherItemSlug: 'scrum-org-psm-i-p1'
};

const RENAMES: { code: string; title: string }[] = [
  { code: 'PSM-I-P1', title: 'Professional Scrum Master I (PSM I) — Practice Exam 1' },
  { code: 'PSM-I-P5', title: 'Professional Scrum Master I (PSM I) — Practice Exam 5' }
];

async function main() {
  // 1. Rename P1 / P5 to match the cleaner em-dash format.
  for (const r of RENAMES) {
    const upd = await db.exam.updateMany({ where: { code: r.code }, data: { title: r.title } });
    console.log(`✓ Renamed ${r.code}: ${upd.count} row(s) → "${r.title}"`);
  }

  // 2. Hide the 3 individual practice variants from the public catalog.
  const hideResult = await db.exam.updateMany({
    where: { slug: { in: [...BUNDLE.practiceItemSlugs] } },
    data: { published: false }
  });
  console.log(`✓ Unpublished ${hideResult.count}/${BUNDLE.practiceItemSlugs.length} PSM-I variants.`);

  // 3. Upsert the bundle row.
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

  // 4. Replace bundle items so re-runs stay in sync.
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
