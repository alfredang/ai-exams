import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { type Responses } from '@/lib/attempts';
import { mobileError, requireMobileUser } from '@/lib/mobile-auth';

const Body = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  flagged: z.boolean()
});

export async function POST(req: Request) {
  try {
    const auth = await requireMobileUser(req);
    if ('response' in auth) return auth.response;
    const data = Body.parse(await req.json());
    const attempt = await db.attempt.findUnique({ where: { id: data.attemptId } });
    if (!attempt || attempt.userId !== auth.user.id) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (!attempt.questionIds.includes(data.questionId)) return NextResponse.json({ error: 'Question not in this attempt' }, { status: 400 });

    const prev = (attempt.responses as Responses) || {};
    const next: Responses = {
      ...prev,
      [data.questionId]: {
        answer: prev[data.questionId]?.answer || [],
        timeSpent: prev[data.questionId]?.timeSpent,
        flagged: data.flagged
      }
    };
    await db.attempt.update({ where: { id: attempt.id }, data: { responses: next as any, lastSavedAt: new Date() } });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return mobileError(error);
  }
}
