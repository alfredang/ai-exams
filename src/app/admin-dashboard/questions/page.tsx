import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { qaProvider } from '@/lib/openai';
import { examBaseTitle } from '@/lib/exam-title';
import { matchDomain, parseDomains } from '@/lib/question-pool';
import { ScoutSection } from '@/components/admin/scout-section';
import { AiGenerateDialog, type GeneratorExam } from '@/components/admin/ai-question-generator';
import { GeneratorBoard } from '@/components/admin/generation-requests-panel';
import { listGenerationRequests } from '@/lib/generation-requests';

export const dynamic = 'force-dynamic';

/**
 * AI Question and Answer Generator: pick an exam and a source (AI generation,
 * YouTube link, GitHub or web link, or PDF) in the Get sources pop-up; AI
 * extracts or writes the questions, gives each its answer key and publishes
 * them into that bank's pool (Auto publish, the default) or holds them as
 * "Awaiting review" (Review first). Without an OpenAI API key the
 * pop-up queues the request for the local AI agents (Agent requests panel,
 * src/lib/generation-requests.ts). Below: the Scouting agent section.
 * `?exam=<id>` opens the pop-up on that exam.
 */
export default async function AiQuestionGeneratorPage({ searchParams }: { searchParams: Promise<{ exam?: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/');
  const sp = await searchParams;
  const monthAgo = new Date(Date.now() - 30 * 86_400_000);

  // Pool exams only — retired variants (poolExamId set) never get new questions.
  const [exams, counts, provider, scout, requests, drafts, scoutRows, scoutSource] = await Promise.all([
    db.exam.findMany({
      where: { poolExamId: null },
      select: { id: true, code: true, title: true, domains: true, vendor: { select: { name: true } } },
      orderBy: [{ vendor: { name: 'asc' } }, { code: 'asc' }]
    }),
    db.question.groupBy({ by: ['examId', 'domain'], where: { status: 'PUBLISHED' }, _count: { _all: true } }),
    qaProvider(),
    db.question.groupBy({ by: ['examId'], where: { generatedBy: { startsWith: 'agent:youtube-scout' }, createdAt: { gte: monthAgo } }, _count: { _all: true }, _max: { createdAt: true } }),
    listGenerationRequests({}, 15),
    // Review mode: questions held as DRAFT until an admin publishes them.
    db.question.groupBy({ by: ['examId'], where: { status: 'DRAFT' }, _count: { _all: true }, orderBy: { _count: { examId: 'desc' } } }),
    db.question.findMany({
      where: { generatedBy: { startsWith: 'agent:youtube-scout' } },
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: { id: true, examId: true, domain: true, stem: true, createdAt: true, source: { select: { label: true, urls: true } } }
    }),
    // A YouTube transcript read in the last 45 minutes with no questions yet = the scout is writing now.
    db.examSource.findFirst({
      where: { kind: 'YOUTUBE', createdAt: { gte: new Date(Date.now() - 45 * 60_000) }, questions: { none: {} }, generationRequests: { none: {} } },
      orderBy: { createdAt: 'desc' },
      select: { examId: true, label: true }
    })
  ]);
  const reviewCount = drafts.reduce((s, d) => s + d._count._all, 0);

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
  const scoutCerts = scout
    .map((c) => ({ examId: c.examId, code: byId.get(c.examId)?.code ?? c.examId, title: byId.get(c.examId)?.title ?? '', added: c._count._all, last: c._max.createdAt?.toISOString() ?? null }))
    .sort((a, b) => (b.last ?? '').localeCompare(a.last ?? ''));
  const scoutQuestions = scoutRows.map((q) => ({
    id: q.id,
    examId: q.examId,
    code: byId.get(q.examId)?.code ?? '',
    domain: q.domain,
    stem: q.stem,
    createdAt: q.createdAt.toISOString(),
    source: q.source ? { label: q.source.label, url: Array.isArray(q.source.urls) && typeof q.source.urls[0] === 'string' ? (q.source.urls[0] as string) : null } : null
  }));
  const scoutNow = scoutSource ? { code: byId.get(scoutSource.examId)?.code ?? '', label: scoutSource.label } : null;
  const published = rows.reduce((sum, r) => sum + r.pool, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-h1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          AI Question and Answer Generator
        </h1>
        <p className="text-sm text-slate-500">
          Click Get sources, pick the exam, the number of questions and a source — a YouTube link, a GitHub or web link, a PDF, or AI
          generation alone. AI extracts the questions in the source (and can rephrase them) or writes new ones, gives each one its answer
          key, and publishes them straight into the pool — or holds them for your review. Certification not listed?{' '}
          <Link href="/admin-dashboard/exams/new" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            + Create Practice Exam
          </Link>{' '}
          first — it creates the question bank that AI then fills.
        </p>
      </div>

      <GeneratorBoard
        initial={requests}
        published={published}
        agents={!provider}
        review={reviewCount ? { count: reviewCount, href: `/admin-dashboard/exams/${drafts[0].examId}?qstatus=DRAFT#questions` } : undefined}
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

      {drafts.length > 1 && (
        <section className="card p-4">
          <h2 className="text-lg font-semibold">Awaiting review ({reviewCount.toLocaleString()})</h2>
          <p className="text-xs text-slate-500">Questions generated in Review first mode. They are not in any exam until you publish them.</p>
          <ul className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-800">
            {drafts.map((d) => (
              <li key={d.examId} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-medium">{byId.get(d.examId)?.code ?? d.examId}</span> — {byId.get(d.examId)?.title ?? ''}
                </span>
                <Link href={`/admin-dashboard/exams/${d.examId}?qstatus=DRAFT#questions`} className="text-[13px] font-semibold text-amber-700 hover:underline dark:text-amber-400">
                  Review {d._count._all} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ScoutSection certifications={scoutCerts} questions={scoutQuestions} inProgress={scoutNow} />
    </div>
  );
}
