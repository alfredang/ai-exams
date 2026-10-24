import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getOpenAI } from '@/lib/openai';
import { parseDomains, matchDomain } from '@/lib/question-pool';
import { generateDomainBatch, planDomainCounts } from '@/lib/ai-question-gen';

export const dynamic = 'force-dynamic';

const Body = z.object({
  count: z.number().int().min(1).max(200),
  /** Blueprint domain names; empty = all domains. */
  domains: z.array(z.string()).default([]),
  type: z.enum(['MIXED', 'SINGLE', 'MULTI', 'TRUE_FALSE']).default('MIXED')
});

const BATCH = 5; // questions per model call
const CONCURRENCY = 3; // model calls in flight

/**
 * POST /api/admin/exams/[id]/ai-generate — generate `count` questions with
 * OpenAI across the chosen domains (split by blueprint weight). Streams SSE:
 * `plan`, `question` (each one saved PUBLISHED), `warn`, `done`, `error`.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 });
  const { id } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const body = parsed.data;

  const exam = await db.exam.findUnique({ where: { id }, include: { vendor: true } });
  if (!exam) return Response.json({ error: 'Question bank not found' }, { status: 404 });
  let model: string;
  try {
    ({ model } = await getOpenAI());
  } catch (e: any) {
    return Response.json({ error: e?.message ?? 'OpenAI not configured' }, { status: 400 });
  }

  const blueprint = parseDomains(exam.domains);
  const chosen = blueprint.length
    ? body.domains.length
      ? blueprint.filter((d) => body.domains.includes(d.name))
      : blueprint
    : [{ name: 'General', weight: 1 }];
  if (!chosen.length) return Response.json({ error: 'Pick at least one exam domain' }, { status: 400 });
  const plan = planDomainCounts(chosen, body.count);

  // Existing stems per domain, so the model steers away from repeats.
  const existing = await db.question.findMany({
    where: { examId: id, status: { not: 'ARCHIVED' } },
    select: { stem: true, domain: true },
    orderBy: { createdAt: 'desc' }
  });
  const stemsFor = (domain: string) =>
    existing.filter((q) => (blueprint.length ? matchDomain(q.domain, blueprint) : q.domain) === domain).map((q) => q.stem);

  const jobs: { domain: string; count: number }[] = [];
  for (const [domain, n] of Object.entries(plan)) {
    for (let left = n; left > 0; left -= BATCH) jobs.push({ domain, count: Math.min(BATCH, left) });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      send('plan', { model, total: body.count, plan });
      let created = 0;
      let rejected = 0;
      const madeStems = new Map<string, string[]>();
      let next = 0;
      const worker = async () => {
        while (next < jobs.length) {
          const job = jobs[next++];
          const avoid = [...(madeStems.get(job.domain) ?? []), ...stemsFor(job.domain)].slice(0, 40);
          try {
            const res = await generateDomainBatch({
              vendor: exam.vendor.name,
              certification: exam.title,
              examCode: exam.code,
              blueprint,
              domain: job.domain,
              count: job.count,
              type: body.type,
              avoid
            });
            for (const q of res.questions) {
              const row = await db.question.create({
                data: {
                  examId: id,
                  stem: q.stem,
                  type: q.type,
                  domain: job.domain,
                  difficulty: q.difficulty,
                  explanation: q.explanation,
                  options: q.options,
                  correct: q.correct,
                  references: q.references,
                  status: 'PUBLISHED',
                  generatedBy: `openai:${model}`
                }
              });
              created++;
              madeStems.set(job.domain, [q.stem, ...(madeStems.get(job.domain) ?? [])]);
              send('question', { id: row.id, stem: q.stem, type: q.type, domain: job.domain, created });
            }
            rejected += res.rejected.length;
            if (res.rejected.length) send('warn', { message: `${job.domain}: skipped ${res.rejected.length} invalid (${res.rejected.join(', ')})` });
          } catch (e: any) {
            send('warn', { message: `${job.domain}: ${e?.message ?? 'generation failed'}` });
          }
        }
      };
      try {
        await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, worker));
        await db.adminLog.create({
          data: {
            adminId: user.id,
            action: 'question.ai_generate',
            targetType: 'Exam',
            targetId: id,
            metadata: { model, requested: body.count, created, rejected, type: body.type, plan }
          }
        });
        revalidatePath(`/admin-dashboard/exams/${id}`);
        revalidatePath('/admin-dashboard/exams');
        send('done', { created, requested: body.count });
      } catch (e: any) {
        send('error', { message: e?.message ?? 'Generation failed' });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      'x-accel-buffering': 'no'
    }
  });
}
