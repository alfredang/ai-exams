/**
 * One-shot DB patch: ensure every exam has exactly 10 PUBLISHED questions
 * flagged as `isTeaser=true`. Idempotent — safe to re-run.
 *
 *   npx tsx scripts/maintenance/fix-teasers-to-ten.ts
 *
 * Per-exam behaviour:
 *   - teasers == 10 → no-op
 *   - teasers  >  10 → DEMOTE the surplus (oldest demoted last, so the most
 *     recently flagged ones stay teasers). Disabled by default — set
 *     `DEMOTE_SURPLUS = true` if you want it.
 *   - teasers  <  10 and exam has ≥ 10 published questions → PROMOTE the
 *     oldest non-teaser published questions up to 10 total.
 *   - exam has < 10 published questions → SKIP and warn (cannot reach 10
 *     without making every question a teaser).
 *
 * Selection order: createdAt asc, id asc — stable across runs.
 */
import { PrismaClient, QStatus } from '@prisma/client';

const db = new PrismaClient();

const TARGET = 10;
const DEMOTE_SURPLUS = false;

async function main() {
  const exams = await db.exam.findMany({
    select: { id: true, slug: true, title: true, published: true },
    orderBy: { slug: 'asc' }
  });

  let okCount = 0;
  let promotedCount = 0;
  let demotedCount = 0;
  let skippedCount = 0;

  for (const exam of exams) {
    const published = await db.question.count({
      where: { examId: exam.id, status: QStatus.PUBLISHED }
    });
    const teasers = await db.question.count({
      where: { examId: exam.id, status: QStatus.PUBLISHED, isTeaser: true }
    });
    const status = exam.published ? 'pub' : 'hid';

    if (teasers === TARGET) {
      okCount++;
      continue;
    }

    if (teasers > TARGET) {
      if (!DEMOTE_SURPLUS) {
        console.log(`  ~ ${exam.slug} [${status}]: ${teasers} teasers (over target ${TARGET}) — leaving as-is`);
        continue;
      }
      const surplus = teasers - TARGET;
      const toDemote = await db.question.findMany({
        where: { examId: exam.id, status: QStatus.PUBLISHED, isTeaser: true },
        select: { id: true },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        take: surplus
      });
      await db.question.updateMany({
        where: { id: { in: toDemote.map(q => q.id) } },
        data: { isTeaser: false }
      });
      demotedCount += toDemote.length;
      console.log(`  ↓ ${exam.slug} [${status}]: demoted ${toDemote.length} (${teasers} → ${TARGET})`);
      continue;
    }

    // teasers < TARGET
    if (published < TARGET) {
      console.log(`  ⚠ ${exam.slug} [${status}]: only ${published} published Qs (< ${TARGET}) — skipping`);
      skippedCount++;
      continue;
    }

    const need = TARGET - teasers;
    const toPromote = await db.question.findMany({
      where: { examId: exam.id, status: QStatus.PUBLISHED, isTeaser: false },
      select: { id: true },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: need
    });
    if (toPromote.length < need) {
      console.log(`  ⚠ ${exam.slug} [${status}]: needed ${need} promotions but only ${toPromote.length} non-teaser candidates — partial`);
    }
    await db.question.updateMany({
      where: { id: { in: toPromote.map(q => q.id) } },
      data: { isTeaser: true }
    });
    promotedCount += toPromote.length;
    console.log(`  ↑ ${exam.slug} [${status}]: promoted ${toPromote.length} (${teasers} → ${teasers + toPromote.length})`);
  }

  console.log('');
  console.log(`Summary: ${exams.length} exams scanned`);
  console.log(`  - already at ${TARGET}: ${okCount}`);
  console.log(`  - promoted: ${promotedCount} questions across exams`);
  if (DEMOTE_SURPLUS) {
    console.log(`  - demoted: ${demotedCount} questions across exams`);
  }
  console.log(`  - skipped (< ${TARGET} published Qs): ${skippedCount} exams`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
