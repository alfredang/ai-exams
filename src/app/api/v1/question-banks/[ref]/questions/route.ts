import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { SCOPE_QUESTIONS_WRITE, apiError, requireApiToken, resolvePracticeExam } from '@/lib/api-v1';
import { matchDomain, parseDomains } from '@/lib/question-pool';
import { validate } from '@/lib/ai-question-gen';

export const dynamic = 'force-dynamic';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * GET /api/v1/question-banks/{ref}/questions?view=stems|full&domain=&limit=&cursor=
 * `stems` (default): every question's domain + stem, to avoid repeats.
 * `full`: published questions with options, key, explanation and audit state.
 */
export async function GET(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const resolved = await resolvePracticeExam(decodeURIComponent((await params).ref));
  if ('response' in resolved) return resolved.response;
  const sp = new URL(req.url).searchParams;
  const examId = resolved.exam.examId;
  const domain = sp.get('domain') || undefined;
  if ((sp.get('view') ?? 'stems') === 'stems') {
    const rows = await db.question.findMany({ where: { examId, status: { not: 'ARCHIVED' }, ...(domain ? { domain } : {}) }, select: { domain: true, stem: true }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ exam: resolved.exam, count: rows.length, questions: rows.map((r) => ({ domain: r.domain, stem: r.stem.slice(0, 300) })) });
  }
  const limit = Math.min(200, Math.max(1, Number(sp.get('limit')) || 50));
  const cursor = sp.get('cursor') || undefined;
  const rows = await db.question.findMany({
    where: { examId, status: 'PUBLISHED', ...(domain ? { domain } : {}) },
    orderBy: { id: 'asc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, type: true, domain: true, stem: true, options: true, correct: true, explanation: true, references: true, generatedBy: true, createdAt: true, auditedAt: true, auditFlag: true }
  });
  const more = rows.length > limit;
  return NextResponse.json({ exam: resolved.exam, questions: rows.slice(0, limit), nextCursor: more ? rows[limit - 1].id : null });
}

const Body = z.object({
  /** Who wrote them, e.g. "youtube-scout" → generatedBy "agent:youtube-scout:<model>". */
  author: z.string().regex(/^[a-z0-9-]{3,40}$/),
  model: z.string().regex(/^[a-z0-9.-]{3,60}$/).default('claude-opus-5-5'),
  sourceId: z.string().optional(),
  questions: z
    .array(
      z.object({
        domain: z.string(),
        type: z.enum(['SINGLE', 'MULTI', 'TRUE_FALSE', 'ORDERING']),
        stem: z.string(),
        options: z.array(z.object({ id: z.string(), text: z.string() })),
        correct: z.array(z.string()),
        explanation: z.string(),
        difficulty: z.number().int().default(3),
        references: z.array(z.object({ label: z.string(), url: z.string() })).default([])
      })
    )
    .min(1)
    .max(25)
});

/**
 * POST /api/v1/question-banks/{ref}/questions — add up to 25 questions,
 * published straight into the pool. Each is validated (same rules as the AI
 * generator), its domain must be a blueprint domain, and exact repeats of an
 * existing stem are refused. Returns created ids and per-question rejections.
 */
export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const auth = await requireApiToken(req, SCOPE_QUESTIONS_WRITE);
  if ('response' in auth) return auth.response;
  const resolved = await resolvePracticeExam(decodeURIComponent((await params).ref));
  if ('response' in resolved) return resolved.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return apiError(`Bad request: ${parsed.error.issues[0]?.path.join('.')} ${parsed.error.issues[0]?.message}`, 400);
  const body = parsed.data;
  const examId = resolved.exam.examId;
  const exam = await db.exam.findUnique({ where: { id: examId }, select: { domains: true } });
  const blueprint = parseDomains(exam?.domains);
  if (body.sourceId && !(await db.examSource.findFirst({ where: { id: body.sourceId, examId }, select: { id: true } }))) {
    return apiError('sourceId is not a source of this question bank', 400);
  }
  const existing = await db.question.findMany({ where: { examId }, select: { stem: true } });
  const seen = new Set(existing.map((q) => norm(q.stem)));
  const generatedBy = `agent:${body.author}:${body.model}`;

  const created: { index: number; id: string }[] = [];
  const rejected: { index: number; reason: string }[] = [];
  for (const [index, q] of body.questions.entries()) {
    const domain = blueprint.length ? matchDomain(q.domain, blueprint) : q.domain.trim() || 'General';
    if (!domain || (blueprint.length && !blueprint.some((d) => d.name === domain))) {
      rejected.push({ index, reason: `domain must be one of: ${blueprint.map((d) => d.name).join(' | ')}` });
      continue;
    }
    const v = validate(q);
    if (typeof v === 'string') {
      rejected.push({ index, reason: v });
      continue;
    }
    if (seen.has(norm(v.stem))) {
      rejected.push({ index, reason: 'duplicate of a question already in the bank' });
      continue;
    }
    seen.add(norm(v.stem));
    const row = await db.question.create({
      data: { examId, domain, ...v, status: 'PUBLISHED', generatedBy, sourceId: body.sourceId ?? null },
      select: { id: true }
    });
    created.push({ index, id: row.id });
  }
  await db.adminLog.create({
    data: {
      adminId: auth.adminId,
      action: 'question.agent_add',
      targetType: 'Exam',
      targetId: examId,
      metadata: { via: 'api', author: body.author, model: body.model, sourceId: body.sourceId ?? null, created: created.length, rejected: rejected.length }
    }
  });
  if (created.length) revalidatePath(`/admin-dashboard/exams/${examId}`);
  return NextResponse.json({ exam: resolved.exam, created, rejected });
}
