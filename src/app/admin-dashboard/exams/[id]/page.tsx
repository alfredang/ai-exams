import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Award, CheckCircle2, Download, Flag } from 'lucide-react';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { Pager } from '@/components/admin/pager';
import { poolStats } from '@/lib/question-pool';
import { qaProvider } from '@/lib/openai';
import { answerCheckProgress } from '@/lib/answer-check-job';
import { AnswerCheckPanel } from '@/components/admin/answer-check-panel';
import { AddQuestionsPanel } from '@/components/admin/add-questions-panel';
import { QuestionForm } from '@/components/admin/question-form';
import { AiGenerateDialog } from '@/components/admin/ai-question-generator';
import { SelectAllCheckbox, SelectAllMatchingBanner, SelectedCounter } from '@/components/admin/bulk-select';
import { examBaseTitle } from '@/lib/exam-title';
import {
  QUESTION_FLAG_FILTERS, QUESTION_STATUS_FILTERS, QUESTION_STATUS_LABEL, QUESTION_TYPE_FILTERS, matchesQuestionFilter, questionPresentationType
} from '@/lib/question-presentation';
import {
  bulkQuestionAction, clearAuditFlag, createQuestion, deleteQuestion, toggleQuestionStatus
} from './question-actions';

/** Where a question came from, from its generatedBy tag. */
function sourceLabel(generatedBy: string | null): string {
  if (!generatedBy || generatedBy === 'manual') return 'Added manually';
  const agent = /^agent:([^:]+):(.+)$/.exec(generatedBy);
  if (agent) return agent[1] === 'youtube-scout' ? `YouTube scout · ${agent[2]}` : `Agent ${agent[1]} · ${agent[2]}`;
  const ai = /^(openai|deepseek|minimax):(.+)$/.exec(generatedBy);
  if (ai) return `AI · ${ai[2]}`;
  if (/^(claude|gpt)/.test(generatedBy)) return `AI · ${generatedBy}`;
  if (generatedBy === 'csv-import') return 'CSV import';
  if (generatedBy.startsWith('manual:')) return 'Seed import';
  return generatedBy;
}

