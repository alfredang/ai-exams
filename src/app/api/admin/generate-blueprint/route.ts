import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { streamGenerateQuestions, type GenerateInput } from '@/lib/claude';
import { extractFromUrls } from '@/lib/sources/extract';
import { chunkBySection } from '@/lib/sources/chunk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  examId: z.string(),
  totalCount: z.number().int().min(10).max(120).default(60),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).default(3),
  type: z.enum(['SINGLE', 'MULTI', 'TRUE_FALSE']).default('SINGLE'),
  publish: z.boolean().optional() // ignored — questions auto-publish
});

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 });

  const body = Body.parse(await req.json());
  const exam = await db.exam.findUnique({
    where: { id: body.examId },
    include: { vendor: true }
  });
  if (!exam) return new Response('Exam not found', { status: 404 });
  const domains = (exam.domains as { name: string; weight: number }[]) || [];
  if (!exam.infoUrl) return new Response('Exam has no infoUrl — set it first', { status: 400 });
  if (domains.length === 0 || domains.reduce((s, d) => s + d.weight, 0) === 0) {
    return new Response('Exam has no domain blueprint with non-zero weights', { status: 400 });
  }

  // Compute quotas + reconcile rounding so they sum to totalCount exactly.
  const quotas = domains.map((d) => ({ name: d.name, count: Math.round((d.weight / 100) * body.totalCount) }));
  let drift = body.totalCount - quotas.reduce((s, q) => s + q.count, 0);
  let i = 0;
  while (drift !== 0 && quotas.length) {
    quotas[i % quotas.length].count += drift > 0 ? 1 : -1;
    drift += drift > 0 ? -1 : 1;
    i++;
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      try {
        send('init', { totalCount: body.totalCount, domains: quotas });
        send('phase', { msg: `Scraping ${exam.infoUrl}…` });
        const { text, meta } = await extractFromUrls([exam.infoUrl!]);
        if (!text.trim()) {
          send('error', { message: 'Firecrawl returned no content for infoUrl' });
          controller.close();
          return;
        }
        const sourceRow = await db.examSource.create({
          data: {
            examId: exam.id,
            kind: 'URL',
            label: meta.urls?.map((u: any) => u.title || u.url).join(' · ') || exam.infoUrl!,
            urls: [exam.infoUrl!],
            importedById: user.id
          }
        });
        send('source', { sourceId: sourceRow.id });

        // For long source documents we split once and reuse the same chunks
        // for every domain — Claude knows to filter by the focus domain.
        const chunks = chunkBySection(text, 5000);
        const primary = chunks[0]; // first chunk is usually the blueprint table

        let totalIssued = 0;
        for (const quota of quotas) {
          if (quota.count <= 0) continue;
          send('domain', { name: quota.name, target: quota.count });
          let issued = 0;
          let chunkIdx = 0;
          while (issued < quota.count && chunkIdx < chunks.length) {
            const remaining = quota.count - issued;
            const input: GenerateInput = {
              vendor: exam.vendor.name,
              certification: exam.title,
              examCode: exam.code,
              domain: quota.name,
              domainWeights: domains,
              count: Math.min(remaining, 5),
              difficulty: body.difficulty,
              type: body.type,
              sourceExcerpt: chunks[chunkIdx] || primary,
              sourceLabel: exam.infoUrl ?? undefined
            };
            for await (const ev of streamGenerateQuestions(input)) {
              if (ev.type === 'question') {
                const created = await db.question.create({
                  data: {
                    examId: exam.id,
                    stem: ev.question.stem,
                    type: ev.question.type,
                    options: ev.question.options,
                    correct: ev.question.correct,
                    explanation: ev.question.explanation,
                    domain: quota.name,
                    difficulty: ev.question.difficulty,
                    references: ev.question.references,
                    status: 'PUBLISHED', // auto-publish: added questions join the pool
                    generatedBy: 'claude:blueprint',
                    sourceId: sourceRow.id
                  }
                });
                issued++;
                totalIssued++;
                send('question', { ...ev.question, id: created.id, domain: quota.name });
                if (issued >= quota.count) break;
              } else if (ev.type === 'error') {
                send('warn', { domain: quota.name, message: ev.message });
              }
            }
            chunkIdx++;
          }
          send('domain.done', { name: quota.name, issued });
        }

        await db.adminLog.create({
          data: {
            adminId: user.id,
            action: 'exam.generate-blueprint',
            targetType: 'Exam',
            targetId: exam.id,
            metadata: { requested: body.totalCount, issued: totalIssued, quotas }
          }
        });
        send('done', { total: totalIssued });
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
