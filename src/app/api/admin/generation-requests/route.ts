import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { parseDomains } from '@/lib/question-pool';
import { GEN_KINDS } from '@/lib/ai-question-gen';
import { isGithubUrl, listGenerationRequests } from '@/lib/generation-requests';

export const dynamic = 'force-dynamic';

const Body = z.object({
  examId: z.string().min(1),
  count: z.number().int().min(1).max(200),
  domains: z.array(z.string()).default([]),
  types: z.array(z.enum(['SINGLE', 'MULTI', 'ORDERING', 'TRUE_FALSE'])).default([]),
  sourceId: z.string().optional(),
  mode: z.enum(['generate', 'extract']).default('generate'),
  rephrase: z.boolean().default(true)
});

async function admin() {
  const session = await auth();
  const user = session?.user as any;
  return user?.role === 'ADMIN' ? user : null;
}

/** GET /api/admin/generation-requests[?examId=] — the latest agent requests, for the status panel. */
export async function GET(req: Request) {
  if (!(await admin())) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const examId = new URL(req.url).searchParams.get('examId') || undefined;
  return Response.json({ requests: await listGenerationRequests(examId ? { examId } : {}, 15) });
}

/**
 * POST /api/admin/generation-requests — queue a question-generation request
 * for the local AI agents (the AI Q&A Generator's path when no OpenAI API
 * key is saved). The source, if any, was already read by POST …/sources.
 */
export async function POST(req: Request) {
  const user = await admin();
  if (!user) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const body = parsed.data;
  const exam = await db.exam.findUnique({ where: { id: body.examId }, select: { id: true, poolExamId: true, domains: true } });
  if (!exam) return Response.json({ error: 'Question bank not found' }, { status: 404 });
  if (exam.poolExamId) return Response.json({ error: 'This is a retired variant — add questions to its pool exam.' }, { status: 400 });
  const blueprint = parseDomains(exam.domains);
  const domains = blueprint.length ? [...new Set(body.domains)].filter((d) => blueprint.some((b) => b.name === d)) : [];
  if (body.domains.length && blueprint.length && !domains.length) return Response.json({ error: 'Pick at least one exam domain' }, { status: 400 });
  const source = body.sourceId
    ? await db.examSource.findFirst({ where: { id: body.sourceId, examId: exam.id }, select: { id: true, urls: true, content: true } })
    : null;
  if (body.sourceId && !source?.content) return Response.json({ error: 'Source not found — read it again.' }, { status: 404 });
  const urls = Array.isArray(source?.urls) ? (source!.urls as unknown[]).filter((u): u is string => typeof u === 'string') : [];
  const types = body.types.length === GEN_KINDS.length ? [] : [...new Set(body.types)];

  const row = await db.generationRequest.create({
    data: {
      examId: exam.id,
      requestedById: user.id,
      sourceId: source?.id ?? null,
      mode: source ? body.mode : 'generate',
      // Question repos on GitHub are often copied exam content: never keep their wording.
      rephrase: body.rephrase || urls.some(isGithubUrl),
      count: body.count,
      types,
      domains
    },
    select: { id: true }
  });
  await db.adminLog.create({
    data: {
      adminId: user.id,
      action: 'question.generation_request',
      targetType: 'Exam',
      targetId: exam.id,
      metadata: { requestId: row.id, count: body.count, mode: source ? body.mode : 'generate', sourceId: source?.id ?? null, types, domains }
    }
  });
  return Response.json({ id: row.id });
}
