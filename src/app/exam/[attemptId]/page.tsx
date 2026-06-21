import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { ExamShell } from './exam-shell';
import type { Responses } from '@/lib/attempts';

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

  // Recompute remaining for Exam mode
  let remaining = 0;
  if (attempt.mode === 'EXAM' && attempt.expiresAt) {
    remaining = Math.max(0, Math.floor((attempt.expiresAt.getTime() - Date.now()) / 1000));
  }

  const questions = await db.question.findMany({
    where: { id: { in: attempt.questionIds } },
    select: { id: true, stem: true, type: true, options: true, domain: true }
  });
  const ordered = attempt.questionIds.map(id => questions.find(q => q.id === id)!).filter(Boolean);

  const runnerQuestions = ordered.map(q => ({
    id: q.id,
    stem: q.stem,
    type: q.type as 'SINGLE' | 'MULTI' | 'TRUE_FALSE',
    options: (q.options as any[]).map(o => ({ id: o.id, text: o.text })),
    domain: q.domain ?? undefined
  }));

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
      initialResponses={(attempt.responses as Responses) || {}}
      isGuest={!attempt.userId}
    />
  );
}
