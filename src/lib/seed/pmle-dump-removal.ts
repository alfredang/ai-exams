/**
 * Remove the dump-sourced questions from the Google Professional ML Engineer
 * (PMLE) bank, and retire the variants that removal leaves unusable.
 *
 * WHY
 * ---
 * A batch of PMLE questions was imported from a third-party exam dump. They are
 * identifiable by a content signature that no hand-authored question has: every
 * "explanation" is the same mechanical template —
 *
 *   "The correct choice is: <answer>. This option best satisfies the
 *    requirements described in the scenario, whereas the alternatives (...)"
 *
 * — and every one cites the same generic certification landing page rather than
 * a document that supports the answer. That combination is the fingerprint of
 * having an answer key without the reasoning: you can restate the key, but you
 * cannot explain it or cite it. Publishing them is both an IP problem and a
 * product problem (see the project's no-dumps rule).
 *
 * WHY REMOVAL AND NOT RE-GROUNDING (yet)
 * --------------------------------------
 * Google reissued this exam guide effective 2026-06-01 and moved the platform
 * from **Vertex AI** to **Gemini Enterprise Agent Platform** (announced
 * 2026-04-22 at Cloud Next '26; the rename is documented on the vendor's own
 * name-changes page and release notes — the old Vertex AI docs still resolve,
 * so this is a rename with redirects, not a removal). The blueprint weights
 * moved with it: 12/16/18/19/21/14 → 13/16/21/20/18/13. So the whole
 * bank is stale, not just the dumps — re-grounding a dump question onto Vertex
 * AI terminology would produce a correct-looking question about a platform the
 * exam no longer tests. Authoring replacements needs a research pass against
 * the new docs first. This module does the part that is unambiguous and urgent:
 * take the dumps down.
 *
 * WHAT IT DOES
 * ------------
 *  1. Deletes every question carrying the dump signature, catalog-wide — not
 *     just under PMLE. One had already leaked into a Google ACE variant, so
 *     scoping this to PMLE would have left it behind.
 *  2. Drops any PMLE variant left below a usable question count out of the
 *     bundle and unpublishes it. Removal guts P4-P6 (they were mostly dump),
 *     while P1-P3 keep a bank comfortably above their 60-question attempt
 *     length. Unpublishing rather than deleting is deliberate: the exam route
 *     allows `published OR entitled`, so anyone who already bought the bundle
 *     keeps access to what they paid for, while the catalog and sitemap stop
 *     offering it.
 *  3. Restores each surviving exam's teaser pool, since deleted dumps may have
 *     been flagged as teasers.
 *
 * Idempotent: signature-matched rows are gone after the first run, so a second
 * run reports 0 removed and changes nothing.
 *
 * Exported so the same code path is reachable from the protected admin API
 * (`/api/admin/fix-pmle-dumps`) — production has no container shell.
 */
import { PrismaClient } from '@prisma/client';

type Opt = { id: string; text: string };

/**
 * The dump fingerprint. Matched against the EXPLANATION only: the stems were
 * lifted from the real exam and share no reliable wording, but every imported
 * row carries this generated boilerplate. Deliberately narrow — it must never
 * match a hand-authored explanation.
 */
const DUMP_EXPLANATION_RE = /best satisfies the requirements described in the scenario/i;

/**
 * The variants to retire, named explicitly rather than derived from a count.
 *
 * These three were built almost entirely from the dump (50/47/31 of 60 each),
 * so removal leaves them with ~10-29 questions against a 60-question attempt.
 * P1-P3 survive removal with a usable bank and stay in the bundle.
 *
 * An earlier version computed this from a "fewer than 60 published questions"
 * threshold and retired ALL SIX — because removal also drops P1-P3 to 49-51
 * published (the rest of their bank sits in DRAFT). Retiring a product is a
 * decision, not something to infer from a magic number, so it is a list.
 */
const RETIRE_SLUGS = [
  'google-professional-ml-engineer-p4',
  'google-professional-ml-engineer-p5',
  'google-professional-ml-engineer-p6'
];

const PMLE_BUNDLE_SLUG = 'google-professional-ml-engineer';
const PMLE_SLUG_PREFIX = 'google-professional-ml-engineer-p';

export type PmleDumpRemovalResult = {
  scanned: number;
  removed: number;
  removedByExam: Record<string, number>;
  retiredVariants: string[];
  bundleItemsRemoved: number;
  questionCountAdjusted: Record<string, { from: number; to: number }>;
  perExam: Record<string, { total: number; teasers: number; published: boolean; questionCount: number }>;
};

