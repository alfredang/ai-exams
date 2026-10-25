import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ExamShell } from './exam-shell';
import type { Responses } from '@/lib/attempts';
import { sequencingSteps, optionsForAttempt } from '@/lib/shuffle';
import { drawAttemptQuestions, resolvePoolExam } from '@/lib/question-pool';
import { startBlocker } from '@/lib/full-name';

export default async function ExamAttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const gt = (await cookies()).get('gt')?.value;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { vendor: true } } }
  });
  if (!attempt) notFound();
  // Authorize
  if (attempt.userId) {
    if (attempt.userId !== userId) redirect('/login');
  } else {
    if (!gt || attempt.guestToken !== gt) redirect('/login');
  }
  if (attempt.submittedAt) redirect(`/results/${attempt.id}`);
  // Full attempts need a verified email and a real name on file (score
  // reports, vouchers); the free teaser needs neither.
  if (!attempt.isTeaser && userId && await startBlocker(userId, (session?.user as any)?.impersonatedBy)) {
    redirect(`/complete-profile?next=${encodeURIComponent(`/exam/${attempt.id}`)}`);
  }

  // Recompute remaining for Exam mode
  let remaining = 0;
  if (attempt.mode === 'EXAM' && attempt.expiresAt) {
    // Server-render timestamp is required to hand the runner an accurate countdown.
    // eslint-disable-next-line react-hooks/purity
    remaining = Math.max(0, Math.floor((attempt.expiresAt.getTime() - Date.now()) / 1000));
  }

  // `correct` is read only to number sequencing steps and count MULTI picks —
  // it is never sent to the client.
  const select = { id: true, stem: true, type: true, options: true, domain: true, correct: true } as const;
  let questionIds = attempt.questionIds;
  let responses = (attempt.responses as Responses) || {};
  let questions = await db.question.findMany({ where: { id: { in: questionIds } }, select });
  if (questions.length === 0 && questionIds.length > 0) {
    // Every question this attempt drew has since been re-seeded (seeds delete
    // and recreate by tag, minting new ids). Re-draw the same number from the
    // current pool so the attempt can continue instead of crashing the runner.
    const pool = await resolvePoolExam(db, attempt.examId);
    const fresh = pool
      ? await drawAttemptQuestions(db, pool, { teaser: attempt.isTeaser, count: questionIds.length })
      : [];
    if (fresh.length === 0) notFound();
    await db.attempt.update({ where: { id: attempt.id }, data: { examId: pool!.id, questionIds: fresh, responses: {} } });
    questionIds = fresh;
    responses = {};
    questions = await db.question.findMany({ where: { id: { in: questionIds } }, select });
  }
  const ordered = questionIds.map(id => questions.find(q => q.id === id)!).filter(Boolean);

  const runnerQuestions = ordered.map(q => {
    const options = (q.options as any[]).map(o => ({ id: String(o.id), text: String(o.text) }));
    const correct = ((q.correct as unknown as string[]) || []).map(String);
    return {
      id: q.id,
      stem: q.stem,
      type: q.type as 'SINGLE' | 'MULTI' | 'TRUE_FALSE' | 'ORDERING',
      options: q.type === 'ORDERING' ? sequencingSteps(options, correct, q.id) : options,
      initialOptions: optionsForAttempt(options, q.type, correct, attempt.id, q.id, attempt.optionShuffleVersion),
      domain: q.domain ?? undefined,
      selectCount: q.type === 'MULTI' ? correct.length : undefined
    };
  });

  return (
    <ExamShell
      attemptId={attempt.id}
      mode={attempt.mode}
      isTeaser={attempt.isTeaser}
      examTitle={attempt.exam.title}
      examVendor={attempt.exam.vendor.name}
      examSlug={attempt.exam.slug}
      vendorSlug={attempt.exam.vendor.slug}
      questions={runnerQuestions}
      remainingSec={remaining}
      initialResponses={responses}
      isGuest={!attempt.userId}
      examModeSwitch={attempt.mode === 'PRACTICE' && attempt.userId && !attempt.isTeaser
        ? { examId: attempt.examId, durationMinutes: attempt.exam.durationMinutes }
        : undefined}
    />
  );
}