export default async function EditExamPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ domain?: string; qstatus?: string; qtype?: string; qflag?: string; qpage?: string; edited?: string; bulk?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const exam = await db.exam.findUnique({
    where: { id },
    include: { vendor: true, poolExam: { select: { id: true, code: true } }, questions: { orderBy: { createdAt: 'asc' } } }
  });
  if (!exam) notFound();
  const pool = await poolStats(db, exam);

  // Question-pool browser filters (?domain=&qstatus=&qtype=), applied in memory
  // — a pool is at most a few hundred rows.
  const domainCounts = new Map<string, number>();
  for (const q of exam.questions) domainCounts.set(q.domain, (domainCounts.get(q.domain) ?? 0) + 1);
  const blueprintOrder = pool.rows.map((r) => r.name);
  const domainList = [...domainCounts.keys()].sort((a, b) => {
    const ia = blueprintOrder.indexOf(a), ib = blueprintOrder.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  const fDomain = sp.domain && domainCounts.has(sp.domain) ? sp.domain : '';
  const fStatus = QUESTION_STATUS_FILTERS.includes(sp.qstatus ?? '') ? sp.qstatus! : '';
  const fType = QUESTION_TYPE_FILTERS.includes(sp.qtype ?? '') ? sp.qtype! : '';
  const fFlag = sp.qflag && sp.qflag in QUESTION_FLAG_FILTERS ? sp.qflag : '';
  const shownQuestions = exam.questions.filter((q) => matchesQuestionFilter(q, { domain: fDomain, status: fStatus, type: fType, flag: fFlag }));
  // 30 questions per page (?qpage=); changing a filter drops back to page 1.
  const Q_PAGE_SIZE = 30;
  const qPages = Math.max(1, Math.ceil(shownQuestions.length / Q_PAGE_SIZE));
  // After an edit, open the page that holds the edited question.
  const editedIdx = sp.edited && !sp.qpage ? shownQuestions.findIndex((q) => q.id === sp.edited) : -1;
  const qPage = Math.min(qPages, Math.max(1, editedIdx >= 0 ? Math.floor(editedIdx / Q_PAGE_SIZE) + 1 : Number(sp.qpage) || 1));
  const pageStart = (qPage - 1) * Q_PAGE_SIZE;
  const pageQuestions = shownQuestions.slice(pageStart, pageStart + Q_PAGE_SIZE);
  const filterHref = (patch: Record<string, string>) => {
    const next = { domain: fDomain, qstatus: fStatus, qtype: fType, qflag: fFlag, ...patch };
    const qs = Object.entries(next).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    return `/admin-dashboard/exams/${exam.id}${qs ? `?${qs}` : ''}#questions`;
  };
  const publishedCount = exam.questions.filter((q) => q.status === 'PUBLISHED').length;
  const auditFlagged = exam.questions.filter((q) => q.status === 'PUBLISHED' && q.auditFlag).length;
  const [provider, checkProgress] = await Promise.all([qaProvider(), answerCheckProgress(exam.id)]);
  const TYPE_NAMES: Record<string, string> = { SINGLE: 'MCQ', MULTI: 'Multiple select', ORDERING: 'Sequencing', TRUE_FALSE: 'True/False', HOTSPOT: 'Hotspot' };
  const unpublishedCount = exam.questions.filter((q) => q.status === 'ARCHIVED').length;
  const BULK_FORM_ID = 'question-bulk-form';
  // Result of the last bulk action (?bulk=op:count).
  const [bulkOp, bulkCount] = (sp.bulk ?? '').split(':');
  const bulkDone = { publish: 'published', unpublish: 'unpublished', delete: 'deleted' }[bulkOp];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin-dashboard/exams" className="text-xs text-slate-500 hover:underline">
            ← Back to question banks
          </Link>
          <h1 className="admin-h1">Question Bank</h1>
          <div className="text-sm text-slate-500" title={exam.title}>{exam.vendor.name} · {exam.code} · {examBaseTitle(exam.title)}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!exam.poolExam && (
            <Link
              href={`/admin-dashboard/certifications/${exam.id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-violet-600 px-3 text-[13px] font-medium text-white hover:bg-violet-700"
              title="Exam title, code, duration, pass mark, questions per exam, domains and SEO"
            >
              <Award className="h-4 w-4" /> Certification details &amp; SEO
            </Link>
          )}
          <a
            href={`/api/admin/exams/${exam.id}/questions/export`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
        </div>
      </div>

      {exam.poolExam && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          This is a retired practice-exam variant. Its questions now live in the pool of{' '}
          <Link href={`/admin-dashboard/exams/${exam.poolExam.id}`} className="font-semibold underline">{exam.poolExam.code}</Link>.
        </p>
      )}

      {!exam.poolExam && (
        <AnswerCheckPanel
          examId={exam.id}
          initial={checkProgress}
          configured={!!provider}
          fixedHref={filterHref({ qflag: 'ai-fixed' })}
          unsureHref={filterHref({ qflag: 'ai-unsure' })}
        />
      )}

      <section id="questions" className="card scroll-mt-24 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Question pool ({exam.questions.length})</h2>
            <div className="text-xs text-slate-500">
              {publishedCount} published ·{' '}
              {unpublishedCount} unpublished ·{' '}
              {auditFlagged > 0 ? <a href={filterHref({ qflag: 'audit' })} className="font-semibold text-rose-700 hover:underline dark:text-rose-400">{auditFlagged} audit flag{auditFlagged === 1 ? '' : 's'}</a> : '0 audit flags'} ·{' '}
              each attempt draws {Math.min(exam.questionCount, pool.total)} published questions by domain · Exam mode {exam.durationMinutes} min · pass {exam.passingScore}%
            </div>
          </div>
        </div>

        <AddQuestionsPanel
          defaultOpen={exam.questions.length === 0}
          ai={
            <AiGenerateDialog
              exams={[{
                id: exam.id,
                code: exam.code,
                title: examBaseTitle(exam.title),
                vendor: exam.vendor.name,
                pool: publishedCount,
                domains: pool.rows.map((r) => ({ name: r.name, weight: r.weight, pool: r.pool }))
              }]}
              configured={!!provider}
              providers={provider ? `OpenAI ${provider.model}` : 'OpenAI (no key)'}
              triggerLabel="Generate with AI"
              triggerClassName="inline-flex h-10 items-center gap-1.5 rounded-md bg-violet-600 px-4 text-[13px] font-medium text-white shadow-sm hover:bg-violet-700"
            />
          }
          manual={
            <QuestionForm
              action={createQuestion}
              domains={blueprintOrder}
              hidden={{ examId: exam.id }}
              submitLabel="Add question"
            />
          }
        />

        {bulkDone && (
          <div role="status" className="mt-3 flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            {Number(bulkCount) > 0
              ? `${bulkCount} question${bulkCount === '1' ? '' : 's'} ${bulkDone}.`
              : `Nothing ${bulkDone} — no selected question needed it.`}
          </div>
        )}

        {exam.questions.length > 0 && (
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-14 shrink-0 font-semibold uppercase tracking-wider text-slate-500">Domain</span>
              <a href={filterHref({ domain: '' })} className={`rounded-full border px-2.5 py-1 ${!fDomain ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-blue-950/40 dark:text-brand-300' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}`}>All ({exam.questions.length})</a>
              {domainList.map((d) => (
                <a key={d} href={filterHref({ domain: d })} className={`rounded-full border px-2.5 py-1 ${fDomain === d ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-blue-950/40 dark:text-brand-300' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}`}>
                  {d} ({domainCounts.get(d)}){!blueprintOrder.includes(d) && blueprintOrder.length > 0 ? ' · not in blueprint' : ''}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-14 shrink-0 font-semibold uppercase tracking-wider text-slate-500">Status</span>
              {['', ...QUESTION_STATUS_FILTERS, ...(exam.questions.some((q) => q.status === 'DRAFT') ? ['DRAFT'] : [])].map((st) => (
                <a key={st || 'all'} href={filterHref({ qstatus: st })} className={`rounded-full border px-2.5 py-1 ${fStatus === st ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-blue-950/40 dark:text-brand-300' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}`}>
                  {st ? QUESTION_STATUS_LABEL[st] : 'All'}
                </a>
              ))}
              <span className="ml-3 w-10 shrink-0 font-semibold uppercase tracking-wider text-slate-500">Type</span>
              {['', 'SINGLE', 'MULTI', 'ORDERING', 'TRUE_FALSE'].map((t) => (
                <a key={t || 'all'} href={filterHref({ qtype: t })} className={`rounded-full border px-2.5 py-1 ${fType === t ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-blue-950/40 dark:text-brand-300' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}`}>
                  {t ? TYPE_NAMES[t] : 'All'}
                </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-14 shrink-0 font-semibold uppercase tracking-wider text-slate-500">Flags</span>
              {['', ...Object.keys(QUESTION_FLAG_FILTERS)].map((f) => (
                <a key={f || 'all'} href={filterHref({ qflag: f })} className={`rounded-full border px-2.5 py-1 ${fFlag === f ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-blue-950/40 dark:text-brand-300' : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}`}>
                  {f ? QUESTION_FLAG_FILTERS[f] : 'Any'}
                </a>
              ))}
            </div>
            <div className="text-slate-500">
              {shownQuestions.length === 0
                ? `Showing 0 of ${exam.questions.length}`
                : `Showing ${pageStart + 1}–${pageStart + pageQuestions.length} of ${shownQuestions.length}${shownQuestions.length < exam.questions.length ? ` (filtered from ${exam.questions.length})` : ''}`}
              {qPages > 1 && ` · page ${qPage} of ${qPages}`}
            </div>
          </div>
        )}

        {pageQuestions.length > 0 && (
          <form
            id={BULK_FORM_ID}
            action={bulkQuestionAction}
            data-total-matching={shownQuestions.length}
            className="sticky top-24 z-30 mt-3 flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50/95 px-3 py-2 text-[13px] shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95"
          >
            <input type="hidden" name="examId" value={exam.id} />
            {/* "Select all N matching" re-resolves the ids from these filters. */}
            <input type="hidden" name="filterDomain" value={fDomain} />
            <input type="hidden" name="filterStatus" value={fStatus} />
            <input type="hidden" name="filterType" value={fType} />
            <input type="hidden" name="filterFlag" value={fFlag} />
            <label className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
              <SelectAllCheckbox formId={BULK_FORM_ID} className="h-4 w-4 accent-brand-600" />
              Select all
            </label>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-400">
              <SelectedCounter formId={BULK_FORM_ID} /> selected
            </span>
            <SelectAllMatchingBanner formId={BULK_FORM_ID} pageCount={pageQuestions.length} totalCount={shownQuestions.length} noun="questions" />
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">With selected:</span>
            <button type="submit" name="op" value="publish" className="inline-flex h-8 items-center rounded-md bg-emerald-600 px-3 text-[13px] font-medium text-white hover:bg-emerald-700">
              Publish
            </button>
            <button type="submit" name="op" value="unpublish" className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
              Unpublish
            </button>
            <ConfirmButton
              name="op"
              value="delete"
              message={`Permanently delete the selected questions from "${exam.code}"? This cannot be undone — use Unpublish to keep them out of the pool instead.`}
              className="h-8 border border-red-300 bg-white px-3 text-[13px] dark:border-red-800 dark:bg-slate-900"
            >
              Delete
            </ConfirmButton>
          </form>
        )}

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[60rem] text-sm">
            <thead className="admin-thead">
              <tr>
                <th className="w-8 px-2 py-2 font-medium"><span className="sr-only">Select</span></th>
                <th className="w-10 px-2 py-2 font-medium">#</th>
                <th className="px-2 py-2 font-medium">Question</th>
                <th className="w-24 px-2 py-2 font-medium">Type</th>
                <th className="w-32 px-2 py-2 font-medium">Domain</th>
                <th className="w-24 px-2 py-2 font-medium">Status</th>
                <th className="w-56 px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {pageQuestions.map((q, i) => {
                const idx = pageStart + i;
                const opts = (q.options as { id: string; text: string }[]) || [];
                const correct = (q.correct as string[]) || [];
                const audit = q.audit as { verdict?: string; note?: string; suggestedAnswer?: string; sources?: string[]; by?: string; at?: string } | null;
                const check = q.aiCheck as { verdict?: string; note?: string } | null;
                return (
                  <tr
                    key={q.id}
                    id={`q-${q.id}`}
                    className={`scroll-mt-24 align-top ${
                      sp.edited === q.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/20'
                        : q.auditFlag
                          ? 'bg-rose-50 shadow-[inset_3px_0_0_0_theme(colors.rose.500)] dark:bg-rose-950/20'
                          : ''
                    }`}
                  >
                    <td className="px-2 py-2">
                      <input type="checkbox" name="ids" value={q.id} form={BULK_FORM_ID} aria-label={`Select question ${idx + 1}`} className="mt-0.5 h-4 w-4 accent-brand-600" />
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-500">{idx + 1}</td>
                    <td className="px-2 py-2">
                      {(q.auditFlag || check?.verdict === 'fixed' || check?.verdict === 'unsure' || q.generatedBy?.startsWith('agent:')) && (
                        <div className="mb-1 flex flex-wrap gap-1 text-[11px]">
                          {q.auditFlag && (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-1.5 py-0.5 font-semibold uppercase text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                              <Flag className="h-3 w-3" /> {q.auditFlag === 'wrong' ? 'May be wrong' : q.auditFlag === 'outdated' ? 'May be outdated' : 'Ambiguous'}
                            </span>
                          )}
                          {check?.verdict === 'fixed' && <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" title={check.note}>AI corrected key</span>}
                          {check?.verdict === 'unsure' && <span className="rounded bg-slate-200 px-1.5 py-0.5 font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200" title={check.note}>AI unsure</span>}
                          {q.generatedBy?.startsWith('agent:') && <span className="rounded bg-violet-50 px-1.5 py-0.5 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">{sourceLabel(q.generatedBy)}</span>}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap font-medium">{q.stem}</div>
                      {q.type === 'ORDERING' ? (
                        <>
                          <ol className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                            {opts.map((o, i) => <li key={`${i}-${o.id}`}>Step {i + 1}. {o.text}</li>)}
                          </ol>
                          <div className="mt-1 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            Correct sequence: {correct.map((c) => opts.findIndex((o) => o.id === c) + 1).join(' → ')}
                          </div>
                        </>
                      ) : (
                        <ul className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-400">
                          {opts.map((o, i) => (
                            <li key={`${i}-${o.id}`} className={correct.includes(o.id) ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}>
                              {o.id.toUpperCase()}. {o.text} {correct.includes(o.id) && '✓'}
                            </li>
                          ))}
                        </ul>
                      )}
                      {q.auditFlag && audit && (
                        <div className="mt-2 rounded border border-rose-200 bg-white px-2.5 py-2 text-[12px] text-slate-700 dark:border-rose-900/60 dark:bg-slate-900 dark:text-slate-200">
                          <span className="font-semibold text-rose-700 dark:text-rose-300">Auditor: </span>
                          {audit.note}
                          {audit.suggestedAnswer && <div className="mt-0.5"><span className="font-semibold">Suggested answer:</span> {audit.suggestedAnswer}</div>}
                          {!!audit.sources?.length && (
                            <div className="mt-0.5 flex flex-wrap gap-x-3">
                              {audit.sources.map((u) => (
                                <a key={u} href={u} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline dark:text-brand-400">{u.replace(/^https?:\/\//, '').slice(0, 60)} ↗</a>
                              ))}
                            </div>
                          )}
                          <div className="mt-0.5 text-[11px] text-slate-500">{audit.by} · {audit.at?.slice(0, 10)}</div>
                        </div>
                      )}
                      {check?.verdict === 'unsure' && check.note && (
                        <div className="mt-1 text-[11px] text-slate-500">AI check: {check.note}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-slate-500">{TYPE_NAMES[questionPresentationType(q)] ?? q.type}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-slate-500">{q.domain}</td>
                    <td className="whitespace-nowrap px-2 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase ${
                          q.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : q.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {QUESTION_STATUS_LABEL[q.status] ?? q.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        {q.type !== 'HOTSPOT' && (
                          <Link
                            href={`/admin-dashboard/exams/${exam.id}/questions/${q.id}`}
                            className="inline-flex h-8 items-center rounded-md border border-brand-300 bg-white px-2.5 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-300 dark:hover:bg-blue-950/40"
                          >
                            Edit
                          </Link>
                        )}
                        <form action={toggleQuestionStatus}>
                          <input type="hidden" name="id" value={q.id} />
                          <button
                            className="inline-flex h-8 items-center rounded-md border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            title={q.status === 'PUBLISHED' ? 'Take out of the pool (kept as Unpublished)' : 'Put into the pool'}
                          >
                            {q.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          </button>
                        </form>
                        {q.auditFlag && (
                          <form action={clearAuditFlag}>
                            <input type="hidden" name="id" value={q.id} />
                            <button
                              className="inline-flex h-8 items-center rounded-md border border-rose-300 bg-white px-2.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                              title="The question is fine — remove the audit highlight"
                            >
                              Clear flag
                            </button>
                          </form>
                        )}
                        <form action={deleteQuestion}>
                          <input type="hidden" name="id" value={q.id} />
                          <ConfirmButton message="Delete this question permanently? Use Unpublish instead to keep it out of the pool." className="h-8 border border-red-300 bg-white px-2.5 dark:border-red-800 dark:bg-slate-900">
                            Delete
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {exam.questions.length > 0 && shownQuestions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-sm text-slate-500">No questions match these filters.</td>
                </tr>
              )}
              {exam.questions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-sm text-slate-500">
                    No questions yet — use Add manually or Generate with AI above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={qPage} pages={qPages} buildHref={(p) => filterHref({ qpage: p > 1 ? String(p) : '' })} />
      </section>

    </div>
  );
}
