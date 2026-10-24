import type { Mode } from '@prisma/client';
import { db } from './db';
import { drawAttemptQuestions, hasPracticeAccess, resolvePoolExam } from './question-pool';

/**
 * Create a practice- or exam-mode attempt on the certification's pool exam
 * (a retired variant id resolves to it). Returns null without access or
 * when the pool is empty. Fresh domain-weighted draw on every attempt.
 */
export async function createAttempt(userId: string, examId: string, mode: Mode): Promise<string | null> {
  const exam = await resolvePoolExam(db, examId);
  if (!exam || exam.deletedAt || !(await hasPracticeAccess(db, userId, exam.id))) return null;
  const ids = await drawAttemptQuestions(db, exam);
  if (ids.length === 0) return null;
  const att = await db.attempt.create({
    data: {
      optionShuffleVersion: 1,
      userId, examId: exam.id, mode, questionIds: ids,
      durationSec: mode === 'EXAM' ? exam.durationMinutes * 60 : 0,
      expiresAt: mode === 'EXAM' ? new Date(Date.now() + exam.durationMinutes * 60_000) : null,
      responses: {}
    }
  });
  return att.id;
}

/**
 * The dashboard's one-click start: reopen the newest unfinished attempt in
 * this mode (an exam-mode one only while its timer is still running),
 * otherwise start a fresh one.
 */
export async function resumeOrCreateAttempt(userId: string, examId: string, mode: Mode): Promise<string | null> {
  const exam = await resolvePoolExam(db, examId);
  if (!exam) return null;
  const open = await db.attempt.findFirst({
    where: {
      userId, examId: exam.id, mode, isTeaser: false, submittedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
    },
    orderBy: { startedAt: 'desc' },
    select: { id: true }
  });
  return open?.id ?? createAttempt(userId, exam.id, mode);
}
