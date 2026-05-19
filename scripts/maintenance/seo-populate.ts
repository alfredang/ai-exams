/**
 * Backfill SEO meta (metaTitle / metaDescription / metaKeywords) for every
 * active exam that's missing one. Uses lib/seo-assist.ts which calls
 * Claude via the Claude Agent SDK.
 *
 *   npx tsx scripts/maintenance/seo-populate.ts          # process all missing
 *   npx tsx scripts/maintenance/seo-populate.ts AZ-900   # specific exam by code
 *   npx tsx scripts/maintenance/seo-populate.ts --force  # regenerate even if present
 */
import { db } from '@/lib/db';
import { generateSeoForExam } from '@/lib/seo-assist';

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const codeFilter = args.find((a) => !a.startsWith('--'));

  const where: any = { deletedAt: null };
  if (codeFilter) where.code = codeFilter;
  else if (!force) where.metaTitle = null;

  const exams = await db.exam.findMany({
    where,
    include: { vendor: true },
    orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }]
  });

  console.log(`Will process ${exams.length} exam${exams.length === 1 ? '' : 's'}.`);
  let ok = 0;
  let fail = 0;
  for (const e of exams) {
    process.stdout.write(`[${e.vendor.name}] ${e.code.padEnd(14)} … `);
    try {
      const seo = await generateSeoForExam({
        vendor: e.vendor.name,
        code: e.code,
        title: e.title,
        description: e.description,
        domains: (e.domains as any[]) || []
      });
      await db.exam.update({
        where: { id: e.id },
        data: { metaTitle: seo.title, metaDescription: seo.description, metaKeywords: seo.keywords }
      });
      console.log(`OK  ${seo.title.slice(0, 50)}`);
      ok++;
    } catch (err: any) {
      console.log(`FAIL  ${err?.message ?? err}`);
      fail++;
    }
  }
  console.log(`\nDone. ok=${ok} fail=${fail} skipped=${0}`);
  await db.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
