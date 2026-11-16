import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { finalizeAttempt } from '@/lib/finalize-attempt';
import { mobileError, requireMobileUser } from '@/lib/mobile-auth';

const Body = z.object({ attemptId: z.string() });

export async function POST(req: Request) {
  try {
    const auth = await requireMobileUser(req);
    if ('response' in auth) return auth.response;
    const { attemptId } = Body.parse(await req.json());

    const attempt = await db.attempt.findUnique({ where: { id: attemptId } });
    if (!attempt || attempt.userId !== auth.user.id) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (attempt.submittedAt) return NextResponse.json({ ok: true, attemptId, score: attempt.score, passed: attempt.passed });

    const result = await finalizeAttempt(attempt.id);
    if (!result) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    const { score, passed, correctCount, total, perDomain } = result;
    return NextResponse.json({ ok: true, attemptId, score, passed, correctCount, total, perDomain });
  } catch (error) {
    return mobileError(error);
  }
}
