import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireMobileUser, mobileError } from '@/lib/mobile-auth';

const Body = z.object({
  examId: z.string(),
  mode: z.enum(['PRACTICE', 'EXAM']),
  teaser: z.boolean().optional()
});

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: Request) {
  try {
    const auth = await requireMobileUser(req);
    if ('response' in auth) return auth.response;
    const data = Body.parse(await req.json());

    const exam = await db.exam.findUnique({ where: { id: data.examId } });
    if (!exam || exam.deletedAt) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    if (!data.teaser) {
      const ent = await db.entitlement.findFirst({
        where: { userId: auth.user.id, examId: exam.id, tier: { in: ['PRACTICE', 'BUNDLE', 'VOUCHER', 'ADMIN_GRANT'] } }
      });
      if (!ent) return NextResponse.json({ error: 'Exam access required' }, { status: 403 });
    }

    const allPublished = await db.question.findMany({
      where: { examId: exam.id, status: 'PUBLISHED' },
      select: { id: true, isTeaser: true }
    });
    if (allPublished.length === 0) return NextResponse.json({ error: 'No questions available' }, { status: 400 });

    const ids = data.teaser
      ? shuffle([
          ...allPublished.filter((q) => q.isTeaser).map((q) => q.id),
          ...allPublished.filter((q) => !q.isTeaser).map((q) => q.id)
        ]).slice(0, 10)
      : shuffle(allPublished.map((q) => q.id)).slice(0, exam.questionCount);

    const attempt = await db.attempt.create({
      data: {
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
