import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireMobileUser, mobileError } from '@/lib/mobile-auth';
import { drawAttemptQuestions, hasPracticeAccess, resolvePoolExam } from '@/lib/question-pool';

const Body = z.object({
  examId: z.string(),
  mode: z.enum(['PRACTICE', 'EXAM']),
  teaser: z.boolean().optional()
});

export async function POST(req: Request) {
  try {
    const auth = await requireMobileUser(req);
    if ('response' in auth) return auth.response;
    const data = Body.parse(await req.json());

    const exam = await resolvePoolExam(db, data.examId);
    if (!exam || exam.deletedAt) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    if (!data.teaser) {
      if (!(await hasPracticeAccess(db, auth.user.id, exam.id))) {
        return NextResponse.json({ error: 'Exam access required' }, { status: 403 });
      }
      // Mobile login already refuses unverified accounts; this covers tokens
      // issued before that rule.
      const me = await db.user.findUnique({ where: { id: auth.user.id }, select: { emailVerified: true, role: true } });
      if (me?.role === 'USER' && !me.emailVerified) {
        return NextResponse.json({ error: 'Verify your email before starting', needsVerification: true }, { status: 403 });
      }
    }

    // Fresh domain-weighted draw from the pool on every attempt (retakes included).
    const ids = await drawAttemptQuestions(db, exam, { teaser: data.teaser, count: data.teaser ? 10 : exam.questionCount });
    if (ids.length === 0) return NextResponse.json({ error: 'No questions available' }, { status: 400 });

    const attempt = await db.attempt.create({
      data: {
      optionShuffleVersion: 1,
        userId: auth.user.id,
        examId: exam.id,
        mode: data.mode,
        isTeaser: !!data.teaser,
        questionIds: ids,
        durationSec: data.mode === 'EXAM' ? exam.durationMinutes * 60 : 0,
        expiresAt: data.mode === 'EXAM' ? new Date(Date.now() + exam.durationMinutes * 60_000) : null,
        responses: {}
      }
    });

    return NextResponse.json({ attemptId: attempt.id });
  } catch (error) {
    return mobileError(error);
  }
}
