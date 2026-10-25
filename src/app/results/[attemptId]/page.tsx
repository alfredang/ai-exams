import { cookies } from 'next/headers';
import Link from 'next/link';
import { CheckCircle2, Download, RotateCcw, XCircle } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isAnswerCorrect, scoreAttempt, type Responses } from '@/lib/attempts';
import { ExplanationView } from '@/components/explanation-view';
import { ReviewFormModal } from '@/components/review-form-modal';
import { ResultsSignupPrompt } from '@/components/results-signup-prompt';
import { UserChrome } from '@/components/user-chrome';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { canUserReview } from '@/lib/reviews';
import { sequencingSteps, optionsForAttempt } from '@/lib/shuffle';
import { createAttempt } from '@/lib/start-attempt';
import { requireFullNameToStart } from '@/lib/full-name';

const LETTERS = 'ABCDEFGHIJ';

type ReviewView = 'all' | 'missed' | 'flagged';

const PILL_TONES = {
  ok: 'border-emerald-700 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300',
  bad: 'border-red-600 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/50 dark:text-red-300',
  flag: 'border-amber-600 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-300',
  muted: 'border-slate-400 text-muted dark:border-slate-600'
};

function Pill({ tone, children }: { tone: keyof typeof PILL_TONES; children: React.ReactNode }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-xs ${PILL_TONES[tone]}`}>
      {children}
    </span>
  );
}

// Starts a fresh attempt at the same exam and mode and drops the taker
// straight into the runner. Teasers go through the teaser route (it owns the
// guest cookie); anyone without an entitlement falls back to the exam page.
function TakeAgainButton({ examId, mode, teaser, examHref }: {
  examId: string;
  mode: 'PRACTICE' | 'EXAM';
  teaser: boolean;
  examHref: string;
}) {
  if (teaser) {
    return (
      <form action={`${examHref}/teaser`} method="post">
        <button className="btn-primary gap-1.5"><RotateCcw className="h-4 w-4" aria-hidden /> Retake exam</button>
      </form>
    );
  }
  return (
    <form action={async () => {
      'use server';
      const s = await auth();
      const uid = (s?.user as any)?.id as string | undefined;
      await requireFullNameToStart(s, examId, mode);
      // A retake is a fresh domain-weighted draw from the pool — old
      // attempts on a retired variant retake the certification's pool exam.
      const id = uid ? await createAttempt(uid, examId, mode) : null;
      redirect(id ? `/exam/${id}` : examHref);
    }}>
      <button className="btn-primary gap-1.5"><RotateCcw className="h-4 w-4" aria-hidden /> Retake exam</button>
    </form>
  );
}

// Readiness bands scale the mock-exam reading table (0–6 / 7–9 / 10–12 /
// 13–15 out of 15) to any exam length, so a 15-question mock reproduces it
// exactly and a 60-question exam uses the same proportions.
function readinessBands(total: number) {
  const at = (n: number) => Math.ceil((total * n) / 15);
  const comfortable = at(13), close = at(10), study = at(7);
  return [
    { min: 0, max: study - 1, name: 'Start from the blueprint', text: 'Begin with the official exam guide and its objectives before testing again.' },
    { min: study, max: close - 1, name: 'More study needed', text: 'Return to the study material for your weakest domains before testing again.' },
    { min: close, max: comfortable - 1, name: 'Close', text: 'Work the domains where you lost points, then retake this exam.' },
    { min: comfortable, max: total, name: 'Comfortable', text: 'Review anything you missed and book the exam.' }
  ];
}

function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, '0'), ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default async function ResultsPage({
  params,
  searchParams
}: {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { attemptId } = await params;
  const rawView = (await searchParams).view;
  const view: ReviewView = rawView === 'missed' || rawView === 'flagged' ? rawView : 'all';
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const gt = (await cookies()).get('gt')?.value;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { vendor: true } } }
  });
  if (!attempt) notFound();
  if (attempt.userId) {
    if (attempt.userId !== userId) redirect('/login');
  } else {
    if (!gt || gt !== attempt.guestToken) redirect('/login');
  }
  if (!attempt.submittedAt) redirect(`/exam/${attempt.id}`);

  const questions = await db.question.findMany({
    where: { id: { in: attempt.questionIds } }
  });
  const ordered = attempt.questionIds.map(id => questions.find(q => q.id === id)!).filter(Boolean);
  const responses = (attempt.responses as Responses) || {};
  const { score, correctCount, total, perDomain } = scoreAttempt(ordered, responses);
  const passed = attempt.passed ?? score >= attempt.exam.passingScore;
  // Run the two userId-gated lookups in parallel — saves ~100ms vs the
  // previous sequential awaits.
  const [canReview, existingReview] = userId
    ? await Promise.all([
        canUserReview(userId, attempt.examId),
        db.review.findUnique({
          where: { userId_examId: { userId, examId: attempt.examId } },
          select: { rating: true, title: true, body: true, status: true }
        })
      ])
    : [false, null];

  const bands = readinessBands(total);
  const band = [...bands].reverse().find(b => correctCount >= b.min) ?? bands[0];
  const elapsed = Math.max(0, Math.round(((attempt.submittedAt?.getTime() ?? Date.now()) - attempt.startedAt.getTime()) / 1000));
  const timeUsed = attempt.mode === 'EXAM' && attempt.exam.durationMinutes
    ? Math.min(elapsed, attempt.exam.durationMinutes * 60)
    : elapsed;
  // Weakest domains first so the study target leads the list.
  const domains = Object.entries(perDomain).sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total);
  const missedCount = total - correctCount;
  const flaggedCount = ordered.filter(q => responses[q.id]?.flagged).length;

  const report = (
    <div className={userId ? '' : 'min-h-full bg-canvas/60 dark:bg-transparent'}>
      <div className={`mx-auto grid max-w-[980px] gap-6 ${userId ? '' : 'px-4 pb-16 pt-8 sm:px-6'}`}>
        <div className="eyebrow">{attempt.exam.vendor.name} · {attempt.exam.code} · {attempt.mode === 'EXAM' ? 'Exam mode' : 'Practice mode'}</div>

        {/* Score card */}
        <section className="card -mt-3 grid items-center gap-2 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8 sm:p-8">
          <div className="font-display text-[clamp(64px,14vw,104px)] font-extrabold leading-none tabular-nums">
            {correctCount}<small className="text-[0.38em] font-bold text-muted"> / {total}</small>
          </div>
          <div className="min-w-0">
            {/* Pass / fail leads, like a real score report. */}
            <h1 className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-lg px-4 py-1.5 font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-wide text-white ${passed ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-red-600 dark:bg-red-500'}`}>
                {passed ? <CheckCircle2 className="h-8 w-8" aria-hidden /> : <XCircle className="h-8 w-8" aria-hidden />}
                {passed ? 'PASS' : 'FAIL'}
              </span>
              <span className="text-lg font-semibold">
                {score}% <span className="font-normal text-muted">· pass mark {attempt.exam.passingScore}%</span>
              </span>
            </h1>
            <div className="eyebrow mt-3">Time used {fmtDuration(timeUsed)} · Readiness</div>
            <h2 className="mt-1 text-[clamp(22px,4vw,28px)] font-extrabold">{band.name}</h2>
            <p className="mt-1 text-lg">{band.text}</p>
          </div>
        </section>

        {/* Readiness scale */}
        <div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" aria-label="Readiness scale">
            {bands.map(b => (
              <div
                key={b.name}
                aria-current={b === band ? 'true' : undefined}
                className={`rounded border p-2 text-center text-xs ${b === band ? 'border-brand bg-brand font-semibold text-white' : 'border-line text-muted dark:border-slate-700'}`}
              >
                <span className="font-mono">{b.min}–{b.max}</span><br />{b.name}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-muted">
            The scale is a study aid, not a predictor. The real exam is scored on its own scale and draws from a much larger item pool.
          </p>
        </div>

        {/* The report's only action bar. Navigation (dashboard, exam
            history) lives in the sidebar, so it isn't repeated here. */}
        <div className="flex flex-wrap items-center gap-2">
          <TakeAgainButton
            examId={attempt.examId}
            mode={attempt.mode}
            teaser={attempt.isTeaser}
            examHref={`/practice-exams/${attempt.exam.vendor.slug}/${attempt.exam.slug}`}
          />
          <a
            href={`/api/results/${attempt.id}/pdf`}
            className="btn-outline inline-flex items-center gap-2"
            title="Questions, answers, explanations and domains"
            download
          >
            <Download className="h-4 w-4" /> Download summary (PDF)
          </a>
          {canReview && (
            <ReviewFormModal
              examId={attempt.examId}
              examTitle={attempt.exam.title}
              attemptId={attempt.id}
              existing={existingReview as any}
              trigger={<span className="btn-outline">{existingReview ? 'Edit your review' : 'Leave a review'}</span>}
            />
          )}
        </div>

        {/* Anonymous guest who submitted the teaser without converting in
            the in-attempt modal lands here. Give them a second chance to
            create an account — same TEASER_GATE OTP flow, but the post-
            verify redirect points back at this results page so they keep
            the score they're looking at. Only renders for anonymous
            (no userId), teaser-mode, guest-token-owned attempts. */}
        {!userId && attempt.isTeaser && attempt.guestToken && (
          <ResultsSignupPrompt
            attemptId={attempt.id}
            examSlug={attempt.exam.slug}
            vendorSlug={attempt.exam.vendor.slug}
            count={total}
          />
        )}

        {/* Per-domain breakdown */}
        <section className="card p-6">
          <h2 className="text-xl font-bold">By domain</h2>
          <p className="mb-4 mt-1 text-[13px] text-muted">Two or more misses in one domain marks it as your next study target.</p>
          <div className="grid gap-3.5">
            {domains.map(([domain, d]) => {
              const weak = d.total - d.correct >= 2;
              const pct = d.total ? (d.correct / d.total) * 100 : 0;
              return (
                <div key={domain} className="grid grid-cols-[minmax(0,1fr)_64px] items-center gap-x-3 gap-y-1">
                  <span className="font-medium [overflow-wrap:anywhere]">
                    {domain}
                    {weak && <span className="ml-2 font-mono text-xs text-red-700 dark:text-red-400">NEXT STUDY TARGET</span>}
                  </span>
                  <span className="text-right font-mono tabular-nums">{d.correct} / {d.total}</span>
                  <div className="col-span-2 h-2 overflow-hidden rounded bg-line dark:bg-slate-800">
                    <div className={`h-full ${weak ? 'bg-red-600' : 'bg-emerald-700'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Answer review — every option listed, the right one marked green
            and the taker's wrong pick red, then the explanation under WHY. */}
        <section>
          <h2 className="mb-3.5 text-xl font-bold">Review your answers</h2>
          <div className="mb-3.5 flex flex-wrap gap-2">
            {([
              ['all', `All ${total}`],
              ['missed', `Missed or blank · ${missedCount}`],
              ['flagged', `Flagged · ${flaggedCount}`]
            ] as const).map(([key, label]) => (
              <Link
                key={key}
                href={key === 'all' ? `/results/${attempt.id}` : `/results/${attempt.id}?view=${key}`}
                scroll={false}
                aria-current={view === key ? 'true' : undefined}
                className={`inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm ${view === key ? 'border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-line bg-white hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900'}`}
              >{label}</Link>
            ))}
          </div>
          <div className="grid gap-3.5">
            {((view === 'missed' && missedCount === 0) || (view === 'flagged' && flaggedCount === 0)) && (
              <p className="text-muted">Nothing to show for this filter.</p>
            )}
            {ordered.map((q, i) => {
              const r = responses[q.id];
              const ans = r?.answer || [];
              const flagged = !!r?.flagged;
              const correct = isAnswerCorrect(q, ans);
              if (view === 'missed' && correct) return null;
              if (view === 'flagged' && !flagged) return null;
              const skipped = ans.length === 0;
              const correctIds = (q.correct as unknown as string[]) || [];
              // Render options in the SAME per-attempt order the taker saw in the
              // runner, preserving layouts of historical attempts. Scoring is
              // id-based, so this is display-only.
              const opts = (q.options as any[]) as { id: string; text: string }[];
              const displayOptions =
                optionsForAttempt(opts, q.type, correctIds, attempt.id, q.id, attempt.optionShuffleVersion);
              return (
                <article key={q.id} className="card min-w-0 p-5 sm:p-6">
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="eyebrow">Question {i + 1}</span>
                    <span className="flex gap-1.5">
                      {correct ? <Pill tone="ok">Correct</Pill> : skipped ? <Pill tone="muted">Unanswered</Pill> : <Pill tone="bad">Missed</Pill>}
                      {flagged && <Pill tone="flag">Flagged</Pill>}
                    </span>
                  </div>
                  <h3 className="mb-4 max-w-[62ch] font-sans text-lg font-semibold leading-snug sm:text-xl">{q.stem}</h3>
                  {q.type === 'ORDERING' ? (
                    // Every option id appears in `correct` for ORDERING, so the
                    // per-option marks below would flag them all right. What
                    // matters here is POSITION: show the sequence the taker
                    // submitted, flagging any step that sits in the wrong slot.
                    (() => {
                      const byId = new Map(opts.map(o => [o.id, o]));
                      // Same fixed Step 1…N numbering the runner showed.
                      const steps = sequencingSteps(opts, correctIds, q.id);
                      const stepNo = (id: string) => steps.findIndex(o => o.id === id) + 1;
                      const submitted = ans.length ? ans : correctIds.map(() => '');
                      return (
                        <ol className="mb-3 grid gap-1.5 text-sm">
                          {submitted.map((id, oi) => {
                            const o = byId.get(id);
                            const right = correctIds[oi] === id;
                            return (
                              <li key={`${oi}-${id}`} className={`rounded border px-3 py-1.5 ${right ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' : 'border-red-600 bg-red-50 dark:bg-red-950/40'}`}>
                                <span className="font-semibold">{oi + 1}.</span> {o ? <><span className="font-mono text-xs">[Step {stepNo(id)}]</span> {o.text}</> : <em>no answer</em>}
                                {!right && o && <span className="ml-2 text-xs opacity-80">should be position {correctIds.indexOf(id) + 1}</span>}
                              </li>
                            );
                          })}
                          <li className="px-1 pt-1 font-mono text-xs text-muted">
                            {ans.length > 0 && <>Your sequence: {ans.map(stepNo).join(' → ')} · </>}Correct sequence: {correctIds.map(stepNo).join(' → ')}
                          </li>
                        </ol>
                      );
                    })()
                  ) : (
                    <div className="grid gap-2">
                      {displayOptions.map((o, oi) => {
                        const isRight = correctIds.includes(o.id);
                        const isWrongPick = !isRight && ans.includes(o.id);
                        return (
                          <div
                            key={o.id}
                            className={`grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-2.5 rounded-lg border px-3.5 py-3 ${
                              isRight
                                ? 'border-emerald-700 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/40'
                                : isWrongPick
                                  ? 'border-red-600 bg-red-50 dark:border-red-500 dark:bg-red-950/40'
                                  : 'border-line dark:border-slate-700'
                            }`}
                          >
                            <span className="font-mono font-semibold">{LETTERS[oi]}</span>
                            <span className="[overflow-wrap:anywhere]">{o.text}</span>
                            {isRight ? <Pill tone="ok">Correct</Pill> : isWrongPick ? <Pill tone="bad">Your answer</Pill> : <span />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Answer key: the exam domain leads, then the explanation. */}
                  <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/60 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="eyebrow">Exam domain</span>
                      <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-white [overflow-wrap:anywhere] dark:bg-brand-500">
                        {q.domain || 'Not tagged'}
                      </span>
                    </div>
                    <div className="eyebrow mb-1">Why</div>
                    <ExplanationView
                      text={q.explanation}
                      options={displayOptions}
                      correctIds={correctIds}
                      references={q.references}
                      hideCorrectTitle={q.type !== 'ORDERING'}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );

  // Signed-in takers read the report inside the dashboard, with Exam history
  // highlighted in the sidebar; anonymous teaser guests get it bare.
  if (!userId) return report;
  return (
    <>
      <ImpersonationBanner />
      <UserChrome>{report}</UserChrome>
    </>
  );
}
