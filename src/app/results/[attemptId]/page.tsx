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

export default async function ResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
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

  return (
    <div className="container-app py-10">
      <div className="card p-8 text-center">
        <p className="text-sm text-slate-500">{attempt.exam.vendor.name} · {attempt.exam.code}</p>
        <h1 className="mt-1 text-3xl font-bold">{attempt.exam.title}</h1>
        <div className={`mt-6 inline-flex flex-col items-center rounded-full ${passed ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'} px-8 py-6`}>
          <span className="text-5xl font-bold">{score}%</span>
          <span className="text-sm font-semibold uppercase tracking-wide">{passed ? 'Pass' : 'Did not pass'}</span>
        </div>
        <p className="mt-4 text-slate-600">{correctCount} correct out of {total} · pass mark {attempt.exam.passingScore}%</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/user-dashboard" className="btn-outline">My Content</Link>
          <Link href={`/practice-exams/${attempt.exam.vendor.slug}/${attempt.exam.slug}`} className="btn-primary-grad">Back to exam</Link>
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
      <div className="mt-8 card p-6">
        <h2 className="font-semibold">Per-domain performance</h2>
        <div className="mt-3 space-y-2">
          {Object.entries(perDomain).map(([domain, d]) => {
            const pct = d.total ? Math.round((d.correct / d.total) * 100) : 0;
            return (
              <div key={domain}>
                <div className="flex justify-between text-sm">
                  <span>{domain}</span>
                  <span className="text-slate-500">{d.correct}/{d.total} · {pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full ${pct >= attempt.exam.passingScore ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-semibold">Review</h2>
      <div className="space-y-4">
        {ordered.map((q, i) => {
          const r = responses[q.id];
          const ans = r?.answer || [];
          const correct = isAnswerCorrect(q, ans);
          const correctIds = (q.correct as unknown as string[]) || [];
          // Render options in the SAME per-attempt order the taker saw in the
          // runner (TRUE_FALSE is never shuffled there). Seed format must match
          // exam-runner.tsx: `${attemptId}:${questionId}`. Scoring is id-based,
          // so this is display-only.
          const opts = (q.options as any[]) as { id: string; text: string }[];
          const displayOptions =
            q.type === 'TRUE_FALSE' ? opts : shuffleSeeded(opts, `${attempt.id}:${q.id}`);
          return (
            <div key={q.id} className="card p-5">
              <div className="mb-2 flex items-center gap-2 text-xs">
                <span className="badge">Q{i + 1}</span>
                <span className="badge">{q.domain}</span>
                <span className={`badge ${correct ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}`}>{correct ? 'Correct' : 'Incorrect'}</span>
              </div>
              <p className="font-medium">{q.stem}</p>
              {q.type === 'ORDERING' ? (
                // Every option id appears in `correct` for ORDERING, so the
                // set-based renderer below would paint them all green. What
                // matters here is POSITION: show the sequence the taker
                // submitted, flagging any step that sits in the wrong slot.
                (() => {
                  const byId = new Map(opts.map(o => [o.id, o]));
                  const submitted = ans.length ? ans : correctIds.map(() => '');
                  return (
                    <ol className="mt-2 space-y-1 text-sm">
                      {submitted.map((id, oi) => {
                        const o = byId.get(id);
                        const right = correctIds[oi] === id;
                        return (
                          <li key={`${oi}-${id}`} className={`rounded px-3 py-1 ${right ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200' : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'}`}>
                            <span className="font-semibold">{oi + 1}.</span> {o?.text ?? <em>no answer</em>}
                            {!right && (
                              <span className="ml-2 text-xs opacity-80">
                                should be #{correctIds.indexOf(id) + 1}
                              </span>
                            )}
                          </li>
                        );
                      })}
                      <li className="px-3 pt-2 text-xs text-slate-500">
                        Correct order: {correctIds.map((id, n) => `${n + 1}. ${byId.get(id)?.text ?? id}`).join('  →  ')}
                      </li>
                    </ol>
                  );
                })()
              ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {displayOptions.map((o, oi: number) => {
                  const sel = ans.includes(o.id);
                  const isC = correctIds.includes(o.id);
                  return (
                    <li key={`${oi}-${o.id}`} className={`rounded px-3 py-1 ${isC ? 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200' : sel ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200' : 'text-slate-700 dark:text-slate-300'}`}>
                      {sel ? '● ' : '○ '}{o.text}{isC ? ' ✓' : ''}
                    </li>
                  );
                })}
              </ul>
              )}
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Explanation
                </div>
                <ExplanationView
                  text={q.explanation}
                  options={displayOptions}
                  correctIds={correctIds}
                  references={(q.references as any[]) as { label: string; url: string }[]}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
