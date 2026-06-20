import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { scoreAttempt, type Responses } from '@/lib/attempts';
import { mobileError, requireMobileUser } from '@/lib/mobile-auth';

const Body = z.object({ attemptId: z.string() });

export async function POST(req: Request) {
  try {
    const auth = await requireMobileUser(req);
    if ('response' in auth) return auth.response;
    const { attemptId } = Body.parse(await req.json());

    const attempt = await db.attempt.findUnique({ where: { id: attemptId }, include: { exam: true } });
    if (!attempt || attempt.userId !== auth.user.id) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (attempt.submittedAt) return NextResponse.json({ ok: true, attemptId, score: attempt.score, passed: attempt.passed });

    const questions = await db.question.findMany({
      where: { id: { in: attempt.questionIds } },
      select: { id: true, type: true, correct: true, domain: true }
    });
    const { score, correctCount, total, perDomain } = scoreAttempt(questions, (attempt.responses as Responses) || {});
    const passed = score >= attempt.exam.passingScore;

    await db.attempt.update({ where: { id: attempt.id }, data: { submittedAt: new Date(), score, passed } });
    return NextResponse.json({ ok: true, attemptId, score, passed, correctCount, total, perDomain });
  } catch (error) {
    return mobileError(error);
  }
}
