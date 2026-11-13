import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isAnswerCorrect, type Responses } from '@/lib/attempts';
import { optionsForAttempt } from '@/lib/shuffle';
import { explanationForDisplay } from '@/lib/explanation-format';

const Body = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  answer: z.array(z.string()).default([]),
  flagged: z.boolean().optional(),
  timeSpent: z.number().optional()
});

export async function POST(req: Request) {
  const data = Body.parse(await req.json());
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  const attempt = await db.attempt.findUnique({ where: { id: data.attemptId } });
  if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });

  // Authorize: signed-in user matches OR guest cookie matches
  if (attempt.userId) {
    if (attempt.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } else {
    const gt = (await cookies()).get('gt')?.value;
    if (!gt || gt !== attempt.guestToken) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (attempt.submittedAt) return NextResponse.json({ error: 'Already submitted' }, { status: 400 });

  const question = await db.question.findUnique({ where: { id: data.questionId } });
  if (!question || question.examId !== attempt.examId) return NextResponse.json({ error: 'Question not in exam' }, { status: 400 });
  // Scope the answer API to the attempt's own question set. Without this,
  // an attempt holder (notably an anonymous teaser holder) can POST any
  // PUBLISHED question of the exam and receive `correct` / `explanation` /
  // `references` back — exfiltrating the full paid question bank's answers
  // from a free teaser. (Teaser-audit M3.)
  if (!attempt.questionIds.includes(data.questionId)) {
    return NextResponse.json({ error: 'Question not in this attempt' }, { status: 400 });
  }

  const correct = isAnswerCorrect(question, data.answer);

  const prev = (attempt.responses as Responses) || {};
  const next: Responses = {
    ...prev,
    [data.questionId]: {
      answer: data.answer,
      flagged: data.flagged ?? prev[data.questionId]?.flagged,
      timeSpent: data.timeSpent ?? prev[data.questionId]?.timeSpent
    }
  };

  await db.attempt.update({
    where: { id: attempt.id },
    data: { responses: next as any, lastSavedAt: new Date() }
  });

  if (attempt.mode === 'PRACTICE') {
    // The explanation's option letters are written against the authored
    // order; rewrite them to the shuffled order this attempt shows.
    const authored = (question.options as { id: string; text: string }[]) || [];
    const shown = optionsForAttempt(authored, question.type, (question.correct as string[]) || [], attempt.id, question.id, attempt.optionShuffleVersion);
    return NextResponse.json({
      saved: true,
      isCorrect: correct,
      correct: question.correct,
      explanation: explanationForDisplay(question.explanation, question.type, authored, shown),
      references: question.references
    });
  }
  return NextResponse.json({ saved: true });
}
