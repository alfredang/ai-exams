import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { scoreAttempt, type Responses } from '@/lib/attempts';
import { renderAttemptReportPdf } from '@/lib/pdf/attempt-report';

export const runtime = 'nodejs';

// Download the practice-exam summary (score, domain breakdown, every question
// with answers, explanation and exam domain) as a PDF. Same access rule as
// /results/[attemptId]: the signed-in owner, or the guest holding its token.
export async function GET(_req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const gt = (await cookies()).get('gt')?.value;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { vendor: true } } }
  });
  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const allowed = attempt.userId ? attempt.userId === userId : !!gt && gt === attempt.guestToken;
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!attempt.submittedAt) return NextResponse.json({ error: 'Attempt not submitted yet' }, { status: 409 });

  const questions = await db.question.findMany({ where: { id: { in: attempt.questionIds } } });
  const ordered = attempt.questionIds.map(id => questions.find(q => q.id === id)!).filter(Boolean);
  const responses = (attempt.responses as Responses) || {};
  const { score, correctCount, total, perDomain } = scoreAttempt(ordered, responses);
  const elapsed = Math.max(0, Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000));
  const timeUsedSec = attempt.mode === 'EXAM' && attempt.exam.durationMinutes
    ? Math.min(elapsed, attempt.exam.durationMinutes * 60)
    : elapsed;

  const pdf = await renderAttemptReportPdf({
    attemptId: attempt.id,
    examTitle: attempt.exam.title,
    examCode: attempt.exam.code,
    vendorName: attempt.exam.vendor.name,
    mode: attempt.mode,
    submittedAt: attempt.submittedAt,
    timeUsedSec,
    passingScore: attempt.exam.passingScore,
    score,
    correctCount,
    total,
    passed: attempt.passed ?? score >= attempt.exam.passingScore,
    perDomain,
    questions: ordered,
    responses
  });
  const date = attempt.submittedAt.toISOString().slice(0, 10);
  const filename = `${attempt.exam.code}-practice-exam-summary-${date}.pdf`.replace(/[^A-Za-z0-9._-]/g, '-');
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'private, no-store'
    }
  });
}
