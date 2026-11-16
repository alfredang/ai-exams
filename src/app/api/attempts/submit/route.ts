import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { finalizeAttempt } from '@/lib/finalize-attempt';

const Body = z.object({ attemptId: z.string() });

export async function POST(req: Request) {
  const { attemptId } = Body.parse(await req.json());
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  const attempt = await db.attempt.findUnique({ where: { id: attemptId }, select: { userId: true, guestToken: true, submittedAt: true } });
  if (!attempt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (attempt.userId) {
    if (attempt.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } else {
    const gt = (await cookies()).get('gt')?.value;
    if (!gt || gt !== attempt.guestToken) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (attempt.submittedAt) return NextResponse.json({ ok: true, attemptId });

  const result = await finalizeAttempt(attemptId);
  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, attemptId, score: result.score, passed: result.passed });
}
