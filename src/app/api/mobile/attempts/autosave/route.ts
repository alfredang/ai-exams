import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { mobileError, requireMobileUser } from '@/lib/mobile-auth';

const Body = z.object({
  attemptId: z.string(),
  responses: z.record(z.object({
    answer: z.array(z.string()).default([]),
    flagged: z.boolean().optional(),
    timeSpent: z.number().optional()
  }))
});

export async function POST(req: Request) {
  try {
    const auth = await requireMobileUser(req);
    if ('response' in auth) return auth.response;
    const data = Body.parse(await req.json());
    const attempt = await db.attempt.findUnique({ where: { id: data.attemptId }, select: { id: true, userId: true, submittedAt: true, questionIds: true } });
    if (!attempt || attempt.userId !== auth.user.id) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (attempt.submittedAt) return NextResponse.json({ saved: true });

    const scoped = Object.fromEntries(Object.entries(data.responses).filter(([questionId]) => attempt.questionIds.includes(questionId)));
    await db.attempt.update({ where: { id: attempt.id }, data: { responses: scoped as any, lastSavedAt: new Date() } });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return mobileError(error);
  }
}
