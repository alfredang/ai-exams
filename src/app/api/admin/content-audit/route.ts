import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * READ-ONLY content audit for any exam or vendor, run against whatever database
 * it is deployed to.
 *
 *   GET /api/admin/content-audit?vendor=google
 *   GET /api/admin/content-audit?slugPrefix=google-professional-ml-engineer
 *
 * WHY THIS EXISTS
 * ---------------
 * catalog-health reports COUNTS and state; it says nothing about what the
 * questions actually SAY. Every content decision so far has been sized against
 * a local database and then applied to production — and on 2026-07-17 that went
 * wrong in the expensive direction: local PMLE held 158 dump-sourced questions,
 * production held zero and had entirely different content, and a fix scoped from
 * local observations unpublished three healthy exams on a live bundle.
 *
 * The lesson is not "be careful", it is "measure the database you are about to
 * change". This endpoint is that instrument. It only reads.
 *
 * WHAT IT MEASURES (per exam)
 *  - provenance: question counts grouped by `generatedBy` tag and status
 *  - dumpSignature: the templated-explanation fingerprint of the third-party
 *    import (an answer restated, with no reasoning and a generic-only citation)
 *  - genericOnlyRefs: questions citing only a vendor landing page — the same
 *    smell, independent of the template
 *  - staleness: caller-supplied term counts, e.g. a superseded product name
 *  - lengthTell: how often the correct answer is STRICTLY the longest option.
 *    ~25% is chance for a 4-option question; high values mean a candidate can
 *    score by pattern-matching instead of knowing the material.
 *  - domainMix: actual distribution vs the exam's own stored blueprint, which
 *    matters because /api/attempts/start samples the bank at random with no
 *    domain awareness — so a skewed bank means every attempt is off-blueprint.
 */

type Opt = { id: string; text: string };
type Ref = { label: string; url: string };

const DUMP_SIGNATURE = 'best satisfies the requirements described in the scenario';

/** Terms worth counting for staleness. Extend via ?terms=a,b,c */
const DEFAULT_TERMS = ['Vertex AI', 'Agent Platform', 'Gemini Enterprise'];

export async function GET(req: Request) {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const u = new URL(req.url);
  const vendor = u.searchParams.get('vendor') ?? undefined;
  const slugPrefix = u.searchParams.get('slugPrefix') ?? undefined;
  const terms = (u.searchParams.get('terms')?.split(',').map((t) => t.trim()).filter(Boolean)) ?? DEFAULT_TERMS;

  if (!vendor && !slugPrefix) {
    return NextResponse.json({ error: 'pass ?vendor= or ?slugPrefix=' }, { status: 400 });
  }

  const exams = await db.exam.findMany({
    where: {
      ...(vendor ? { vendor: { slug: vendor } } : {}),
      ...(slugPrefix ? { slug: { startsWith: slugPrefix } } : {})
    },
    select: {
      slug: true, code: true, published: true, deletedAt: true, questionCount: true, domains: true,
      questions: {
        select: { stem: true, options: true, correct: true, explanation: true, references: true,
                  domain: true, type: true, status: true, generatedBy: true, isTeaser: true }
      }
    },
    orderBy: { slug: 'asc' }
  });

  const report = exams.map((e) => {
    const qs = e.questions;
    const pub = qs.filter((q) => q.status === 'PUBLISHED');
    const blobOf = (q: (typeof qs)[number]) =>
      [q.stem, q.explanation ?? '', ...((q.options as unknown as Opt[]) ?? []).map((o) => o?.text ?? '')].join(' ');

    const provenance: Record<string, { published: number; draft: number }> = {};
    for (const q of qs) {
      const k = q.generatedBy ?? '(none)';
      provenance[k] ??= { published: 0, draft: 0 };
      if (q.status === 'PUBLISHED') provenance[k].published++;
      else provenance[k].draft++;
    }

    const dumpSignature = qs.filter((q) => (q.explanation ?? '').includes(DUMP_SIGNATURE)).length;
    const genericOnlyRefs = qs.filter((q) => {
      const rs = (q.references as unknown as Ref[]) ?? [];
      return rs.length > 0 && rs.every((r) => /\/learn\/certification\/|\/certifications?\/?$/.test(r.url ?? ''));
    }).length;

    const staleness: Record<string, number> = {};
    for (const t of terms) {
      const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      staleness[t] = qs.filter((q) => re.test(blobOf(q))).length;
    }

    // Length tell — strictly longest only; a tie is not exploitable.
    const single = pub.filter((q) => q.type === 'SINGLE');
    let strictLongest = 0;
    for (const q of single) {
      const opts = (q.options as unknown as Opt[]) ?? [];
      const correct = (q.correct as unknown as string[]) ?? [];
      const key = opts.find((o) => correct.includes(o.id));
      const others = opts.filter((o) => !correct.includes(o.id)).map((o) => (o.text ?? '').length);
      if (!key || !others.length) continue;
      if ((key.text ?? '').length > Math.max(...others)) strictLongest++;
    }

    const declared = ((e.domains as unknown as { name: string; weight: number }[]) ?? []);
    const actual: Record<string, number> = {};
    for (const q of pub) actual[q.domain] = (actual[q.domain] ?? 0) + 1;
    const domainMix = declared.map((d) => ({
      domain: d.name,
      targetPct: d.weight,
      actualPct: pub.length ? Math.round(((actual[d.name] ?? 0) / pub.length) * 100) : 0,
      count: actual[d.name] ?? 0
    }));
    const orphanDomains = [...new Set(pub.map((q) => q.domain))].filter(
      (d) => !declared.some((x) => x.name === d)
    );

    return {
      slug: e.slug,
      code: e.code,
      published: e.published,
      archived: e.deletedAt != null,
      questionCount: e.questionCount,
      totals: { all: qs.length, published: pub.length, draft: qs.length - pub.length, teasers: qs.filter((q) => q.isTeaser).length },
      provenance,
      dumpSignature,
      genericOnlyRefs,
      staleness,
      lengthTell: {
        singleQuestions: single.length,
        correctIsStrictlyLongest: strictLongest,
        pct: single.length ? Math.round((strictLongest / single.length) * 100) : 0,
        chanceBaselinePct: 25
      },
      domainMix,
      orphanDomains
    };
  });

  const totals = {
    exams: report.length,
    publishedQuestions: report.reduce((s, r) => s + r.totals.published, 0),
    dumpSignature: report.reduce((s, r) => s + r.dumpSignature, 0),
    genericOnlyRefs: report.reduce((s, r) => s + r.genericOnlyRefs, 0)
  };

  return NextResponse.json({ scope: { vendor, slugPrefix, terms }, totals, exams: report });
}
