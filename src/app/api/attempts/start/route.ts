import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { drawAttemptQuestions, hasPracticeAccess, resolvePoolExam } from '@/lib/question-pool';
import { needsFullName } from '@/lib/full-name';

const Body = z.object({
  examId: z.string(),
  mode: z.enum(['PRACTICE', 'EXAM']),
  teaser: z.boolean().optional()
});

export async function POST(req: Request) {
  const data = Body.parse(await req.json());
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  // Retired "Practice Exam N" variants resolve to the certification's pool exam.
  const exam = await resolvePoolExam(db, data.examId);
  if (!exam || exam.deletedAt) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

  // Access control
  let guestToken: string | undefined;
  if (data.teaser) {
    // Teasers run on any exam a published product sells, even when the exam
    // row itself is hidden from the catalog.
    if (!exam.published) {
      const sold = await db.bundleItem.findFirst({ where: { examId: exam.id, bundle: { published: true } }, select: { id: true } });
      if (!sold) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }
    if (!userId) {
      const c = await cookies();
      guestToken = c.get('gt')?.value;
      if (!guestToken) {
        guestToken = `g_${crypto.randomUUID()}`;
        c.set('gt', guestToken, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' });
      }
    }
  } else {
    if (!userId) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    // Practice or voucher purchase (the voucher includes the practice exam), or an admin grant.
    if (!(await hasPracticeAccess(db, userId, exam.id))) return NextResponse.json({ error: 'Purchase required' }, { status: 402 });
    if (await needsFullName(userId, (session?.user as any)?.impersonatedBy)) {
      return NextResponse.json({ error: 'Enter your full name before starting', needsFullName: true, href: `/complete-profile?examId=${exam.id}&mode=${data.mode}` }, { status: 403 });
    }
  }

  let teaserLimit = 10;
  if (data.teaser) {
    const { getTeaserSize } = await import('@/lib/settings');
    teaserLimit = await getTeaserSize();
  }
  // Fresh domain-weighted draw from the pool on every attempt (retakes included).
  const ids = await drawAttemptQuestions(db, exam, { teaser: data.teaser, count: data.teaser ? teaserLimit : exam.questionCount });
  if (ids.length === 0) return NextResponse.json({ error: 'No questions available' }, { status: 400 });

  const attempt = await db.attempt.create({
    data: {
      userId: userId ?? null,
      guestToken: !userId ? guestToken : null,
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
}
