import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { qaProvider } from '@/lib/openai';
import { parseDomains, matchDomain } from '@/lib/question-pool';
import { GEN_KINDS, generateQuestionBatch, planDomainCounts, type GeneratedQuestion } from '@/lib/ai-question-gen';
import { chunkBySection } from '@/lib/sources/chunk';

export const dynamic = 'force-dynamic';
export const maxDuration = 3600;

const Body = z.object({
  count: z.number().int().min(1).max(200),
  /** Blueprint domain names; empty = all domains. */
  domains: z.array(z.string()).default([]),
  /** Question kinds; empty = all types. */
  types: z.array(z.enum(['SINGLE', 'MULTI', 'ORDERING', 'TRUE_FALSE'])).default([]),
  /** A source from POST …/sources; absent = AI generation only. */
  sourceId: z.string().optional(),
  /** extract = the questions already in the source; generate = new ones from it. */
  mode: z.enum(['generate', 'extract']).default('generate'),
  /** Extract mode: reword each extracted question. */
  rephrase: z.boolean().default(true)
});

const BATCH = 5; // new questions per model call
const EXTRACT_BATCH = 20; // extracted questions per excerpt
const CONCURRENCY = 3; // model calls in flight

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

type Job = { domains: string[]; count: number; excerpt?: string };

