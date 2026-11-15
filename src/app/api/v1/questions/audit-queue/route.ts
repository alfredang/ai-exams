import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SCOPE_QUESTIONS_WRITE, listPracticeExams, requireApiToken } from '@/lib/api-v1';
import { examBaseTitle } from '@/lib/exam-title';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/questions/audit-queue?limit=40&examId= — the next published
 * questions for the exam-question-auditor: never-audited questions added in
 * the last 7 days first (newest first), then the rest of the never-audited
 * pool, then the longest-ago audited. Only banks a Practice Exam sells.
 */
export async function GET(req: Request) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(100, Math.max(1, Number(sp.get('limit')) || 40));
  const sold = (await listPracticeExams()).map((p) => p.examId);
  const examIds = sp.get('examId') ? sold.filter((id) => id === sp.get('examId')) : sold;
  const base = { status: 'PUBLISHED' as const, examId: { in: examIds } };
  const select = {
    id: true, examId: true, type: true, domain: true, stem: true, options: true, correct: true, explanation: true, references: true,
    generatedBy: true, createdAt: true, auditedAt: true, auditFlag: true,
    exam: { select: { code: true, title: true, vendor: { select: { name: true } } } }
  } as const;
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const fresh = await db.question.findMany({ where: { ...base, auditedAt: null, createdAt: { gte: weekAgo } }, orderBy: { createdAt: 'desc' }, take: limit, select });
  const rest = fresh.length < limit
    ? await db.question.findMany({ where: { ...base, auditedAt: null, createdAt: { lt: weekAgo } }, orderBy: { id: 'asc' }, take: limit - fresh.length, select })
    : [];
  const again = fresh.length + rest.length < limit
    ? await db.question.findMany({ where: { ...base, auditedAt: { not: null } }, orderBy: { auditedAt: 'asc' }, take: limit - fresh.length - rest.length, select })
    : [];
  const [unaudited, flagged] = await Promise.all([db.question.count({ where: { ...base, auditedAt: null } }), db.question.count({ where: { ...base, auditFlag: { not: null } } })]);
  const questions = [...fresh, ...rest, ...again].map(({ exam, ...q }) => ({
    ...q,
    exam: { code: exam.code, certification: examBaseTitle(exam.title), vendor: exam.vendor.name },
    adminUrl: `/admin-dashboard/exams/${q.examId}/questions/${q.id}`
  }));
  return NextResponse.json({ unaudited, flagged, questions });
}
