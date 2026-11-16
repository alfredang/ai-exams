import { db } from './db';
import { scoreAttempt, type Responses } from './attempts';
import { renderAttemptReportPdf } from './pdf/attempt-report';

/** Grace before the server closes an expired exam, so the runner's own
 *  auto-submit at 0:00 (and a slightly slow client clock) goes first. */
const EXPIRY_GRACE_MS = 90_000;

export type FinalizeResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  perDomain: Record<string, { correct: number; total: number }>;
  /** True only for the call that actually closed the attempt. */
  justSubmitted: boolean;
};

/**
 * Close an attempt: score it from the saved responses (never from the
 * client), stamp `submittedAt` and email the candidate their result. Safe to
 * call twice — only the call that flips `submittedAt` sends the email.
 * Every submit path (web, mobile, the expired-exam sweep) goes through here.
 */
export async function finalizeAttempt(attemptId: string, opts: { at?: Date; notify?: boolean } = {}): Promise<FinalizeResult | null> {
  const attempt = await db.attempt.findUnique({ where: { id: attemptId }, include: { exam: { select: { passingScore: true } } } });
  if (!attempt) return null;
  const questions = await db.question.findMany({
    where: { id: { in: attempt.questionIds } },
    select: { id: true, type: true, correct: true, domain: true }
  });
  const responses = (attempt.responses as Responses) || {};
  const { score, correctCount, total, perDomain } = scoreAttempt(questions, responses);
  if (attempt.submittedAt) {
    return { score, correctCount, total, perDomain, passed: attempt.passed ?? score >= attempt.exam.passingScore, justSubmitted: false };
  }
  const passed = score >= attempt.exam.passingScore;
  const { count } = await db.attempt.updateMany({
    where: { id: attemptId, submittedAt: null },
    data: { submittedAt: opts.at ?? new Date(), score, passed }
  });
  const justSubmitted = count === 1;
  const answered = Object.values(responses).some((r) => r?.answer?.length);
  if (justSubmitted && opts.notify !== false && attempt.userId && !attempt.isTeaser && answered) {
    // Never hold up (or fail) the submit on mail.
    void import('./mail')
      .then((m) => m.sendExamResultEmail(attemptId))
      .catch((err) => console.error('[exam-result-email]', attemptId, err?.message ?? err));
  }
  return { score, correctCount, total, perDomain, passed, justSubmitted };
}

/** An Exam-mode attempt whose clock ran out without a submit. */
export function isExpiredUnsubmitted(a: { mode: string; submittedAt: Date | null; expiresAt: Date | null }, now = Date.now()) {
  return a.mode === 'EXAM' && !a.submittedAt && !!a.expiresAt && a.expiresAt.getTime() + EXPIRY_GRACE_MS < now;
}

/**
 * Score the user's exams that timed out with the tab closed, asleep or after
 * "Save & exit" — the runner's auto-submit never ran, so they sat unscored
 * with no report, no review and a dead 0:00 screen. Closed at the expiry
 * time, exactly as the timer would have. Attempts with no answers at all are
 * left alone (an exam opened and abandoned is not a 0% result).
 */
export async function finalizeExpiredAttempts(userId: string): Promise<number> {
  const stale = await db.attempt.findMany({
    where: { userId, mode: 'EXAM', submittedAt: null, expiresAt: { lt: new Date(Date.now() - EXPIRY_GRACE_MS) } },
    select: { id: true, expiresAt: true, responses: true },
    take: 20
  });
  let done = 0;
  for (const a of stale) {
    const answered = Object.values((a.responses as Responses) || {}).some((r) => r?.answer?.length);
    if (!answered) continue;
    // Email only a result the candidate is still waiting for — not one for
    // an exam abandoned days ago that happens to be scored on a later visit.
    const recent = Date.now() - a.expiresAt!.getTime() < 24 * 3600_000;
    const r = await finalizeAttempt(a.id, { at: a.expiresAt!, notify: recent });
    if (r?.justSubmitted) done++;
  }
  return done;
}

/**
 * Everything the score report needs for one submitted attempt, plus the PDF
 * (questions, the taker's answers, the key, explanations and domains). Shared
 * by the download route and the result email so both are the same document.
 */
export async function buildAttemptReport(attemptId: string) {
  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { include: { vendor: true } } }
  });
  if (!attempt || !attempt.submittedAt) return null;
  const questions = await db.question.findMany({ where: { id: { in: attempt.questionIds } } });
  const ordered = attempt.questionIds.map((id) => questions.find((q) => q.id === id)!).filter(Boolean);
  const responses = (attempt.responses as Responses) || {};
  const { score, correctCount, total, perDomain } = scoreAttempt(ordered, responses);
  const elapsed = Math.max(0, Math.round((attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000));
  const timeUsedSec = attempt.mode === 'EXAM' && attempt.exam.durationMinutes
    ? Math.min(elapsed, attempt.exam.durationMinutes * 60)
    : elapsed;
  const passed = attempt.passed ?? score >= attempt.exam.passingScore;
  const submittedAt = attempt.submittedAt;
  const filename = `${attempt.exam.code}-practice-exam-summary-${submittedAt.toISOString().slice(0, 10)}.pdf`.replace(/[^A-Za-z0-9._-]/g, '-');
  const renderPdf = () =>
    renderAttemptReportPdf({
      attemptId: attempt.id,
      optionShuffleVersion: attempt.optionShuffleVersion,
      examTitle: attempt.exam.title,
      examCode: attempt.exam.code,
      vendorName: attempt.exam.vendor.name,
      mode: attempt.mode,
      submittedAt,
      timeUsedSec,
      passingScore: attempt.exam.passingScore,
      score,
      correctCount,
      total,
      passed,
      perDomain,
      questions: ordered,
      responses
    });
  return { attempt, score, correctCount, total, perDomain, passed, timeUsedSec, filename, renderPdf };
}
