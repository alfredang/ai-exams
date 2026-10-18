import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isAnswerCorrect, scoreAttempt, type Responses } from '@/lib/attempts';
import { ExplanationView } from '@/components/explanation-view';
import { ShareScore } from '@/components/share-score';
import { ReviewFormModal } from '@/components/review-form-modal';
import { ResultsSignupPrompt } from '@/components/results-signup-prompt';
import { canUserReview } from '@/lib/reviews';
import { shuffleSeeded } from '@/lib/shuffle';

const LETTERS = 'ABCDEFGHIJ';

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
  const missedOnly = (await searchParams).view === 'missed';
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

  return (
    <div className="min-h-full bg-canvas dark:bg-slate-950">
      <div className="mx-auto grid max-w-[980px] gap-6 px-4 pb-16 pt-8 sm:px-6">
        <div className="eyebrow">{attempt.exam.vendor.name} · {attempt.exam.code} · {attempt.mode === 'EXAM' ? 'Exam mode' : 'Practice mode'}</div>

        {/* Score card */}
        <section className="card -mt-3 grid items-center gap-2 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8 sm:p-8">
          <div className="font-display text-[clamp(64px,14vw,104px)] font-extrabold leading-none tabular-nums">
            {correctCount}<small className="text-[0.38em] font-bold text-muted"> / {total}</small>
          </div>
          <div className="min-w-0">
            <div className="eyebrow">
              Your score · {score}% · pass mark {attempt.exam.passingScore}% · time used {fmtDuration(timeUsed)}
            </div>
            <h1 className="mt-1.5 text-[clamp(26px,5vw,36px)] font-extrabold">{band.name}</h1>
            <p className="mt-1.5 text-lg">{band.text}</p>
            <p className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${passed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'}`}>
              {passed ? 'Above the pass mark' : 'Below the pass mark'}
            </p>
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

        <ShareScore attemptId={attempt.id} examTitle={`${attempt.exam.vendor.name} ${attempt.exam.code}`} score={score} passed={passed} />

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

        {/* Answer review */}
        <section>
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Answer review</h2>
            <div className="flex gap-2">
              <Link
                href={`/results/${attempt.id}`}
                scroll={false}
                className={`rounded-full border px-3.5 py-1.5 text-sm ${!missedOnly ? 'border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-ink' : 'border-line bg-white dark:border-slate-700 dark:bg-slate-900'}`}
              >All {total}</Link>
              <Link
                href={`/results/${attempt.id}?view=missed`}
                scroll={false}
                className={`rounded-full border px-3.5 py-1.5 text-sm ${missedOnly ? 'border-ink bg-ink text-white dark:border-white dark:bg-white dark:text-ink' : 'border-line bg-white dark:border-slate-700 dark:bg-slate-900'}`}
              >Missed only · {missedCount}</Link>
            </div>
          </div>
          <div className="grid gap-3.5">
            {missedOnly && missedCount === 0 && <p className="text-muted">No missed questions to show.</p>}
            {ordered.map((q, i) => {
              const r = responses[q.id];
              const ans = r?.answer || [];
              const correct = isAnswerCorrect(q, ans);
              if (missedOnly && correct) return null;
              const skipped = ans.length === 0;
              const correctIds = (q.correct as unknown as string[]) || [];
              // Render options in the SAME per-attempt order the taker saw in the
              // runner (TRUE_FALSE is never shuffled there). Seed format must match
              // exam-runner.tsx: `${attemptId}:${questionId}`. Scoring is id-based,
              // so this is display-only.
              const opts = (q.options as any[]) as { id: string; text: string }[];
              const displayOptions =
                q.type === 'TRUE_FALSE' ? opts : shuffleSeeded(opts, `${attempt.id}:${q.id}`);
              const lettered = (ids: string[]) =>
                displayOptions
                  .map((o, oi) => ({ ...o, letter: LETTERS[oi] }))
                  .filter(o => ids.includes(o.id));
              const status = correct ? 'Correct' : skipped ? 'Unanswered' : 'Incorrect';
              const accent = correct ? 'border-l-emerald-700' : skipped ? 'border-l-amber-500' : 'border-l-red-600';
              return (
                <article key={q.id} className={`min-w-0 rounded-md border border-l-[5px] border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${accent}`}>
                  <div className="eyebrow">Q{i + 1} · {status} · {q.domain}</div>
                  <h3 className="mb-3 mt-1 font-sans text-[17px] font-semibold leading-snug">{q.stem}</h3>
                  {q.type === 'ORDERING' ? (
                    // Every option id appears in `correct` for ORDERING, so the
                    // letter-based lines below would mark them all right. What
                    // matters here is POSITION: show the sequence the taker
                    // submitted, flagging any step that sits in the wrong slot.
                    (() => {
                      const byId = new Map(opts.map(o => [o.id, o]));
                      const submitted = ans.length ? ans : correctIds.map(() => '');
                      return (
                        <ol className="mb-3 grid gap-1.5 text-sm">
                          {submitted.map((id, oi) => {
                            const o = byId.get(id);
                            const right = correctIds[oi] === id;
                            return (
                              <li key={`${oi}-${id}`} className={`rounded border px-3 py-1.5 ${right ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' : 'border-red-600 bg-red-50 dark:bg-red-950/40'}`}>
                                <span className="font-semibold">{oi + 1}.</span> {o?.text ?? <em>no answer</em>}
                                {!right && <span className="ml-2 text-xs opacity-80">should be #{correctIds.indexOf(id) + 1}</span>}
                              </li>
                            );
                          })}
                          <li className="px-1 pt-1 text-xs text-muted">
                            Correct order: {correctIds.map((id, n) => `${n + 1}. ${byId.get(id)?.text ?? id}`).join('  →  ')}
                          </li>
                        </ol>
                      );
                    })()
                  ) : (
                    <div className="mb-3 grid gap-1.5">
                      {!correct && !skipped && lettered(ans).map(o => (
                        <div key={`y-${o.id}`} className="rounded border border-red-600 bg-red-50 px-3 py-2 [overflow-wrap:anywhere] dark:bg-red-950/40">
                          <b>Your answer {o.letter}.</b> {o.text}
                        </div>
                      ))}
                      {lettered(correctIds).map(o => (
                        <div key={`c-${o.id}`} className="rounded border border-emerald-700 bg-emerald-50 px-3 py-2 [overflow-wrap:anywhere] dark:bg-emerald-950/40">
                          <b>{correct ? 'Your answer' : 'Correct answer'} {o.letter}.</b> {o.text}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-[15px] text-muted dark:text-slate-400">
                    <ExplanationView
                      text={q.explanation}
                      options={displayOptions}
                      correctIds={correctIds}
                      references={(q.references as any[]) as { label: string; url: string }[]}
                      hideCorrectTitle={q.type !== 'ORDERING'}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <Link href={`/practice-exams/${attempt.exam.vendor.slug}/${attempt.exam.slug}`} className="btn-primary">Retake exam</Link>
          <Link href="/user-dashboard" className="btn-outline">My dashboard</Link>
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
      </div>
    </div>
  );
}
