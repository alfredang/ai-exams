import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireMobileUser } from '@/lib/mobile-auth';
import { scoreAttempt, type Responses } from '@/lib/attempts';
import { optionsForAttempt, sequencingSteps } from '@/lib/shuffle';

export async function GET(req: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const auth = await requireMobileUser(req);
  if ('response' in auth) return auth.response;
  const { attemptId } = await params;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { vendor: true } } }
  });
  if (!attempt || attempt.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  const questions = await db.question.findMany({
    where: { id: { in: attempt.questionIds } },
    select: {
      id: true,
      stem: true,
      type: true,
      options: true,
      domain: true,
      correct: true,
      explanation: true,
      references: true
    }
  });
  const byId = new Map(questions.map((question) => [question.id, question]));
  const ordered = attempt.questionIds.map((id) => byId.get(id)).filter(Boolean);
  const responses = (attempt.responses as Responses) || {};
  const submitted = !!attempt.submittedAt;
  const includeReview = submitted;
  const scored = submitted ? scoreAttempt(questions, responses) : null;

  return NextResponse.json({
    attempt: {
      id: attempt.id,
      mode: attempt.mode,
      isTeaser: attempt.isTeaser,
      startedAt: attempt.startedAt.toISOString(),
      submittedAt: attempt.submittedAt?.toISOString() ?? null,
      expiresAt: attempt.expiresAt?.toISOString() ?? null,
      durationSec: attempt.durationSec,
      // Seconds left on an Exam-mode clock, from the server's expiresAt.
      remainingSec: attempt.expiresAt ? Math.max(0, Math.floor((attempt.expiresAt.getTime() - Date.now()) / 1000)) : null,
      score: attempt.score,
      passed: attempt.passed,
      responses
    },
    exam: {
      id: attempt.exam.id,
      title: attempt.exam.title,
      code: attempt.exam.code,
      vendorName: attempt.exam.vendor.name,
      passingScore: attempt.exam.passingScore
    },
    questions: ordered.map((question) => ({
      id: question!.id,
      stem: question!.stem,
      type: question!.type,
      domain: question!.domain,
      // Same per-attempt order as the web runner.
      options: optionsForAttempt(
        question!.options as { id: string; text: string }[], question!.type,
        question!.correct as string[], attempt.id, question!.id, attempt.optionShuffleVersion
      ),
      // MULTI: how many options to pick ("Select TWO answers").
      selectCount: question!.type === 'MULTI' ? (question!.correct as string[]).length : null,
      // ORDERING: steps in their fixed Step 1…N labelling; the answer is the
      // sequence of step ids.
      steps: question!.type === 'ORDERING'
        ? sequencingSteps(question!.options as { id: string; text: string }[], question!.correct as string[], question!.id)
        : null,
      ...(includeReview
        ? {
            correct: question!.correct,
            explanation: question!.explanation,
            references: question!.references
          }
        : {})
    })),
    result: scored
  });
}
