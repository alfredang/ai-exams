import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SCOPE_QUESTIONS_WRITE, listPracticeExams, requireApiToken } from '@/lib/api-v1';
import { parseDomains } from '@/lib/question-pool';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/question-banks — every Practice Exam's question bank with its
 * blueprint domains, pool size, open audit flags and when the YouTube scout
 * last added to it (the scout picks the bank that waited longest).
 */
export async function GET(req: Request) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const practice = await listPracticeExams();
  const ids = practice.map((p) => p.examId);
  const [exams, counts, flags, scout] = await Promise.all([
    db.exam.findMany({ where: { id: { in: ids } }, select: { id: true, title: true, domains: true, questionCount: true } }),
    db.question.groupBy({ by: ['examId', 'domain'], where: { examId: { in: ids }, status: 'PUBLISHED' }, _count: { _all: true } }),
    db.question.groupBy({ by: ['examId'], where: { examId: { in: ids }, status: 'PUBLISHED', auditFlag: { not: null } }, _count: { _all: true } }),
    db.question.groupBy({ by: ['examId'], where: { examId: { in: ids }, generatedBy: { startsWith: 'agent:youtube-scout' } }, _max: { createdAt: true } })
  ]);
  const byId = new Map(exams.map((e) => [e.id, e]));
  const questionBanks = practice.map((p) => {
    const e = byId.get(p.examId);
    const mine = counts.filter((c) => c.examId === p.examId);
    return {
      ...p,
      certification: e?.title ?? p.title,
      questionsPerAttempt: e?.questionCount ?? null,
      published: mine.reduce((s, c) => s + c._count._all, 0),
      domains: parseDomains(e?.domains).map((d) => ({
        name: d.name,
        weight: d.weight,
        published: mine.filter((c) => c.domain === d.name).reduce((s, c) => s + c._count._all, 0)
      })),
      openAuditFlags: flags.find((f) => f.examId === p.examId)?._count._all ?? 0,
      lastScoutAddAt: scout.find((s) => s.examId === p.examId)?._max.createdAt ?? null
    };
  });
  return NextResponse.json({ questionBanks });
}
