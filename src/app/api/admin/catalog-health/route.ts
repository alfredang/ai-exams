import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Read-only catalog health check for any vendor.
 *
 *   GET /api/admin/catalog-health?vendor=aws
 *
 * Generalised from the microsoft-health endpoint. For each exam under
 * the requested vendor it reports identity, state, question counts
 * (stored field vs actual PUBLISHED vs DRAFT), blueprint weight sum,
 * and per-exam anomaly flags. Also lists the vendor's bundles and item
 * wiring. Pure reads — no writes.
 *
 * Anomaly flags:
 *   - domain weights not summing to 100
 *   - published exam with 0 published questions (empty product)
 *   - thin: published, 1–49 published questions
 *   - questionCount field disagrees with actual published count
 *   - archived AND published=true (inconsistent state)
 */

type ExamHealth = {
  slug: string;
  code: string;
  title: string;
  level: string;
  published: boolean;
  archived: boolean;
  questionCountField: number;
  publishedQuestions: number;
  draftQuestions: number;
  domainWeightSum: number;
  domains: { name: string; weight: number }[];
  flags: string[];
};

export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const vendorSlug = req.nextUrl.searchParams.get('vendor');
  if (!vendorSlug) {
    return NextResponse.json({ error: 'missing required ?vendor=<slug> query param' }, { status: 400 });
  }

  const vendor = await db.vendor.findUnique({ where: { slug: vendorSlug } });
  if (!vendor) {
    return NextResponse.json({ error: `vendor '${vendorSlug}' not found` }, { status: 404 });
  }

  const exams = await db.exam.findMany({
    where: { vendorId: vendor.id },
    orderBy: { slug: 'asc' }
  });

  const grp = await db.question.groupBy({
    by: ['examId', 'status'],
    where: { examId: { in: exams.map(e => e.id) } },
    _count: { _all: true }
  });
  const pub = new Map<string, number>();
  const draft = new Map<string, number>();
  for (const r of grp) {
    if (r.status === 'PUBLISHED') pub.set(r.examId, r._count._all);
    else if (r.status === 'DRAFT') draft.set(r.examId, (draft.get(r.examId) || 0) + r._count._all);
  }

  const health: ExamHealth[] = exams.map(e => {
    const domains = Array.isArray(e.domains) ? (e.domains as { name: string; weight: number }[]) : [];
    const weightSum = domains.reduce((s, d) => s + (Number(d.weight) || 0), 0);
    const publishedQuestions = pub.get(e.id) || 0;
    const draftQuestions = draft.get(e.id) || 0;
    const archived = e.deletedAt != null;
    const flags: string[] = [];

    // Tolerance, not equality: some vendors publish fractional domain weights
    // (Anthropic's CCDV-F blueprint is 14.7/33.1/3.1/... ), and summing those
    // in binary floating point lands on 99.99999999999999 — which is a correct
    // blueprint, not a defect. 0.01 still catches a genuinely wrong sum.
    if (domains.length > 0 && Math.abs(weightSum - 100) > 0.01) {
      flags.push(`domain weights sum to ${Number(weightSum.toFixed(2))}, not 100`);
    }
    if (e.published && !archived && publishedQuestions === 0) flags.push('published but has 0 published questions');
    if (e.published && !archived && publishedQuestions > 0 && publishedQuestions < 50) flags.push(`thin: only ${publishedQuestions} published questions`);
    if (!archived && e.questionCount !== publishedQuestions && publishedQuestions > 0) {
      flags.push(`questionCount field (${e.questionCount}) != actual published (${publishedQuestions})`);
    }
    if (e.published && archived) flags.push('archived AND published=true (inconsistent state)');

    return {
      slug: e.slug,
      code: e.code,
      title: e.title,
      level: e.level,
      published: e.published,
      archived,
      questionCountField: e.questionCount,
      publishedQuestions,
      draftQuestions,
      domainWeightSum: weightSum,
      domains,
      flags
    };
  });

  const bundles = await db.bundle.findMany({
    where: { items: { some: { exam: { vendorId: vendor.id } } } },
    include: { items: { orderBy: { position: 'asc' }, include: { exam: { select: { slug: true } } } } },
    orderBy: { slug: 'asc' }
  });
  const bundleReport = bundles.map(b => ({
    slug: b.slug,
    title: b.title,
    published: b.published,
    items: b.items.map(it => ({ examSlug: it.exam.slug, tier: it.tier, position: it.position }))
  }));

  const withFlags = health.filter(h => h.flags.length > 0);
  const summary = {
    totalExams: health.length,
    active: health.filter(h => h.published && !h.archived).length,
    inactive: health.filter(h => !h.published && !h.archived).length,
    archived: health.filter(h => h.archived).length,
    examsWithFlags: withFlags.length,
    totalBundles: bundleReport.length
  };

  return NextResponse.json({ vendor: vendorSlug, summary, exams: health, bundles: bundleReport });
}
