/**
 * Folds each certification's "Practice Exam 1…N" variants into ONE practice
 * exam that owns the whole question pool. Runs from prisma/seed.ts on every
 * deploy, so it must stay idempotent:
 *
 *   - variants get `poolExamId = <pool exam>` and are unpublished (rows are
 *     kept so old attempts, orders and entitlements still resolve);
 *   - questions on any variant move to the pool exam — this also re-folds
 *     questions a legacy per-variant seed module recreates on a variant;
 *   - exact duplicate stems inside the pool are ARCHIVED (never deleted);
 *   - legacy domain labels are relabelled to the blueprint's names;
 *   - the official blueprint weights are applied when they are newer than
 *     the exam's `domainsVerifiedAt` (so an admin edit survives until the
 *     next official re-check).
 *
 * Imported by prisma/seed.ts — keep imports relative and edge-free.
 */
import type { PrismaClient } from '@prisma/client';
import { EXAM_BLUEPRINTS } from './exam-blueprints';
import { domainKey, matchDomain, parseDomains } from './question-pool';

export type PoolPlan = {
  bundleSlug: string;
  bundleTitle: string;
  poolExamSlug: string;
  variantSlugs: string[];
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
// Same stem AND same option texts — a shared generic stem with different
// options is a different question.
const questionKey = (stem: string, options: unknown) =>
  [norm(stem), ...(Array.isArray(options) ? options.map((o: any) => norm(String(o?.text ?? ''))).sort() : [])].join('|');

export async function consolidateExamPools(db: PrismaClient, plans: PoolPlan[]) {
  const totals = { variants: 0, moved: 0, archived: 0, relabelled: 0, blueprints: 0 };
  for (const plan of plans) {
    const pool = await db.exam.findUnique({ where: { slug: plan.poolExamSlug } });
    if (!pool) continue;
    if (pool.poolExamId) await db.exam.update({ where: { id: pool.id }, data: { poolExamId: null } });

    const listed = plan.variantSlugs.filter((s) => s !== pool.slug);
    if (listed.length > 0) {
      const r = await db.exam.updateMany({
        where: { slug: { in: listed }, OR: [{ poolExamId: null }, { poolExamId: { not: pool.id } }, { published: true }] },
        data: { poolExamId: pool.id, published: false }
      });
      totals.variants += r.count;
    }
    const variantIds = (await db.exam.findMany({ where: { poolExamId: pool.id }, select: { id: true } })).map((v) => v.id);

    if (variantIds.length > 0) {
      const moved = await db.question.updateMany({ where: { examId: { in: variantIds } }, data: { examId: pool.id } });
      totals.moved += moved.count;
      // Reviews follow the pool so the product page shows them; skip a
      // learner who already reviewed the pool exam (unique userId+examId).
      const reviews = await db.review.findMany({ where: { examId: { in: variantIds } }, select: { id: true, userId: true } });
      for (const r of reviews) {
        const clash = await db.review.findFirst({ where: { examId: pool.id, userId: r.userId }, select: { id: true } });
        if (!clash) await db.review.update({ where: { id: r.id }, data: { examId: pool.id } });
      }
    }

    // Official blueprint (domain %), applied only when newer than what's stored.
    const bp = EXAM_BLUEPRINTS[plan.bundleSlug];
    let domains = parseDomains(pool.domains);
    if (bp?.domains && bp.verifiedAt) {
      const verifiedAt = new Date(bp.verifiedAt);
      // Re-apply when the official check is newer, or when it is the latest
      // word but a legacy seed module has since rewritten the weights. An
      // admin save stamps a later domainsVerifiedAt and is left alone.
      const stale = !pool.domainsVerifiedAt || pool.domainsVerifiedAt < verifiedAt;
      const drifted = pool.domainsVerifiedAt?.getTime() === verifiedAt.getTime()
        && JSON.stringify(parseDomains(pool.domains)) !== JSON.stringify(bp.domains);
      if (stale || drifted) {
        domains = bp.domains;
        await db.exam.update({
          where: { id: pool.id },
          data: { domains: bp.domains, domainsSourceUrl: bp.sourceUrl ?? null, domainsVerifiedAt: verifiedAt }
        });
        totals.blueprints++;
      }
    }

    // Relabel legacy domain strings onto blueprint names.
    const aliases = bp?.aliases ?? {};
    const labels = await db.question.groupBy({ by: ['domain'], where: { examId: pool.id } });
    for (const { domain } of labels) {
      const target = aliases[domain]
        ?? Object.entries(aliases).find(([k]) => domainKey(k) === domainKey(domain))?.[1]
        ?? matchDomain(domain, domains);
      if (target && target !== domain) {
        const r = await db.question.updateMany({ where: { examId: pool.id, domain }, data: { domain: target } });
        totals.relabelled += r.count;
      }
    }

    // Archive exact duplicates the variants brought in (keep the oldest).
    const published = await db.question.findMany({
      where: { examId: pool.id, status: 'PUBLISHED' },
      select: { id: true, stem: true, options: true },
      orderBy: { createdAt: 'asc' }
    });
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const q of published) {
      const k = questionKey(q.stem, q.options);
      if (seen.has(k)) dupes.push(q.id);
      else seen.add(k);
    }
    if (dupes.length > 0) {
      const r = await db.question.updateMany({ where: { id: { in: dupes } }, data: { status: 'ARCHIVED' } });
      totals.archived += r.count;
    }

    // The pool exam IS the product's practice exam — drop the "Practice Exam 1" naming.
    const code = pool.code.replace(/-P\d+$/i, '');
    if (pool.title !== plan.bundleTitle || pool.label !== 'Practice Exam' || pool.code !== code) {
      await db.exam.update({ where: { id: pool.id }, data: { title: plan.bundleTitle, label: 'Practice Exam', code } });
    }
  }
  return totals;
}

/**
 * Re-fold every published product from what is in the database. The
 * per-certification seed modules (src/lib/seed/*) still write their legacy
 * "Practice Exam 1…N" variants and multi-item bundles; each /api/admin/seed-*
 * endpoint calls this afterwards so the product is back to one practice exam
 * without waiting for the next deploy.
 */
export async function refoldProductPools(db: PrismaClient) {
  const products = await db.bundle.findMany({
    where: { published: true },
    include: { items: { orderBy: { position: 'asc' }, include: { exam: { select: { slug: true } } } } }
  });
  const plans: PoolPlan[] = [];
  for (const b of products) {
    const practice = b.items.filter((i) => i.tier === 'PRACTICE');
    if (practice.length === 0) continue;
    const pool = practice[0];
    const hasVoucher = b.items.some((i) => i.tier === 'VOUCHER');
    const single = practice.length === 1 && b.items.every((i) => i.examId === pool.examId);
    if (!single) {
      await db.bundleItem.deleteMany({ where: { bundleId: b.id } });
      await db.bundleItem.create({ data: { bundleId: b.id, examId: pool.examId, tier: 'PRACTICE', position: 1 } });
      if (hasVoucher) await db.bundleItem.create({ data: { bundleId: b.id, examId: pool.examId, tier: 'VOUCHER', position: 2 } });
    }
    plans.push({
      bundleSlug: b.slug,
      bundleTitle: b.title,
      poolExamSlug: pool.exam.slug,
      variantSlugs: [...new Set([...practice.slice(1).map((i) => i.exam.slug), b.slug])].filter((s) => s !== pool.exam.slug)
    });
  }
  return consolidateExamPools(db, plans);
}
