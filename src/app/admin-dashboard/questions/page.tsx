import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { aiProviders, providerChainLabel } from '@/lib/openai';
import { examBaseTitle } from '@/lib/exam-title';
import { matchDomain, parseDomains } from '@/lib/question-pool';
import { QuestionReviewFlow } from '@/components/admin/question-review-flow';
import { AiGenerateDialog, type GeneratorExam } from '@/components/admin/ai-question-generator';

export const dynamic = 'force-dynamic';

/**
 * AI Question Generator: pick an exam, exam domain, question type and number
 * of questions in the AI Generate pop-up; the AI provider chain writes them as
 * drafts into that question bank's review queue
 * (/admin-dashboard/exams/[id]#review). `?exam=<id>` opens the pop-up on that exam.
 */
export default async function AiQuestionGeneratorPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const sp = await searchParams;

  // Pool exams only — retired variants (poolExamId set) never get new questions.
  const [exams, counts, providers] = await Promise.all([
    db.exam.findMany({
      where: { poolExamId: null },
      select: { id: true, code: true, title: true, domains: true, vendor: { select: { name: true } } },
      orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }]
    }),
    db.question.groupBy({ by: ['examId', 'domain', 'status'], where: { status: { in: ['PUBLISHED', 'DRAFT'] } }, _count: { _all: true } }),
    aiProviders()
  ]);

  const rows: GeneratorExam[] = exams.map((e) => {
    const blueprint = parseDomains(e.domains);
    const mine = counts.filter((c) => c.examId === e.id);
    const pool = new Map<string, number>();
    for (const c of mine) {
      if (c.status !== 'PUBLISHED') continue;
      const name = matchDomain(c.domain, blueprint);
      if (name) pool.set(name, (pool.get(name) ?? 0) + c._count._all);
    }
    return {
      id: e.id,
      code: e.code,
      title: examBaseTitle(e.title),
      vendor: e.vendor.name,
      drafts: mine.filter((c) => c.status === 'DRAFT').reduce((s, c) => s + c._count._all, 0),
      domains: blueprint.map((d) => ({ name: d.name, weight: d.weight, pool: pool.get(d.name) ?? 0 }))
    };
  });
  const totalDrafts = rows.reduce((s, r) => s + r.drafts, 0);
  const poolIds = new Set(rows.map((r) => r.id));
  const totalPublished = counts
    .filter((c) => c.status === 'PUBLISHED' && poolIds.has(c.examId))
    .reduce((s, c) => s + c._count._all, 0);
  const withDrafts = rows.filter((r) => r.drafts > 0).sort((a, b) => b.drafts - a.drafts);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          AI Question Generator
        </h1>
        <p className="text-sm text-slate-500">
          Click AI Generate, then choose the exam, number of questions, question types and exam domains. AI writes them as drafts; you
          review each one in that question bank, and only approved questions join its pool. Certification not listed?{' '}
          <Link href="/admin-dashboard/exams/new" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            + Create Practice Exam
          </Link>{' '}
          first — it creates the question bank that AI then fills.
        </p>
      </div>

      <QuestionReviewFlow
        awaiting={totalDrafts}
        published={totalPublished}
        reviewHref="#awaiting"
        generate={
          <AiGenerateDialog
            exams={rows}
            initialExamId={sp.exam}
            defaultOpen={!!sp.exam}
            configured={providers.length > 0}
            providers={providerChainLabel(providers)}
          />
        }
      />

      <section id="awaiting" className="card scroll-mt-24 p-4">
        <h2 className="text-lg font-semibold">Awaiting review ({totalDrafts})</h2>
        {withDrafts.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500">No drafts — every question bank is reviewed.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {withDrafts.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="text-slate-500">{r.vendor} · </span>
                  <span className="font-medium">{r.code}</span> — {r.title}
                </span>
                <Link href={`/admin-dashboard/exams/${r.id}#review`} className="text-[13px] font-semibold text-amber-700 hover:underline dark:text-amber-400">
                  Review {r.drafts} draft{r.drafts === 1 ? '' : 's'} →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
