import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { streamGenerateQuestions, type GenerateInput } from '@/lib/claude';

const Body = z.object({
  examId: z.string(),
  domain: z.string(),
  count: z.number().int().min(1).max(25),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  type: z.enum(['SINGLE', 'MULTI', 'TRUE_FALSE']),
  examGuideUrl: z.string().url().optional()
});

export async function POST(req: Request) {
  const session = await auth();
  const user = session?.user as any;
  if (user?.role !== 'ADMIN') return new Response('Forbidden', { status: 403 });

  const body = Body.parse(await req.json());
  const exam = await db.exam.findUnique({ where: { id: body.examId }, include: { vendor: true } });
  if (!exam) return new Response('Exam not found', { status: 404 });

  const input: GenerateInput = {
    vendor: exam.vendor.name,
    certification: exam.title,
    examCode: exam.code,
    domain: body.domain,
    domainWeights: (exam.domains as any[]) || [],
    count: body.count,
    difficulty: body.difficulty,
    type: body.type,
    examGuideUrl: body.examGuideUrl
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };
      try {
        for await (const ev of streamGenerateQuestions(input)) {
          if (ev.type === 'question') {
            // Auto-publish straight into the pool; the admin can Remove it
            const created = await db.question.create({
              data: {
                examId: exam.id,
                stem: ev.question.stem,
                type: ev.question.type,
                options: ev.question.options,
                correct: ev.question.correct,
                explanation: ev.question.explanation,
                domain: ev.question.domain,
                difficulty: ev.question.difficulty,
                references: ev.question.references,
                status: 'PUBLISHED',
                generatedBy: 'claude-sonnet-4-6'
              }
            });
            send('question', { id: created.id, ...ev.question });
          } else {
            send(ev.type, ev);
          }
        }
        await db.adminLog.create({
          data: { adminId: user.id, action: 'GENERATE_QUESTIONS', targetType: 'Exam', targetId: exam.id, metadata: body }
        });
      } catch (e: any) {
        send('error', { message: e?.message || 'Stream failed' });
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
