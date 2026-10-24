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
  urls: z.array(z.string().url()).min(1).max(10),
  domain: z.string().default('General'),
  count: z.number().int().min(1).max(25).default(5),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).default(3),
  type: z.enum(['SINGLE', 'MULTI', 'TRUE_FALSE']).default('SINGLE'),
  publish: z.boolean().optional() // ignored — questions auto-publish
});

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 });

  const body = Body.parse(await req.json());
  const exam = await db.exam.findUnique({ where: { id: body.examId }, include: { vendor: true } });
  if (!exam) return new Response('Exam not found', { status: 404 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      try {
        send('init', { phase: 'scrape', urls: body.urls.length });
        const { text, meta } = await extractFromUrls(body.urls);
        if (!text.trim()) {
          send('error', { message: 'Firecrawl returned no content for the supplied URLs.' });
          controller.close();
          return;
        }
        const chunks = chunkBySection(text, 5000);
        const sourceRow = await db.examSource.create({
          data: {
            examId: body.examId,
            kind: 'URL',
            label: meta.urls?.map((u: any) => u.title || u.url).join(' · ') || body.urls.join(' · '),
            urls: body.urls,
            importedById: user.id
          }
        });
        send('source', { sourceId: sourceRow.id, chunks: chunks.length });

        let issued = 0;
        for (let i = 0; i < chunks.length && issued < body.count; i++) {
          send('chunk', { i: i + 1, of: chunks.length });
          const input: GenerateInput = {
            vendor: exam.vendor.name,
            certification: exam.title,
            examCode: exam.code,
            domain: body.domain,
            domainWeights: (exam.domains as any[]) || [],
            count: Math.min(body.count - issued, 5),
            difficulty: body.difficulty,
            type: body.type,
            sourceExcerpt: chunks[i],
            sourceLabel: sourceRow.label
          };
          for await (const ev of streamGenerateQuestions(input)) {
            if (ev.type === 'question') {
              const created = await db.question.create({
                data: {
                  examId: body.examId,
                  stem: ev.question.stem,
                  type: ev.question.type,
                  options: ev.question.options,
                  correct: ev.question.correct,
                  explanation: ev.question.explanation,
                  domain: ev.question.domain,
                  difficulty: ev.question.difficulty,
                  references: ev.question.references,
                  status: 'PUBLISHED', // auto-publish: added questions join the pool
                  generatedBy: 'claude:from-urls',
                  sourceId: sourceRow.id
                }
              });
              issued++;
              send('question', { id: created.id, ...ev.question });
              if (issued >= body.count) break;
            } else if (ev.type === 'error') {
              send('warn', { message: ev.message });
            }
          }
        }
        await db.adminLog.create({
          data: {
            adminId: user.id,
            action: 'exam.generate-from-urls',
            targetType: 'Exam',
            targetId: body.examId,
            metadata: { sourceId: sourceRow.id, urls: body.urls, requested: body.count, issued }
          }
        });
        send('done', { total: issued });
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
