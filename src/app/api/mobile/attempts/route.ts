import { NextResponse } from 'next/server';
import { getAttemptHistory } from '@/lib/attempt-history';
import { requireMobileUser } from '@/lib/mobile-auth';

// Exam history for the apps: every attempt (newest first) plus a summary per
// certification — the same numbers as the website's Exam history page.
// `examId` is always the pool exam, so it matches the library's exam ids.
export async function GET(req: Request) {
  const auth = await requireMobileUser(req);
  if ('response' in auth) return auth.response;

  const { attempts, exams } = await getAttemptHistory(auth.user.id);
  return NextResponse.json({
    attempts: attempts.map((a) => ({
      ...a,
      examCode: a.examCode.replace(/-P\d+$/, ''),
      startedAt: a.startedAt.toISOString(),
      expiresAt: a.expiresAt?.toISOString() ?? null
    })),
    exams: exams.map(({ attempts: list, ...e }) => ({ ...e, attemptCount: list.length }))
  });
}
