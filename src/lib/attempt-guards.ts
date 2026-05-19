import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Attempt } from '@prisma/client';
import type { Responses } from '@/lib/attempts';

export type MutableAttempt = Pick<
  Attempt,
  'userId' | 'guestToken' | 'submittedAt' | 'expiresAt' | 'mode' | 'questionIds'
>;

export async function rejectUnauthorizedAttempt(attempt: Pick<Attempt, 'userId' | 'guestToken'>, userId?: string) {
  if (attempt.userId) {
    return attempt.userId === userId ? null : NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const guestToken = (await cookies()).get('gt')?.value;
  if (!guestToken || guestToken !== attempt.guestToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export function isAttemptExpired(attempt: Pick<Attempt, 'mode' | 'expiresAt'>, now = new Date()) {
  return attempt.mode === 'EXAM' && !!attempt.expiresAt && attempt.expiresAt.getTime() <= now.getTime();
}

export function rejectClosedAttempt(attempt: Pick<Attempt, 'submittedAt' | 'mode' | 'expiresAt'>) {
  if (attempt.submittedAt) return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
  if (isAttemptExpired(attempt)) return NextResponse.json({ error: 'Attempt expired' }, { status: 409 });
  return null;
}

export function rejectQuestionOutsideAttempt(attempt: Pick<Attempt, 'questionIds'>, questionId: string) {
  if (!attempt.questionIds.includes(questionId)) {
    return NextResponse.json({ error: 'Question not in attempt' }, { status: 400 });
  }
  return null;
}

export function hasOnlyAttemptQuestions(attempt: Pick<Attempt, 'questionIds'>, responses: Responses) {
  const allowed = new Set(attempt.questionIds);
  return Object.keys(responses).every((questionId) => allowed.has(questionId));
}
