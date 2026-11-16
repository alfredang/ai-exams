import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Flag, Sparkles, Youtube } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { qaProvider } from '@/lib/openai';
import { examBaseTitle } from '@/lib/exam-title';
import { matchDomain, parseDomains } from '@/lib/question-pool';
import { answerCheckProgress } from '@/lib/answer-check-job';
import { QuestionFlow } from '@/components/admin/question-flow';
import { AnswerCheckPanel } from '@/components/admin/answer-check-panel';
import { AiGenerateDialog, type GeneratorExam } from '@/components/admin/ai-question-generator';
import { GenerationRequestsPanel } from '@/components/admin/generation-requests-panel';
import { listGenerationRequests } from '@/lib/generation-requests';

export const dynamic = 'force-dynamic';

/**
 * AI Question and Answer Generator: pick an exam and a source (AI generation,
 * YouTube link, web link or PDF) in the AI Generate pop-up; OpenAI gpt-6.1-sol
 * extracts or writes the questions, checks each answer key and publishes them
 * into that bank's pool (no review queue). Without an OpenAI API key the
 * pop-up queues the request for the local AI agents (Agent requests panel,
 * src/lib/generation-requests.ts). Below: the pool-wide answer-key
 * check, the auditor agent's open flags and the YouTube scout's recent adds.
 * `?exam=<id>` opens the pop-up on that exam.
 */
export default async function AiQuestionGeneratorPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const sp = await searchParams;
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  // Pool exams only — retired variants (poolExamId set) never get new questions.
  const [exams, counts, provider, progress, flags, scout, requests] = await Promise.all([
    db.exam.findMany({
      where: { poolExamId: null },
      select: { id: true, code: true, title: true, domains: true, vendor: { select: { name: true } } },
      orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }]
    }),
    db.question.groupBy({ by: ['examId', 'domain'], where: { status: 'PUBLISHED' }, _count: { _all: true } }),
    qaProvider(),
    answerCheckProgress(null),
    db.question.groupBy({ by: ['examId', 'auditFlag'], where: { status: 'PUBLISHED', auditFlag: { not: null } }, _count: { _all: true } }),
    db.question.groupBy({ by: ['examId'], where: { generatedBy: { startsWith: 'agent:youtube-scout' }, createdAt: { gte: weekAgo } }, _count: { _all: true }, _max: { createdAt: true } }),
    listGenerationRequests({}, 15)
  ]);

  const rows: GeneratorExam[] = exams.map((e) => {
    const blueprint = parseDomains(e.domains);
    const mine = counts.filter((c) => c.examId === e.id);
    const pool = new Map<string, number>();
    for (const c of mine) {
      const name = matchDomain(c.domain, blueprint);
      if (name) pool.set(name, (pool.get(name) ?? 0) + c._count._all);
    }
    return {
      id: e.id,
      code: e.code,
      title: examBaseTitle(e.title),
      vendor: e.vendor.name,
      pool: mine.reduce((s, c) => s + c._count._all, 0),
      domains: blueprint.map((d) => ({ name: d.name, weight: d.weight, pool: pool.get(d.name) ?? 0 }))
    };
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  const flagRows = [...new Set(flags.map((f) => f.examId))]
    .map((examId) => ({
      exam: byId.get(examId),
      examId,
      byFlag: Object.fromEntries(flags.filter((f) => f.examId === examId).map((f) => [f.auditFlag!, f._count._all])) as Record<string, number>
    }))
    .map((r) => ({ ...r, total: Object.values(r.byFlag).reduce((s, n) => s + n, 0) }))
    .sort((a, b) => b.total - a.total);
  const totalFlags = flagRows.reduce((s, r) => s + r.total, 0);
  const scoutRows = scout
    .map((s) => ({ exam: byId.get(s.examId), examId: s.examId, added: s._count._all, last: s._max.createdAt }))
    .sort((a, b) => (b.last?.getTime() ?? 0) - (a.last?.getTime() ?? 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-h1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          AI Question and Answer Generator
        </h1>
        <p className="text-sm text-slate-500">
          Click AI Generate, pick the exam and a source — a YouTube link, a web link, a PDF, or AI generation alone. AI extracts the
          questions in the source (and can rephrase them) or writes new ones, checks every answer key, and publishes them straight into
          the pool. Certification not listed?{' '}
          <Link href="/admin-dashboard/exams/new" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            + Create Practice Exam
          </Link>{' '}
          first — it creates the question bank that AI then fills.
        </p>
      </div>

      <QuestionFlow
        published={progress.total}
        checked={progress.checked}
        agents={!provider}
        generate={
          <AiGenerateDialog
            exams={rows}
            initialExamId={sp.exam}
            defaultOpen={!!sp.exam}
            configured={!!provider}
            providers={provider ? `OpenAI ${provider.model}` : 'OpenAI (no key)'}
          />
        }
      />

      <GenerationRequestsPanel initial={requests} />

      <AnswerCheckPanel initial={progress} configured={!!provider} />

      <section id="audit-flags" className="card scroll-mt-24 p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Flag className="h-5 w-5 text-rose-600 dark:text-rose-400" /> Audit flags ({totalFlags.toLocaleString()})
        </h2>
        <p className="text-xs text-slate-500">
          The exam-question-auditor agent (daily) highlights questions that may be wrong, outdated or ambiguous. Flags never change a
          question — edit it (which clears the flag) or clear the flag on the question bank page.
        </p>
        {flagRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No open flags.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {flagRows.map((r) => (
              <li key={r.examId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="text-slate-500">{r.exam?.vendor ?? ''} · </span>
                  <span className="font-medium">{r.exam?.code ?? r.examId}</span> — {r.exam?.title ?? ''}
                  <span className="ml-2 text-[12px] text-slate-500">
                    {Object.entries(r.byFlag).map(([f, n]) => `${n} ${f}`).join(' · ')}
                  </span>
                </span>
                <Link href={`/admin-dashboard/exams/${r.examId}?qflag=audit#questions`} className="text-[13px] font-semibold text-rose-700 hover:underline dark:text-rose-400">
                  Review {r.total} flagged →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Youtube className="h-5 w-5 text-red-600" /> YouTube scout — last 7 days
        </h2>
        <p className="text-xs text-slate-500">
          The exam-question-scout agent runs every morning at 7:00, finds a YouTube course for one certification and adds 10–20 questions
          and answers from it.
        </p>
        {scoutRows.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Nothing added in the last 7 days.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {scoutRows.map((r) => (
              <li key={r.examId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-medium">{r.exam?.code ?? r.examId}</span> — {r.exam?.title ?? ''}
                  <span className="ml-2 text-[12px] text-slate-500">{r.last?.toISOString().slice(0, 10)}</span>
                </span>
                <Link href={`/admin-dashboard/exams/${r.examId}?qsource=scout#questions`} className="text-[13px] font-medium text-brand-600 hover:underline dark:text-brand-400">
                  {r.added} added →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