export async function removePmleDumps(db: PrismaClient): Promise<PmleDumpRemovalResult> {
  const result: PmleDumpRemovalResult = {
    scanned: 0,
    removed: 0,
    removedByExam: {},
    retiredVariants: [],
    bundleItemsRemoved: 0,
    questionCountAdjusted: {},
    perExam: {}
  };

  // ── 1. Delete dump-signature questions catalog-wide ──────────────────────
  // Catalog-wide on purpose: the signature is specific enough to be safe, and
  // scoping it to PMLE would miss rows that leaked into other exams.
  const candidates = await db.question.findMany({
    where: { explanation: { contains: 'best satisfies the requirements described in the scenario' } },
    select: { id: true, explanation: true, exam: { select: { slug: true } } }
  });
  result.scanned = candidates.length;

  const doomed = candidates.filter((q) => DUMP_EXPLANATION_RE.test(q.explanation ?? ''));
  for (const q of doomed) {
    result.removedByExam[q.exam.slug] = (result.removedByExam[q.exam.slug] ?? 0) + 1;
  }
  if (doomed.length) {
    const del = await db.question.deleteMany({ where: { id: { in: doomed.map((q) => q.id) } } });
    result.removed = del.count;
  }

  // ── 2. Retire PMLE variants that removal left unusable ───────────────────
  const variants = await db.exam.findMany({
    where: { slug: { startsWith: PMLE_SLUG_PREFIX } },
    select: { id: true, slug: true, published: true }
  });

  const bundle = await db.bundle.findUnique({
    where: { slug: PMLE_BUNDLE_SLUG },
    select: { id: true }
  });

  for (const v of variants) {
    if (!RETIRE_SLUGS.includes(v.slug)) continue;

    result.retiredVariants.push(v.slug);

    // Drop it from the bundle so new buyers are not sold a gutted variant.
    // Existing entitlements are untouched — they are rows on Entitlement, not
    // BundleItem, so prior buyers keep access via `published OR entitled`.
    if (bundle) {
      const removed = await db.bundleItem.deleteMany({ where: { bundleId: bundle.id, examId: v.id } });
      result.bundleItemsRemoved += removed.count;
    }

    // Unpublish so it leaves the catalog and the sitemap. NOT deleted, and not
    // soft-deleted: entitled users must keep what they bought.
    if (v.published) {
      await db.exam.update({ where: { id: v.id }, data: { published: false } });
    }
  }

  // ── 3. Restore teasers + report ──────────────────────────────────────────
  // Deleted dumps may have been carrying the isTeaser flag, leaving a surviving
  // exam short of its free-preview pool. seed.ts tops teasers up to 10 on every
  // deploy, but only for published exams — do it here so the state is correct
  // immediately rather than after the next deploy.
  const TEASER_TARGET = 10;
  for (const v of variants) {
    const [total, teasers, published] = await Promise.all([
      db.question.count({ where: { examId: v.id, status: 'PUBLISHED' } }),
      db.question.count({ where: { examId: v.id, status: 'PUBLISHED', isTeaser: true } }),
      db.exam.findUnique({ where: { id: v.id }, select: { published: true } }).then((e) => !!e?.published)
    ]);

    if (published && teasers < TEASER_TARGET && total > 0) {
      const need = Math.min(TEASER_TARGET - teasers, total - teasers);
      const fill = await db.question.findMany({
        where: { examId: v.id, status: 'PUBLISHED', isTeaser: false },
        select: { id: true },
        take: need
      });
      if (fill.length) {
        await db.question.updateMany({
          where: { id: { in: fill.map((q) => q.id) } },
          data: { isTeaser: true }
        });
      }
    }

    const [finalTotal, finalTeasers] = await Promise.all([
      db.question.count({ where: { examId: v.id, status: 'PUBLISHED' } }),
      db.question.count({ where: { examId: v.id, status: 'PUBLISHED', isTeaser: true } })
    ]);

    // ── 4. Keep questionCount honest ─────────────────────────────────────
    // `questionCount` is the advertised attempt length: the bundle page prints
    // it ("N unique questions across all sets") and /api/attempts/start slices
    // the bank to it. Removing the dumps drops P1-P3 to ~50 published, so
    // leaving questionCount at 60 would advertise 180 questions and serve 151.
    // An attempt would silently be 51 questions long, not 60.
    //
    // Clamp it to what actually exists. It is create-only in prisma/seed.ts's
    // upsert (prod admins own this field), so only this module can correct it.
    const exam = await db.exam.findUnique({ where: { id: v.id }, select: { questionCount: true } });
    if (exam && published && finalTotal > 0 && exam.questionCount > finalTotal) {
      await db.exam.update({ where: { id: v.id }, data: { questionCount: finalTotal } });
      result.questionCountAdjusted[v.slug] = { from: exam.questionCount, to: finalTotal };
    }

    const after = await db.exam.findUnique({ where: { id: v.id }, select: { questionCount: true } });
    result.perExam[v.slug] = {
      total: finalTotal,
      teasers: finalTeasers,
      published,
      questionCount: after?.questionCount ?? 0
    };
  }

  return result;
}