/**
 * POST /api/admin/exams/[id]/ai-generate — the AI Question and Answer
 * Generator (OpenAI gpt-6.1-sol). Streams SSE: `plan`, `question` (each one
 * validated, answer-key checked and PUBLISHED straight into the pool — there
 * is no review queue), `warn`, `done`, `error`.
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
  if (exam.poolExamId) return Response.json({ error: 'This is a retired variant — add questions to its pool exam.' }, { status: 400 });
  const provider = await qaProvider();
  if (!provider) return Response.json({ error: 'Add an OpenAI API key under Settings → Credentials.' }, { status: 400 });
  const source = body.sourceId
    ? await db.examSource.findFirst({ where: { id: body.sourceId, examId: id }, select: { id: true, kind: true, label: true, content: true } })
    : null;
  if (body.sourceId && !source?.content) return Response.json({ error: 'Source not found — read it again.' }, { status: 404 });
  // Every kind selected is the same as "all types".
  const types = body.types.length === GEN_KINDS.length ? [] : [...new Set(body.types)];

  const blueprint = parseDomains(exam.domains);
  const chosen = blueprint.length
    ? body.domains.length
      ? blueprint.filter((d) => body.domains.includes(d.name))
      : blueprint
    : [{ name: 'General', weight: 1 }];
  if (!chosen.length) return Response.json({ error: 'Pick at least one exam domain' }, { status: 400 });
  const chosenNames = chosen.map((d) => d.name);

  const existing = await db.question.findMany({
    where: { examId: id },
    select: { stem: true, domain: true },
    orderBy: { createdAt: 'desc' }
  });
  const seen = new Set(existing.map((q) => norm(q.stem)));
  const stemsFor = (domains: string[]) =>
    existing
      .filter((q) => domains.includes((blueprint.length ? matchDomain(q.domain, blueprint) : q.domain) ?? ''))
      .map((q) => q.stem);

  // Work list.
  const jobs: Job[] = [];
  let plan: Record<string, number> = {};
  if (!source) {
    plan = planDomainCounts(chosen, body.count);
    for (const [domain, n] of Object.entries(plan)) {
      for (let left = n; left > 0; left -= BATCH) jobs.push({ domains: [domain], count: Math.min(BATCH, left) });
    }
  } else if (body.mode === 'extract') {
    for (const excerpt of chunkBySection(source.content!, 3000)) jobs.push({ domains: chosenNames, count: EXTRACT_BATCH, excerpt });
  } else {
    // Spread the total over the excerpts by length; tiny totals use evenly spaced excerpts.
    const chunks = chunkBySection(source.content!, 5000);
    const picked = chunks.length > body.count ? chunks.filter((_, i) => i % Math.ceil(chunks.length / body.count) === 0).slice(0, body.count) : chunks;
    const total = picked.reduce((s, c) => s + c.length, 0);
    let left = body.count;
    picked.forEach((excerpt, i) => {
      const n = i === picked.length - 1 ? left : Math.min(left, Math.max(1, Math.round((body.count * excerpt.length) / total)));
      left -= n;
      for (let k = n; k > 0; k -= BATCH) jobs.push({ domains: chosenNames, count: Math.min(BATCH, k), excerpt });
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true; // the admin closed the tab; keep saving what is in flight
        }
      };
      send('plan', {
        model: `OpenAI ${provider.model}`,
        total: body.count,
        plan,
        source: source ? { label: source.label, kind: source.kind, mode: body.mode, excerpts: new Set(jobs.map((j) => j.excerpt)).size } : null
      });
      let created = 0;
      let rejected = 0;
      let fixed = 0;
      const made: string[] = [];
      let next = 0;
      const save = async (q: GeneratedQuestion, generatedBy: string) => {
        const key = norm(q.stem);
        if (seen.has(key)) return false;
        seen.add(key);
        const row = await db.question.create({
          data: {
            examId: id,
            stem: q.stem,
            type: q.type,
            domain: q.domain,
            difficulty: q.difficulty,
            explanation: q.explanation,
            options: q.options,
            correct: q.correct,
            references: q.references,
            status: 'PUBLISHED',
            generatedBy,
            sourceId: source?.id ?? null,
            aiCheckedAt: q.check ? new Date() : null,
            aiCheck: q.check ? { verdict: q.check.verdict, model: generatedBy, note: q.check.note || undefined, at: new Date().toISOString() } : undefined
          }
        });
        created++;
        if (q.check?.verdict === 'fixed') fixed++;
        made.unshift(q.stem);
        send('question', { id: row.id, stem: q.stem, type: q.type, domain: q.domain, created, verdict: q.check?.verdict ?? 'unchecked' });
        return true;
      };
      const worker = async () => {
        while (next < jobs.length && created < body.count) {
          const job = jobs[next++];
          const avoid = [...made, ...stemsFor(job.domains)].slice(0, 40);
          try {
            const res = await generateQuestionBatch({
              vendor: exam.vendor.name,
              certification: exam.title,
              examCode: exam.code,
              blueprint,
              domains: job.domains,
              count: Math.min(job.count, body.count - created),
              types,
              avoid,
              source: job.excerpt ? { label: source!.label, text: job.excerpt, mode: body.mode, rephrase: body.rephrase } : undefined
            });
            for (const q of res.questions) {
              if (created >= body.count) break;
              if (!(await save(q, res.generatedBy))) res.rejected.push('duplicate of a question already in the bank');
            }
            rejected += res.rejected.length;
            if (res.rejected.length) send('warn', { message: `${job.domains.length === 1 ? job.domains[0] : 'Source'}: skipped ${res.rejected.length} (${[...new Set(res.rejected)].join('; ')})` });
          } catch (e: any) {
            send('warn', { message: `${job.domains.length === 1 ? job.domains[0] : 'Source'}: ${e?.message ?? 'generation failed'}` });
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
            metadata: {
              model: `openai:${provider.model}`,
              requested: body.count,
              created,
              rejected,
              keyFixed: fixed,
              types,
              plan,
              source: source ? { id: source.id, kind: source.kind, label: source.label, mode: body.mode, rephrase: body.rephrase } : null
            }
          }
        });
        revalidatePath(`/admin-dashboard/exams/${id}`);
        revalidatePath('/admin-dashboard/exams');
        send('done', { created, requested: body.count, fixed });
      } catch (e: any) {
        send('error', { message: e?.message ?? 'Generation failed' });
      } finally {
        if (!closed) controller.close();
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
