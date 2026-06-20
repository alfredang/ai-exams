import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { isAnswerCorrect, type Responses } from '@/lib/attempts';
import { mobileError, requireMobileUser } from '@/lib/mobile-auth';

const Body = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  answer: z.array(z.string()).default([]),
  flagged: z.boolean().optional(),
  timeSpent: z.number().optional()
});

export async function POST(req: Request) {
  try {
    const auth = await requireMobileUser(req);
    if ('response' in auth) return auth.response;
    const data = Body.parse(await req.json());

    const attempt = await db.attempt.findUnique({ where: { id: data.attemptId } });
    if (!attempt || attempt.userId !== auth.user.id) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (attempt.submittedAt) return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
    if (!attempt.questionIds.includes(data.questionId)) return NextResponse.json({ error: 'Question not in this attempt' }, { status: 400 });

    const question = await db.question.findUnique({ where: { id: data.questionId } });
    if (!question || question.examId !== attempt.examId) return NextResponse.json({ error: 'Question not in exam' }, { status: 400 });

    const prev = (attempt.responses as Responses) || {};
    const next: Responses = {
      ...prev,
      [data.questionId]: {
        answer: data.answer,
        flagged: data.flagged ?? prev[data.questionId]?.flagged,
        timeSpent: data.timeSpent ?? prev[data.questionId]?.timeSpent
      }
    };
    await db.attempt.update({ where: { id: attempt.id }, data: { responses: next as any, lastSavedAt: new Date() } });

    if (attempt.mode === 'PRACTICE') {
      return NextResponse.json({
        saved: true,
        isCorrect: isAnswerCorrect(question, data.answer),
        correct: question.correct,
        explanation: question.explanation,
        references: question.references
      });
    }
    return NextResponse.json({ saved: true });
  } catch (error) {
    return mobileError(error);
  }
}
